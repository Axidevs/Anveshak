const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8');

const targetStr = `<AuditTrail caseFilter={caseData.caseId || caseData.id} limit={50} />`;
const newStr = `<AuditTrail logs={caseData.auditLog} caseFilter={caseData.caseId || caseData.id} limit={50} />`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/pages/officer/CaseDetail.jsx', code);
  console.log("Passed auditLog to AuditTrail.");
} else {
  console.log("Target string not found.");
}
