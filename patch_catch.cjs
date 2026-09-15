const fs = require('fs');
let code = fs.readFileSync('src/pages/citizen/LogFIR.jsx', 'utf8');

const regex = /catch\(e\) \{\s*console\.error\(e\);\s*alert\("Error submitting FIR"\);\s*\}/;
const newCatch = `catch(e) { console.error(e); alert("Error submitting FIR: " + e.message + " | " + e.stack); }`;

code = code.replace(regex, newCatch);
fs.writeFileSync('src/pages/citizen/LogFIR.jsx', code);
console.log("Patched catch block.");
