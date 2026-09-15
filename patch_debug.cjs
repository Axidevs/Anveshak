const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8');

const target = `const aRes = await fetch(\`\${API_URL}/case/\${id}/audit\`, { headers: { Authorization: \`Bearer \${token}\` } });
          const aData = await aRes.json();
          if (aRes.ok && aData.auditLogs) {`;

const newCode = `const aRes = await fetch(\`\${API_URL}/case/\${id}/audit\`, { headers: { Authorization: \`Bearer \${token}\` } });
          const aData = await aRes.json();
          console.log("AUDIT API RESPONSE:", aRes.status, aData);
          if (aRes.ok && aData.auditLogs) {`;

code = code.replace(target, newCode);
fs.writeFileSync('src/pages/officer/CaseDetail.jsx', code);
console.log("Added console.log for Audit API response");
