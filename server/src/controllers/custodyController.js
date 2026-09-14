const Evidence = require("../models/Evidence");
const CustodyLog = require("../models/CustodyLog");

const createCustodyLog = async (req, res) => {
  try {
    const { evidenceId, action, toUser, remarks } = req.body;

    // Check required fields
    if (!evidenceId || !action) {
      return res.status(400).json({
        message: "Evidence ID and action are required",
      });
    }

    // Check whether evidence exists
    const evidence = await Evidence.findOne({ evidenceId });

    if (!evidence) {
      return res.status(404).json({
        message: "Evidence not found",
      });
    }

    // Create custody log
    const custodyLog = await CustodyLog.create({
      evidenceId,
      action,
      fromUser: req.user.userId,
      toUser: toUser || null,
      performedBy: req.user.userId,
      remarks: remarks || "",
    });

    // Update evidence custody status
    if (action === "TRANSFERRED") {
      evidence.custodyStatus = "TRANSFERRED";
    }

    if (action === "RECEIVED") {
      evidence.custodyStatus = "IN_CUSTODY";
    }

    if (action === "RELEASED") {
      evidence.custodyStatus = "RELEASED";
    }

    await evidence.save();

    res.status(201).json({
      message: "Chain of custody entry created successfully",
      custodyLog,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create custody log",
      error: error.message,
    });
  }
};
const getCustodyLogs = async (req, res) => {
  try {
    const { evidenceId } = req.params;

    const evidence = await Evidence.findOne({ evidenceId });

    if (!evidence) {
      return res.status(404).json({
        message: "Evidence not found",
      });
    }

    const custodyLogs = await CustodyLog.find({ evidenceId })
      .sort({ createdAt: 1 });

    res.status(200).json({
      evidenceId,
      custodyStatus: evidence.custodyStatus,
      custodyLogs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch custody logs",
      error: error.message,
    });
  }
};

module.exports = {
  createCustodyLog,
  getCustodyLogs
};