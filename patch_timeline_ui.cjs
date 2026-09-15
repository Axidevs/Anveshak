const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8');

const tStart = code.indexOf('const handleTimelineUpdate = async (e) => {');
const tEnd = code.indexOf('};', tStart) + 2;

const newTimeline = `const handleTimelineUpdate = async (e) => {
    e.preventDefault();
    if (!timelineEvent.event) return;
    try {
      const token = localStorage.getItem('anveshak_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      
      const res = await fetch(\`\${API_URL}/case/\${caseData.caseId || caseData.id}/timeline\`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\` 
        },
        body: JSON.stringify({
          action: timelineEvent.event,
          description: timelineEvent.description || "No description",
          date: timelineEvent.date
        })
      });
      if(res.ok) {
        setTimelineEvent({ date: '', event: '', description: '' });
        setShowEditTimeline(false);
        setTimelineSignatureVerified(false);
        window.location.reload();
      } else {
        const d = await res.json();
        alert("Timeline update failed: " + (d.message || d.error));
      }
    } catch(err) {
      alert("Error updating timeline: " + err.message);
    }
  };`;

code = code.substring(0, tStart) + newTimeline + code.substring(tEnd);
fs.writeFileSync('src/pages/officer/CaseDetail.jsx', code);
console.log("Updated CaseDetail.jsx handleTimelineUpdate!");
