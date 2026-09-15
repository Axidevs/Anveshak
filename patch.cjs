const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8');

const quickActionsTarget = `<button className="w-full text-left px-4 py-3 rounded-lg border border-violet-100 hover:border-violet-300 hover:bg-violet-50 transition-colors flex items-center text-sm font-medium text-slate-700">
                  <Shield className="w-4 h-4 mr-3 text-violet-600" /> Request Inter-Agency Access
                </button>`;

const aiButtonStr = `                <button 
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('anveshak_token');
                      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
                      const res = await fetch(\`\${API_URL}/case/analyze\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
                        body: JSON.stringify({ caseId: caseData.caseId || caseData.id })
                      });
                      const data = await res.json();
                      if(res.ok) {
                        setCaseData({...caseData, aiAnalysis: data.aiAnalysis});
                        alert("AI Analysis complete!");
                      } else alert("AI Error: " + data.message);
                    } catch(e) { alert("Error calling AI"); }
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex items-center text-sm font-medium text-indigo-700"
                >
                  <Activity className="w-4 h-4 mr-3 text-indigo-600" /> Analyze with Gemini AI <span className="ml-auto text-[10px] bg-indigo-100 text-indigo-500 px-1.5 rounded">AI</span>
                </button>`;

code = code.replace(quickActionsTarget, aiButtonStr + '\n' + quickActionsTarget);

const caseInfoTarget = `{/* Case Timeline */}`;
const aiPanelStr = `{caseData.aiAnalysis && (
            <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-2xl shadow-lg p-6 mb-6 text-white animate-fade-in-up">
              <h2 className="text-xl font-serif font-bold mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-indigo-300" /> Gemini AI Analysis
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-indigo-200 text-xs uppercase font-bold">Classification</p>
                  <p className="font-semibold">{caseData.aiAnalysis.classification}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-indigo-200 text-xs uppercase font-bold">Confidence</p>
                  <p className="font-semibold">{caseData.aiAnalysis.confidenceScore}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-indigo-200 text-xs uppercase font-bold">Severity</p>
                  <p className="font-semibold">{caseData.aiAnalysis.severity}</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <p className="text-indigo-200 text-xs uppercase font-bold mb-1">Summary</p>
                <p className="text-sm leading-relaxed">{caseData.aiAnalysis.summary}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-indigo-200 text-xs uppercase font-bold mb-1">Reasoning</p>
                <p className="text-sm leading-relaxed">{caseData.aiAnalysis.reasoning}</p>
              </div>
            </div>
            )}
            
            `;
code = code.replace(caseInfoTarget, aiPanelStr + caseInfoTarget);

const statusBadgeTarget = `<span className={\`px-3 py-1 rounded-full text-sm font-medium border \${
                caseData.status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                caseData.status?.toLowerCase() === 'court' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                'bg-slate-50 text-slate-700 border-slate-200'
              }\`}>
                {caseData.status}
              </span>`;

const newStatusSelect = `<select 
                value={caseData.status}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  try {
                    const token = localStorage.getItem('anveshak_token');
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
                    const res = await fetch(\`\${API_URL}/case/status\`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
                      body: JSON.stringify({ caseId: caseData.caseId || caseData.id, status: newStatus })
                    });
                    if(res.ok) setCaseData({...caseData, status: newStatus});
                  } catch(err) { console.error(err); }
                }}
                className="px-3 py-1 rounded-full text-sm font-medium border bg-white text-slate-700 border-slate-300 outline-none cursor-pointer"
              >
                <option value="ACTIVE">Active</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="INVESTIGATION">Investigation</option>
                <option value="EVIDENCE_COLLECTION">Evidence Collection</option>
                <option value="FORENSIC_REVIEW">Forensic Review</option>
                <option value="COURT_PROCEEDINGS">Court Proceedings</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>`;
code = code.replace(statusBadgeTarget, newStatusSelect);

const handleEvidenceTarget = `const handleEvidenceUpload = (e) => {
    e.preventDefault();
    if (!evidenceFile) return;
    alert(\`File \${evidenceFile.name} securely uploaded and signed.\`);
    setEvidenceFile(null);
    setShowUploadEvidence(false);
    setSignatureVerified(false);
  };`;

const newHandleEvidence = `const handleEvidenceUpload = async (e) => {
    e.preventDefault();
    if (!evidenceFile) return;
    try {
      const token = localStorage.getItem('anveshak_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const formData = new FormData();
      formData.append('caseId', caseData.caseId || caseData.id);
      formData.append('description', 'Evidence Upload');
      formData.append('evidence', evidenceFile);

      const res = await fetch(\`\${API_URL}/evidence/upload\`, {
        method: 'POST',
        headers: { Authorization: \`Bearer \${token}\` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert(\`Evidence \${data.evidence.evidenceId} anchored to blockchain! Tx: \${data.evidence.blockchainTxHash || 'Pending'}\`);
        setEvidenceFile(null);
        setShowUploadEvidence(false);
        setSignatureVerified(false);
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch(err) {
      alert("Error uploading evidence");
    }
  };`;
code = code.replace(handleEvidenceTarget, newHandleEvidence);

fs.writeFileSync('src/pages/officer/CaseDetail.jsx', code);
console.log("Success patching CaseDetail.jsx");
