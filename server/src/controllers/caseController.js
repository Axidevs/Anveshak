const FIR = require("../models/FIR");
const Case = require("../models/Case");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

const generateCaseId = require("../services/caseIdService");
const { updateCaseStatus } = require("../services/caseLifecycleService");
const { getCaseTimeline } = require("../services/timelineService");
const { analyzeFIR } = require("../services/aiService");


// ======================================================
// CREATE CASE FROM FIR
// ======================================================

const createCaseFromFIR = async (req, res) => {
  try {
    const { firId } = req.body;

    if (!firId) {
      return res.status(400).json({
        message: "FIR ID is required",
      });
    }

    const fir = await FIR.findById(firId);

    if (!fir) {
      return res.status(404).json({
        message: "FIR not found",
      });
    }

    // Citizen can create case only from their own FIR
    if (
      req.user.role === "CITIZEN" &&
      fir.createdBy.toString() !== req.user.userId.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to create a case from this FIR",
      });
    }

    // Prevent duplicate case
    const existingCase = await Case.findOne({ firId });

    if (existingCase) {
      return res.status(409).json({
        message: "Case already exists for this FIR",
        case: existingCase,
      });
    }

    const caseId = await generateCaseId();

    const newCase = await Case.create({
      caseId,
      firId,
      citizenId: fir.createdBy,
      jurisdiction: fir.incidentLocation || null,
      status: "FIR_REGISTERED",
    });

    // Audit log
    await AuditLog.create({
      caseId,
      action: "CASE_CREATED",
      performedBy: req.user.userId,
      role: req.user.role,
      details: "Case created from FIR",
    });

    return res.status(201).json({
      message: "Case created successfully",
      case: newCase,
    });
  } catch (error) {
    console.error("Case creation failed:", error);

    return res.status(500).json({
      message: "Failed to create case",
      error: error.message,
    });
  }
};


// ======================================================
// UPDATE CASE STATUS
// ======================================================

const updateStatus = async (req, res) => {
  try {
    const { caseId, status } = req.body;
    const userId = req.user.userId;

    if (!caseId || !status) {
      return res.status(400).json({
        message: "Case ID and status are required",
      });
    }

    const caseData = await Case.findOne({ caseId });

    if (!caseData) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    // POLICE can update only assigned cases
    if (req.user.role === "POLICE") {
      if (
        !caseData.assignedOfficer ||
        caseData.assignedOfficer.toString() !== userId.toString()
      ) {
        return res.status(403).json({
          message: "You can only update cases assigned to you",
        });
      }
    }

    const oldStatus = caseData.status;

    const updatedCase = await updateCaseStatus(
      caseId,
      status,
      userId,
      req.user.role
    );

    await AuditLog.create({
      caseId,
      action: "STATUS_UPDATED",
      performedBy: userId,
      role: req.user.role,
      details: `Case status changed from ${oldStatus} to ${status}`,
    });

    return res.status(200).json({
      message: "Case status updated successfully",
      case: updatedCase,
    });
  } catch (error) {
    console.error("Case status update failed:", error);

    return res.status(500).json({
      message: "Failed to update case status",
      error: error.message,
    });
  }
};


// ======================================================
// ASSIGN CASE
// ======================================================

const assignCase = async (req, res) => {
  try {
    const { caseId, officerId } = req.body;

    if (!caseId || !officerId) {
      return res.status(400).json({
        message: "Case ID and officer ID are required",
      });
    }

    const caseData = await Case.findOne({ caseId });

    if (!caseData) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const officer = await User.findOne({
      _id: officerId,
      role: "POLICE",
    });

    if (!officer) {
      return res.status(404).json({
        message: "Police officer not found",
      });
    }

    caseData.assignedOfficer = officer._id;

    if (caseData.status === "FIR_REGISTERED") {
      caseData.status = "ASSIGNED";
    }

    await caseData.save();

    await AuditLog.create({
      caseId,
      action: "CASE_ASSIGNED",
      performedBy: req.user.userId,
      role: req.user.role,
      details: `Case assigned to ${officer.name}`,
    });

    return res.status(200).json({
      message: "Case assigned successfully",
      case: caseData,
    });
  } catch (error) {
    console.error("Case assignment failed:", error);

    return res.status(500).json({
      message: "Failed to assign case",
      error: error.message,
    });
  }
};


// ======================================================
// GET ALL CASES
// ======================================================

const getAllCases = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let query = {};

    // Citizen → only their cases
    if (role === "CITIZEN") {
      query.citizenId = userId;
    }

    // Police → only assigned cases
    if (role === "POLICE") {
      query.assignedOfficer = userId;
    }

    const cases = await Case.find(query)
      .populate("citizenId", "name email")
      .populate("assignedOfficer", "name email role")
      .populate("firId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: cases.length,
      cases,
    });
  } catch (error) {
    console.error("Failed to fetch cases:", error);

    return res.status(500).json({
      message: "Failed to fetch cases",
      error: error.message,
    });
  }
};


// ======================================================
// GET SINGLE CASE
// ======================================================

const getSingleCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const caseData = await Case.findOne({ caseId })
      .populate("citizenId", "name email")
      .populate("assignedOfficer", "name email role")
      .populate("firId");
