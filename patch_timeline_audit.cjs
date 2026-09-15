const fs = require('fs');
let code = fs.readFileSync('server/src/controllers/caseController.js', 'utf8');

code = code.replace(
  'performedBy: userId,',
  'userId: userId,'
);

code = code.replace(
  'target: caseId,',
  'caseId: caseId,'
);

fs.writeFileSync('server/src/controllers/caseController.js', code);
console.log("Fixed createAuditLog fields in addTimelineEvent!");
