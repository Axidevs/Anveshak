const fs = require('fs');
let code = fs.readFileSync('server/src/services/assignmentService.js', 'utf8');

const targetStr = `const findBestOfficer = async (jurisdiction, specialization) => {`;
const newStr = `const findBestOfficer = async (jurisdiction, specialization) => {
  // DEMO OVERRIDE: Always assign to police@anveshak.com
  const demoOfficer = await User.findOne({ email: 'police@anveshak.com' });
  if (demoOfficer) return demoOfficer;
`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('server/src/services/assignmentService.js', code);
console.log("Assignment logic patched for demo.");
