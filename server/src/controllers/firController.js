const FIR = require("../models/FIR");


const createFIR = async (req, res) => {
  try {
    const {
      firNumber,
      complainant,
      incidentDescription,
      incidentDate,
      incidentLocation,
      category,
    } = req.body;

    if (
      !firNumber ||
      !complainant ||
      !incidentDescription ||
      !incidentDate ||
      !incidentLocation ||
      !category
    ) {
      return res.status(400).json({
        message: "Please provide all FIR details",
      });
    }

    const existingFIR = await FIR.findOne({ firNumber });

    if (existingFIR) {
      return res.status(400).json({
        message: "FIR number already exists",
      });
    }

    const fir = await FIR.create({
      firNumber,
      complainant,
      incidentDescription,
      incidentDate,
      incidentLocation,
      category,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      message: "FIR created successfully",
      fir,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create FIR",
      error: error.message,
    });
  }
};


const getFIR = async (req, res) => {
  try {
    const fir = await FIR.findById(req.params.firId)
      .populate("createdBy", "name email role");

    if (!fir) {
      return res.status(404).json({
        message: "FIR not found",
      });
    }

    const userRole = req.user.role;
    const userId = req.user.userId.toString();

    // Citizen → only their own FIR
    if (userRole === "CITIZEN") {
      if (fir.createdBy._id.toString() !== userId) {
        return res.status(403).json({
          message: "You can only access your own FIR",
        });
      }
    }

    res.status(200).json({
      fir,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch FIR",
      error: error.message,
    });
  }
};


const getMyFIRs = async (req, res) => {
  try {
    const firs = await FIR.find({
      createdBy: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: firs.length,
      firs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch FIRs",
      error: error.message,
    });
  }
};


module.exports = {
  createFIR,
  getFIR,
  getMyFIRs,
};