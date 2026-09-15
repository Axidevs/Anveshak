const fs = require('fs');

// 1. Update caseController.js
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

    // Check authorization (police assigned to case)
    if (req.user.role === "POLICE" && (!caseData.assignedOfficer || caseData.assignedOfficer.toString() !== userId.toString())) {
      return res.status(403).json({ message: "You can only update cases assigned to you" });
    }

    // Create Timeline entry
    const newEvent = await createTimelineEvent({
      caseId,
      status: caseData.status,
      action: action || "CASE_UPDATED",
      performedBy: userId,
      description: description || "Custom timeline event added",
    });

    // Create Audit Log
    const { createAuditLog } = require("../services/auditService");
    await createAuditLog({
      action: "TIMELINE_UPDATED",
      performedBy: userId,
      target: caseId,
      description: \`Custom timeline event added: \${action}\`,
    });

    return res.status(201).json({ message: "Timeline event added successfully", event: newEvent });
  } catch (error) {
    console.error("Failed to add timeline event:", error);
    return res.status(500).json({ message: "Failed to add timeline event", error: error.message });
  }
};
`;

// Insert the new controller before module.exports
const moduleExportsIdx = caseController.lastIndexOf('module.exports = {');
caseController = caseController.slice(0, moduleExportsIdx) + newControllerStr + '\n' + caseController.slice(moduleExportsIdx);

// Add addTimelineEvent to module.exports
caseController = caseController.replace('module.exports = {', 'module.exports = {\n  addTimelineEvent,');
fs.writeFileSync('server/src/controllers/caseController.js', caseController);
console.log("Updated caseController.js");

// 2. Update caseRoutes.js
let caseRoutes = fs.readFileSync('server/src/routes/caseRoutes.js', 'utf8');
caseRoutes = caseRoutes.replace('getTimeline,', 'getTimeline,\n  addTimelineEvent,');

const newRouteStr = `
router.post(
  "/:caseId/timeline",
  protect,
  allowRoles("POLICE", "ADMIN"),
  addTimelineEvent
);
`;

const routeInsertIdx = caseRoutes.indexOf('module.exports = router;');
caseRoutes = caseRoutes.slice(0, routeInsertIdx) + newRouteStr + '\n' + caseRoutes.slice(routeInsertIdx);
fs.writeFileSync('server/src/routes/caseRoutes.js', caseRoutes);
console.log("Updated caseRoutes.js");

