const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8');

const targetStr = `              description: c.firId?.incidentDescription || 'No description',
              aiAnalysis: c.aiAnalysis || null`;

const newStr = `              description: c.firId?.incidentDescription || 'No description',
              aiAnalysis: c.aiAnalysis || null,
              evidence: c.evidence || [],
              timeline: c.timeline || null,
              auditLog: c.auditLog || null`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/pages/officer/CaseDetail.jsx', code);
  console.log("Fixed setCaseData missing properties.");
} else {
  console.log("Could not find target string.");
}
