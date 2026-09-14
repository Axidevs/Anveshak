const Case = require("../models/Case");
const { findBestOfficer } = require("../services/assignmentService");
const { createTimelineEvent } = require("../services/timelineService");

const assignCase = async (req, res) => {
  try {
    const { caseId } = req.body;

    if (!caseId) {
      return res.status(400).json({
        message: "Case ID is required",
      });
    }

    const caseData = await Case.findOne({ caseId });
    console.log("CASE ASSIGNED TO:", caseData.assignedOfficer);
console.log("CURRENT USER:", req.user.userId);

    if (!caseData) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    if (caseData.assignedOfficer) {
      return res.status(400).json({
        message: "Case is already assigned",
      });
    }
if (
  req.user.role === "POLICE" &&
  req.user.jurisdiction &&
  caseData.jurisdiction &&
  req.user.jurisdiction.toLowerCase().trim() !==
    caseData.jurisdiction.toLowerCase().trim()
) {
  return res.status(403).json({
    message: "You cannot assign cases outside your jurisdiction",
  });
}
    const officer = await findBestOfficer(
      caseData.jurisdiction,
      null
    );

    if (!officer) {
      return res.status(404).json({
        message: "No available officer found",
      });
    }

   caseData.assignedOfficer = officer._id;
caseData.status = "ASSIGNED";

await caseData.save();

officer.workload += 1;
await officer.save();

await createTimelineEvent({
  caseId: caseData.caseId,
  status: "ASSIGNED",
  action: "CASE_ASSIGNED",
  performedBy: req.user.userId,
  description: `Case assigned to ${officer.name}`,
});

    res.status(200).json({
      message: "Case assigned successfully",
      caseId: caseData.caseId,
      assignedOfficer: {
        id: officer._id,
        name: officer.name,
        email: officer.email,
        jurisdiction: officer.jurisdiction,
        workload: officer.workload,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to assign case",
      error: error.message,
    });
  }
};

module.exports = {
  assignCase,
};