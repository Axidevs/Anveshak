const fs = require('fs');
let lines = fs.readFileSync('src/components/shared/AuditTrail.jsx', 'utf8').split('\n');

for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('let logs = caseFilter')) {
    lines[i] = '  let logs = props.logs ? props.logs : (caseFilter';
  }
}
fs.writeFileSync('src/components/shared/AuditTrail.jsx', lines.join('\n'));
console.log('Patched AuditTrail.jsx');
