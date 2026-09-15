const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/OfficerDashboard.jsx', 'utf8');

// Use a regex to catch whatever bullet point variation is there
code = code.replace(/\{c\.id\} .* \{c\.type\}/g, `{c.caseId || c._id} • {c.firId?.category || 'General'}`);

fs.writeFileSync('src/pages/officer/OfficerDashboard.jsx', code);
console.log("Fixed rendering for ID");
