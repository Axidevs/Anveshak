const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8');

// 1. Update setCaseData
const stateUpdateRegex = /description: c\.firId\?\.incidentDescription \|\| 'No description',\s*aiAnalysis: c\.aiAnalysis \|\| null\s*\}/;
const newStateUpdate = `description: c.firId?.incidentDescription || 'No description',
            aiAnalysis: c.aiAnalysis || null,
            evidence: c.evidence || [],
            timeline: c.timeline || [],
            auditLog: c.auditLog || []
          }`;
code = code.replace(stateUpdateRegex, newStateUpdate);

// 2. Remove Evidence Mock Fallback
const evidenceMockRegex = /const evidenceList = caseData\.evidence \|\| \[\s*\{\s*id: 1, filename: 'witness_statement_1\.pdf'[\s\S]*?\];/;
code = code.replace(evidenceMockRegex, `const evidenceList = caseData.evidence || [];`);

// 3. Remove Audit Mock Fallback
const auditMockRegex = /const caseAuditLog = caseData\.auditLog \|\| \[\s*\{\s*id: 101, action: 'Viewed Case File'[\s\S]*?\];/;
code = code.replace(auditMockRegex, `const caseAuditLog = caseData.auditLog || [];`);

fs.writeFileSync('src/pages/officer/CaseDetail.jsx', code);
console.log("Mock data removed and setCaseData patched.");