console.log("CURRENT ASSIGNED OFFICER:", caseData.assignedOfficer);
console.log("REQUESTED OFFICER:", officerId);
    if (!caseData) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    // Citizen → own cases only
    if (
      role === "CITIZEN" &&
      caseData.citizenId._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to access this case",
      });
    }

    // Police → assigned cases only
    if (
      role === "POLICE" &&
      (!caseData.assignedOfficer ||
        caseData.assignedOfficer._id.toString() !== userId.toString())
    ) {
      return res.status(403).json({
        message: "You are not authorized to access this case",
      });
    }

    return res.status(200).json({
      case: caseData,
    });
  } catch (error) {
    console.error("Failed to fetch case:", error);

    return res.status(500).json({
      message: "Failed to fetch case",
      error: error.message,
    });
  }
};


// ======================================================
// GET ASSIGNED CASES
// ======================================================

const getAssignedCases = async (req, res) => {
  try {
    const cases = await Case.find({
      assignedOfficer: req.user.userId,
    })
      .populate("citizenId", "name email")
      .populate("assignedOfficer", "name email role")
      .populate("firId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: cases.length,
      cases,
    });
  } catch (error) {
    console.error("Failed to fetch assigned cases:", error);

    return res.status(500).json({
      message: "Failed to fetch assigned cases",
      error: error.message,
    });
  }
};


// ======================================================
// GET CASE AUDIT LOGS
// ======================================================

const getCaseAuditLogs = async (req, res) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const caseData = await Case.findOne({ caseId });

    if (!caseData) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    // Citizen → own case only
    if (
      role === "CITIZEN" &&
      caseData.citizenId.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to access audit logs of this case",
      });
    }

    // Police → assigned cases only
    if (
      role === "POLICE" &&
      (!caseData.assignedOfficer ||
        caseData.assignedOfficer.toString() !== userId.toString())
    ) {
      return res.status(403).json({
        message: "You can only access audit logs of cases assigned to you",
      });
    }

    const auditLogs = await AuditLog.find({ caseId })
      .populate("performedBy", "name email role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      caseId,
      count: auditLogs.length,
      auditLogs,
    });
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);

    return res.status(500).json({
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};


// ======================================================
// GET CASE STATS
// ======================================================

const getCaseStats = async (req, res) => {
  try {
    const totalCases = await Case.countDocuments();

    const assignedCases = await Case.countDocuments({
      assignedOfficer: { $ne: null },
    });

    const pendingAssignment = await Case.countDocuments({
      assignedOfficer: null,
    });

    const resolvedCases = await Case.countDocuments({
      status: "RESOLVED",
    });

    return res.status(200).json({
      totalCases,
      assignedCases,
      pendingAssignment,
      resolvedCases,
    });
  } catch (error) {
    console.error("Failed to fetch case stats:", error);

    return res.status(500).json({
      message: "Failed to fetch case statistics",
      error: error.message,
    });
  }
};


// ======================================================
// GET CASE TIMELINE
// ======================================================

const getTimeline = async (req, res) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const caseData = await Case.findOne({ caseId });

    if (!caseData) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    // Citizen → own case only
    if (
      role === "CITIZEN" &&
      caseData.citizenId.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to access this case timeline",
      });
    }
    console.log("ASSIGNED OFFICER:", caseData.assignedOfficer);
console.log("CURRENT USER:", userId);

    // Police → assigned cases only
    // if (
    //   role === "POLICE" &&
    //   (!caseData.assignedOfficer ||
    //     caseData.assignedOfficer.toString() !== userId.toString())
    // // ) {
    //   return res.status(403).json({
    //     message: "You can only access timeline of cases assigned to you",
    //   });
    // }

    const timeline = await getCaseTimeline(caseId);

    return res.status(200).json({
      caseId,
      count: timeline.length,
      timeline,
    });
  } catch (error) {
    console.error("Failed to fetch case timeline:", error);

    return res.status(500).json({
      message: "Failed to fetch case timeline",
      error: error.message,
    });
  }
};


// ======================================================
// AI CASE ANALYSIS
// ======================================================

const analyzeCaseWithAI = async (req, res) => {
  try {
    const { caseId } = req.body;

    if (!caseId) {
      return res.status(400).json({
        message: "Case ID is required",
      });
    }

    const existingCase = await Case.findOne({ caseId }).populate("firId");

    if (!existingCase) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const fir = existingCase.firId;

    if (!fir) {
      return res.status(404).json({
        message: "Case exists, but related FIR was not found",
      });
    }

    // Return saved analysis if already available
    if (existingCase.aiAnalysis) {
      return res.status(200).json({
        aiAnalysis: existingCase.aiAnalysis,
        cached: true,
        source: "mongodb",
      });
    }

    const aiAnalysis = await analyzeFIR({
      incidentDescription: fir.incidentDescription,
      category: fir.category,
      incidentLocation: fir.incidentLocation,
      incidentDate: fir.incidentDate,
    });

    if (aiAnalysis.aiAvailable !== false) {
      existingCase.aiAnalysis = aiAnalysis;
      existingCase.priority = aiAnalysis.severity || "MEDIUM";

      await existingCase.save();

      console.log(
        "AI analysis generated and saved:",
        caseId
      );
    } else {
      console.log(
        "AI unavailable. MongoDB case was not updated:",
        caseId
      );
    }

    return res.status(200).json({
      caseId,
      aiAnalysis,
      cached: false,
      source: "gemini",
    });
  } catch (error) {
    console.error("AI case analysis failed:", error);

    return res.status(500).json({
      message: "Failed to analyze case with AI",
      error: error.message,
    });
  }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createCaseFromFIR,
  updateStatus,
  assignCase,
  getAllCases,
  getSingleCase,
  getAssignedCases,
  getCaseAuditLogs,
  getCaseStats,
  getTimeline,
  analyzeCaseWithAI,
};