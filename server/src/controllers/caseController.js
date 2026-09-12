const FIR = require("../models/FIR");
const Case = require("../models/Case");
const AuditLog = require("../models/AuditLog");

const generateCaseId = require("../services/caseIdService");
const { updateCaseStatus } = require("../services/caseLifecycleService");
const { getCaseTimeline } = require("../services/timelineService");
const { analyzeFIR } = require("../services/aiService");
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
        message: "You can only create a case from your own FIR",
      });
    }

    const existingCase = await Case.findOne({ firId });

    if (existingCase) {
      return res.status(400).json({
        message: "Case already exists for this FIR",
        caseId: existingCase.caseId,
      });
    }

    const caseId = await generateCaseId();

    const newCase = await Case.create({
      caseId,
      firId: fir._id,
      citizenId: fir.createdBy,
      jurisdiction: fir.incidentLocation,
    });

    res.status(201).json({
      message: "Case created successfully",
      firId: fir._id,
      caseId: newCase.caseId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create case",
      error: error.message,
    });
  }
};


const updateStatus = async (req, res) => {
  try {
    const { caseId, nextStatus } = req.body;

    if (!caseId || !nextStatus) {
      return res.status(400).json({
        message: "caseId and nextStatus are required",
      });
    }

    const caseData = await Case.findOne({ caseId });

    if (!caseData) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const userRole = req.user.role;
    const userId = req.user.userId.toString();

    // ADMIN can update any case
    if (userRole === "ADMIN") {
      // Allowed
    }

    // POLICE can update only assigned cases
    else if (userRole === "POLICE") {
      if (
        !caseData.assignedOfficer ||
        caseData.assignedOfficer.toString() !== userId
      ) {
        return res.status(403).json({
          message: "You can only update cases assigned to you",
        });
      }
    }

    // Other roles cannot update status
    else {
      return res.status(403).json({
        message: "You are not authorized to update case status",
      });
    }

    const updatedCase = await updateCaseStatus(
      caseId,
      nextStatus,
      req.user.userId
    );

    res.status(200).json({
      message: "Case status updated successfully",
      case: updatedCase,
    });
  } catch (error) {
    if (error.message === "Case not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message.startsWith("Invalid status transition")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to update case status",
      error: error.message,
    });
  }
};


const getAllCases = async (req, res) => {
  try {
    let query = {};

    // Citizen → only their own cases
    if (req.user.role === "CITIZEN") {
      query = {
        citizenId: req.user.userId,
      };
    }

    // Police → only cases assigned to them
    else if (req.user.role === "POLICE") {
      query = {
        assignedOfficer: req.user.userId,
      };
    }

    // Admin / Court / Investigating Agency
    // can view all cases

    const cases = await Case.find(query)
      .populate("firId")
      .populate("citizenId", "name email role")
      .populate("assignedOfficer", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: cases.length,
      cases,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch cases",
      error: error.message,
    });
  }
};


const getSingleCase = async (req, res) => {
  try {
    const { caseId } = req.params;

    const userRole = req.user.role;
    const userId = req.user.userId;

    let query = {
      caseId,
    };

    // Citizen → only their own case
    if (userRole === "CITIZEN") {
      query.citizenId = userId;
    }

    // Police → only cases assigned to them
    else if (userRole === "POLICE") {
      query.assignedOfficer = userId;
    }

    const caseData = await Case.findOne(query)
      .populate("firId")
      .populate("citizenId", "name email role")
      .populate("assignedOfficer", "name email role");

    if (!caseData) {
      return res.status(403).json({
        message: "You are not authorized to access this case",
      });
    }

    res.status(200).json({
      case: caseData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch case",
      error: error.message,
    });
  }
};


const getAssignedCases = async (req, res) => {
  try {
    const cases = await Case.find({
      assignedOfficer: req.user.userId,
    })
      .populate("firId")
      .populate("citizenId", "name email role")
      .populate("assignedOfficer", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: cases.length,
      cases,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch assigned cases",
      error: error.message,
    });
  }
};

// ===============================
// GET CASE AUDIT LOGS
// ===============================
const getCaseAuditLogs = async (req, res) => {
  try {
    const { caseId } = req.params;

    const caseData = await Case.findOne({ caseId });

    if (!caseData) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const userRole = req.user.role;
    const userId = req.user.userId.toString();

    // Citizen → own case only
    if (userRole === "CITIZEN") {
      if (caseData.citizenId.toString() !== userId) {
        return res.status(403).json({
          message: "You can only access audit logs of your own cases",
        });
      }
    }

    // Police → assigned cases only
    else if (userRole === "POLICE") {
      if (
        !caseData.assignedOfficer ||
        caseData.assignedOfficer.toString() !== userId
      ) {
        return res.status(403).json({
          message:
            "You can only access audit logs of cases assigned to you",
        });
      }
    }

    const auditLogs = await AuditLog.find({ caseId })
      .populate("userId", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      caseId,
      count: auditLogs.length,
      auditLogs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};


const getCaseStats = async (req, res) => {
  try {
    const totalCases = await Case.countDocuments();

    const activeCases = await Case.countDocuments({
      status: { $ne: "RESOLVED" },
    });

    const resolvedCases = await Case.countDocuments({
      status: "RESOLVED",
    });

    const assignedCases = await Case.countDocuments({
      assignedOfficer: { $ne: null },
    });

    const pendingAssignment = await Case.countDocuments({
      assignedOfficer: null,
    });

    res.status(200).json({
      totalCases,
      activeCases,
      resolvedCases,
      assignedCases,
      pendingAssignment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch case statistics",
      error: error.message,
    });
  }
};


const getTimeline = async (req, res) => {
  try {
    const { caseId } = req.params;

    const caseData = await Case.findOne({ caseId });

    if (!caseData) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const userRole = req.user.role;
    const userId = req.user.userId.toString();

    // Citizen → own case only
    if (userRole === "CITIZEN") {
      if (caseData.citizenId.toString() !== userId) {
        return res.status(403).json({
          message: "You can only access timeline of your own cases",
        });
      }
    }

    // Police → assigned cases only
    else if (userRole === "POLICE") {
      if (
        !caseData.assignedOfficer ||
        caseData.assignedOfficer.toString() !== userId
      ) {
        return res.status(403).json({
          message:
            "You can only access timeline of cases assigned to you",
        });
      }
    }

    const timeline = await getCaseTimeline(caseId);

    res.status(200).json({
      caseId,
      count: timeline.length,
      timeline,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch case timeline",
      error: error.message,
    });
  }
};

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

      console.log("AI analysis generated and saved:", caseId);
    } else {
      console.log("AI unavailable. MongoDB case was not updated:", caseId);
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
module.exports = {
  createCaseFromFIR,
  updateStatus,
  getAllCases,
  getSingleCase,
  getAssignedCases,
  getCaseAuditLogs,
  getCaseStats,
  getTimeline,
  analyzeCaseWithAI,
};