const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8');

const targetTimeline = `const handleTimelineUpdate = (e) => {
    e.preventDefault();
    if (!timelineEvent.event) return;
    alert(\`Timeline event "\${timelineEvent.event}" securely added.\`);
    setTimelineEvent({ date: '', event: '', description: '' });
    setShowEditTimeline(false);
    setTimelineSignatureVerified(false);
  };`;

const newTimeline = `const handleTimelineUpdate = async (e) => {
    e.preventDefault();
    if (!timelineEvent.event) return;
    try {
      const token = localStorage.getItem('anveshak_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      
      const res = await fetch(\`\${API_URL}/case/status\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({
          caseId: caseData.caseId,
          status: timelineEvent.event.toUpperCase().replace(/ /g, '_')
        })
      });
      
      if (!res.ok) throw new Error('Timeline update failed');
      
      alert(\`Timeline event "\${timelineEvent.event}" securely added.\`);
      setTimelineEvent({ date: '', event: '', description: '' });
      setShowEditTimeline(false);
      setTimelineSignatureVerified(false);
      
      window.location.reload();
    } catch(err) {
      console.error(err);
      alert('Failed to update timeline: ' + err.message);
    }
  };`;

if(code.includes('const handleTimelineUpdate = (e) => {') || code.includes('const handleTimelineUpdate = async (e) => {')) {
  code = code.replace(targetTimeline, newTimeline);
  fs.writeFileSync('src/pages/officer/CaseDetail.jsx', code);
  console.log("handleTimelineUpdate patched!");
} else {
  console.log("Could not find handleTimelineUpdate.");
}
