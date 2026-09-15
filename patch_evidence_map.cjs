const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8');

const regex = /evidence: c\.evidence \|\| \[\]/;
const newMapping = `evidence: (c.evidence || []).map(e => ({
                id: e._id || e.evidenceId,
                filename: e.fileName || e.filename || 'Document',
                type: 'Evidence',
                uploadedBy: e.uploadedBy ? (e.uploadedBy.name || e.uploadedBy) : 'System',
                date: new Date(e.createdAt || Date.now()).toLocaleDateString()
              }))`;

code = code.replace(regex, newMapping);
fs.writeFileSync('src/pages/officer/CaseDetail.jsx', code);
console.log("Mapped evidence keys.");
