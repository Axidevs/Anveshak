const fs = require('fs');
const lines = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8').split('\n');

const uStart = lines.findIndex(l => l.includes('const handleEvidenceUpload'));
const uEnd = lines.findIndex((l, i) => i > uStart && l.includes('};'));

const newUpload = `  const handleEvidenceUpload = async (e) => {
    e.preventDefault();
    if (!evidenceFile) return;
    try {
      const token = localStorage.getItem('anveshak_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const formData = new FormData();
      formData.append('file', evidenceFile);
      formData.append('caseId', caseData.caseId || caseData.id);
      formData.append('description', 'Evidence document uploaded by officer');
      
      const res = await fetch(\`\${API_URL}/evidence/upload\`, {
        method: 'POST',
        headers: { Authorization: \`Bearer \${token}\` },
        body: formData
      });
      if(res.ok) {
        setEvidenceFile(null);
        setShowUploadEvidence(false);
        setSignatureVerified(false);
        window.location.reload();
      } else {
        const d = await res.json();
        alert("Upload failed: " + d.message);
      }
    } catch(err) {
      alert("Error uploading evidence: " + err.message);
    }
  };`;

lines.splice(uStart, uEnd - uStart + 1, newUpload);

const tStart = lines.findIndex(l => l.includes('const handleTimelineUpdate'));
const tEnd = lines.findIndex((l, i) => i > tStart && l.includes('};'));

const newTimeline = `  const handleTimelineUpdate = async (e) => {
    e.preventDefault();
    if (!timelineEvent.event) return;
    try {
      const token = localStorage.getItem('anveshak_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      
      const res = await fetch(\`\${API_URL}/case/status\`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\` 
        },
        body: JSON.stringify({
          caseId: caseData.caseId || caseData.id,
          status: timelineEvent.event.toUpperCase().replace(/ /g, '_')
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

lines.splice(tStart, tEnd - tStart + 1, newTimeline);

fs.writeFileSync('src/pages/officer/CaseDetail.jsx', lines.join('\n'));
console.log("Functions properly spliced!");
