const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8');

// Replace handleEvidenceUpload
const targetUpload = `const handleEvidenceUpload = (e) => {
    e.preventDefault();
    if (!evidenceFile) return;
    alert(\`File \${evidenceFile.name} securely uploaded and signed.\`);
    setEvidenceFile(null);
    setShowUploadEvidence(false);
    setSignatureVerified(false);
  };`;

const newUpload = `const handleEvidenceUpload = async (e) => {
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

// Replace handleTimelineUpdate
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

code = code.replace(targetUpload, newUpload);
code = code.replace(targetTimeline, newTimeline);
fs.writeFileSync('src/pages/officer/CaseDetail.jsx', code);
console.log("Patched CaseDetail upload and timeline functions.");
