const { createNotification } = require("./notificationController");
const FIR = require("../models/FIR");
const Case = require("../models/Case");
const generateCaseId = require("../services/caseIdService");
const { updateCaseStatus } = require("../services/caseLifecycleService");


const {
  getCaseTimeline,
} = require("../services/timelineService");

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
     try {
      await createNotification({
        userId: req.user.id,             // Jis user ne request ki hai, usi ko socket par jayega
        caseId: newCase.caseId,          // Real case ID jo abhi generate hua hai
        type: "CASE_ASSIGNED",
        message: `Your case ${newCase.caseId} has been successfully created!`
      });
    } catch (err) {
      console.error("Notification trigger failed:", err.message);
    }

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

    const updatedCase = await updateCaseStatus(
      caseId,
      nextStatus
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
const getTimeline = async (req, res) => {
  try {
    const { caseId } = req.params;

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

module.exports = {
  createCaseFromFIR,
  updateStatus,
  getTimeline,
};