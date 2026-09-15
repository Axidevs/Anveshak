const fs = require('fs');
let code = fs.readFileSync('src/pages/citizen/LogFIR.jsx', 'utf8');

const regex = /setTrackingId\(caseData\.caseRecord\.caseId\);/;
const newTracking = `setTrackingId(caseData.case ? caseData.case.caseId : (caseData.caseRecord ? caseData.caseRecord.caseId : data.fir.firNumber));`;

code = code.replace(regex, newTracking);
fs.writeFileSync('src/pages/citizen/LogFIR.jsx', code);
console.log("Patched caseData payload bug in LogFIR.jsx.");
