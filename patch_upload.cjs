const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8');

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
      const formData = new FormData();
      formData.append('file', evidenceFile);
      formData.append('caseId', caseData.caseId);
      formData.append('description', 'Evidence uploaded via portal');
      
      const token = localStorage.getItem('anveshak_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      
      const res = await fetch(\`\${API_URL}/evidence/upload\`, {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${token}\`
        },
        body: formData
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      alert(\`File \${evidenceFile.name} securely uploaded and signed.\`);
      setEvidenceFile(null);
      setShowUploadEvidence(false);
      setSignatureVerified(false);
      
      // Reload page to show new evidence
      window.location.reload();
      
    } catch(err) {
      console.error(err);
      alert('Failed to upload evidence: ' + err.message);
    }
  };`;

if(code.includes('const handleEvidenceUpload = (e) => {') || code.includes('const handleEvidenceUpload = async (e) => {')) {
  // If it's already async, maybe we patched it. But we just look for exact match.
  code = code.replace(targetUpload, newUpload);
  fs.writeFileSync('src/pages/officer/CaseDetail.jsx', code);
  console.log("handleEvidenceUpload patched!");
} else {
  console.log("Could not find handleEvidenceUpload.");
}
