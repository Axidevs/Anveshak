const allowedTransitions = {
  FIR_REGISTERED: ["UNDER_REVIEW"],

  UNDER_REVIEW: ["ASSIGNED"],

  ASSIGNED: ["INVESTIGATION"],

  INVESTIGATION: ["EVIDENCE_COLLECTION"],

  EVIDENCE_COLLECTION: ["FORENSIC_REVIEW"],

  FORENSIC_REVIEW: ["CHARGE_SHEET"],

  CHARGE_SHEET: ["COURT_PROCEEDINGS"],

  COURT_PROCEEDINGS: ["RESOLVED"],

  RESOLVED: [],
};

const canTransition = (currentStatus, nextStatus) => {
  const allowedStatuses = allowedTransitions[currentStatus];

  if (!allowedStatuses) {
    return false;
  }

  return allowedStatuses.includes(nextStatus);
};
const Case = require("../models/Case");

const updateCaseStatus = async (caseId, nextStatus) => {
  const caseData = await Case.findOne({ caseId });

  if (!caseData) {
    throw new Error("Case not found");
  }

  const currentStatus = caseData.status;

  if (!canTransition(currentStatus, nextStatus)) {
    throw new Error(
      `Invalid status transition: ${currentStatus} → ${nextStatus}`
    );
  }

  caseData.status = nextStatus;

  await caseData.save();

  return caseData;
};

module.exports = {
  allowedTransitions,
  canTransition,
  updateCaseStatus,
};