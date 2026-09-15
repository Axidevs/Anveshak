const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8');

code = code.replace(
  "user: log.userId ? (log.userId.name || log.userId) : 'System',",
  "by: log.userId ? (log.userId.name || log.userId) : 'System',\n              user: log.userId ? (log.userId.name || log.userId) : 'System',"
);

fs.writeFileSync('src/pages/officer/CaseDetail.jsx', code);
console.log("Patched audit mapping to include .by");
