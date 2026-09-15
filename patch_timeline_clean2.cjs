const fs = require('fs');

let caseController = fs.readFileSync('server/src/controllers/caseController.js', 'utf8');

const newControllerStr = `
// ======================================================
// ADD CUSTOM TIMELINE EVENT
// ======================================================

const addTimelineEvent = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { action, description } = req.body;
    const userId = req.user.userId;

    const caseData = await Case.findOne({ caseId });
    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (req.user.role === "POLICE" && (!caseData.assignedOfficer || caseData.assignedOfficer.toString() !== userId.toString())) {
      return res.status(403).json({ message: "You can only update cases assigned to you" });
    }

    const { createTimelineEvent } = require("../services/timelineService");
    const newEvent = await createTimelineEvent({
      caseId,
      status: caseData.status,
      action: action || "CASE_UPDATED",
      performedBy: userId,
      description: description || "Custom timeline event added",
    });

    const { createAuditLog } = require("../services/auditService");
    await createAuditLog({
      userId: userId,
      caseId: caseId,
      action: "TIMELINE_UPDATED",
      description: \`Custom timeline event added: \${action}\`,
    });

    return res.status(201).json({ message: "Timeline event added successfully", event: newEvent });
  } catch (error) {
    console.error("Failed to add timeline event:", error);
    return res.status(500).json({ message: "Failed to add timeline event", error: error.message });
  }
};
`;

const moduleExportsIdx = caseController.lastIndexOf('module.exports = {');
caseController = caseController.slice(0, moduleExportsIdx) + newControllerStr + '\n' + caseController.slice(moduleExportsIdx);

caseController = caseController.replace('module.exports = {', 'module.exports = {\n  addTimelineEvent,');
fs.writeFileSync('server/src/controllers/caseController.js', caseController);
console.log("Safely added addTimelineEvent again!");
