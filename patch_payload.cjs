const fs = require('fs');
let code = fs.readFileSync('src/pages/citizen/LogFIR.jsx', 'utf8');

const regex = /const payload = \{[\s\S]*?category: \(formData\.incidentType \|\| 'OTHER'\)\.toUpperCase\(\),\n\s*\};/;

const newPayload = `const payload = {
          complainant: "Citizen",
          incidentDescription: description || "No description provided",
          incidentDate: incidentDate ? new Date(incidentDate + 'T' + (incidentTime || '00:00')) : new Date(),
          incidentLocation: location || "Unknown Location",
          category: (incidentType || 'OTHER').toUpperCase().replace(/ /g, '_'),
        };`;

code = code.replace(regex, newPayload);
fs.writeFileSync('src/pages/citizen/LogFIR.jsx', code);
console.log("Patched payload variables in LogFIR.");
