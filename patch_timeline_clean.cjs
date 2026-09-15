const fs = require('fs');
let code = fs.readFileSync('server/src/controllers/caseController.js', 'utf8');

const tStart = code.indexOf('const addTimelineEvent = async (req, res) => {');
const tEnd = code.indexOf('// ======================================================', tStart + 10);
const realEnd = code.lastIndexOf('};', tEnd) + 2;

const fixedController = `const addTimelineEvent = async (req, res) => {
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

code = code.substring(0, tStart) + fixedController + code.substring(realEnd);
fs.writeFileSync('server/src/controllers/caseController.js', code);
console.log("Fixed addTimelineEvent correctly!");
