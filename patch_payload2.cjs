const fs = require('fs');
let code = fs.readFileSync('src/pages/citizen/LogFIR.jsx', 'utf8');

const targetStr = `const payload = {
        complainant: formData.complainantName || "Citizen",
        incidentDescription: formData.description || "No description provided",
        incidentDate: formData.date ? new Date(formData.date + 'T' + (formData.time || '00:00')) : new Date(),
        incidentLocation: formData.address || formData.district || "Unknown Location",
        category: (formData.incidentType || 'OTHER').toUpperCase(),
      };`;

// Use a simple replace without regex for exact string replacement across lines, or just replace line by line
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('complainant: formData.')) {
    lines[i] = '        complainant: "Demo Citizen",';
  } else if (lines[i].includes('incidentDescription: formData.')) {
    lines[i] = '        incidentDescription: description || "No description provided",';
  } else if (lines[i].includes('incidentDate: formData.')) {
    lines[i] = '        incidentDate: incidentDate ? new Date(incidentDate + \\'T\\' + (incidentTime || \\'00:00\\')) : new Date(),';
  } else if (lines[i].includes('incidentLocation: formData.')) {
    lines[i] = '        incidentLocation: location || "Unknown Location",';
  } else if (lines[i].includes('category: (formData.incidentType')) {
    lines[i] = '        category: (incidentType || \\'OTHER\\').toUpperCase().replace(/ /g, \\'_\\'),';
  }
}

code = lines.join('\n');
fs.writeFileSync('src/pages/citizen/LogFIR.jsx', code);
console.log("Patched payload variables in LogFIR via line splitting.");
