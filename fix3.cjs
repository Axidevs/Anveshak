const fs = require('fs');
let code = fs.readFileSync('src/pages/citizen/LogFIR.jsx', 'utf8').split('\n');
for(let i=0;i<code.length;i++){
  if(code[i].includes('formData.complainantName')) code[i]='        complainant: "Citizen",';
  if(code[i].includes('formData.description')) code[i]='        incidentDescription: description || "No description",';
  if(code[i].includes('formData.date')) code[i]='        incidentDate: incidentDate ? new Date(incidentDate + "T" + (incidentTime || "00:00")) : new Date(),';
  if(code[i].includes('formData.address')) code[i]='        incidentLocation: location || "Unknown Location",';
  if(code[i].includes('formData.incidentType')) code[i]='        category: (incidentType || "OTHER").toUpperCase().replace(/ /g, "_"),';
}
fs.writeFileSync('src/pages/citizen/LogFIR.jsx', code.join('\n'));
console.log('Fixed LogFIR!');
