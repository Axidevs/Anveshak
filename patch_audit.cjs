const fs = require('fs');
let code = fs.readFileSync('src/components/shared/AuditTrail.jsx', 'utf8');

const targetStr = `let logs = caseFilter
    ? mockAuditLog.filter(log => log.target.includes(caseFilter))
    : mockAuditLog;`;

const newStr = `let logs = props.logs || (caseFilter 
    ? mockAuditLog.filter(log => log.target.includes(caseFilter))
    : mockAuditLog);`;

code = code.replace(`export default function AuditTrail({ caseFilter = null, limit = 10 }) {`, `export default function AuditTrail(props) {
  const { caseFilter = null, limit = 10 } = props;`);
  
code = code.replace(targetStr, newStr);

fs.writeFileSync('src/components/shared/AuditTrail.jsx', code);
console.log("AuditTrail patched to accept logs prop.");
