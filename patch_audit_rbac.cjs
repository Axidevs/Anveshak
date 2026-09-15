const fs = require('fs');
let code = fs.readFileSync('server/src/routes/caseRoutes.js', 'utf8');
code = code.replace(
  /allowRoles\(\s*"CITIZEN",\s*"COURT",\s*"ADMIN"\s*\)/g,
  'allowRoles("CITIZEN", "POLICE", "COURT", "ADMIN")'
);
fs.writeFileSync('server/src/routes/caseRoutes.js', code);
console.log('Fixed audit endpoint RBAC!');
