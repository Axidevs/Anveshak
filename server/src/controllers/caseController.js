const FIR = require("../models/FIR");
const Case = require("../models/Case");
const generateCaseId = require("../services/caseIdService");

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

module.exports = {
  createCaseFromFIR,
};