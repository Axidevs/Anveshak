const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
  userId,
  caseId,
  action,
  oldValue,
  newValue,
  description,
  verificationStatus = "VERIFIED",
}) => {
  const auditLog = await AuditLog.create({
    userId,
    caseId,
    action,
    oldValue,
    newValue,
    description,
    verificationStatus,
  });

  return auditLog;
};

module.exports = {
  createAuditLog,
};