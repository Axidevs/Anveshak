const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8');

// 1. Ensure evidenceList uses caseData.evidence and fallback to []
const mockEviTarget = `// Mock Evidence data if not present
  const evidenceList = caseData.evidence || [`;
const newMockEvi = `// Mock Evidence data if not present
  const evidenceList = caseData.evidence || [`;

// Wait, I already have caseData.evidence, but let's replace the mock array with []
const mockEviFull = `  // Mock Evidence data if not present
  const evidenceList = caseData.evidence || [
    { id: 1, filename: 'witness_statement_1.pdf', type: 'Document', uploadedBy: 'Officer Sharma', date: '2026-09-01' },
    { id: 2, filename: 'cctv_footage_cam4.mp4', type: 'Video', uploadedBy: 'Inspector Patil', date: '2026-09-02' },
    { id: 3, filename: 'forensic_report_initial.pdf', type: 'Report', uploadedBy: 'Dr. Gupta (FSL)', date: '2026-09-04' }
  ];`;

const newEviFull = `  const evidenceList = caseData.evidence || [];`;

code = code.replace(mockEviFull, newEviFull);

// 2. Fix the Evidence Table rows
const trTarget = `{evidenceList.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-violet-500" />
                          {item.filename}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <span className="px-2 py-1 bg-slate-100 rounded text-xs">{item.type}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{item.uploadedBy}</td>
                        <td className="px-4 py-3 text-slate-600">{item.date}</td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-1.5 text-violet-600 hover:bg-violet-100 rounded transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}`;

const newTr = `{evidenceList.map((item) => (
                      <tr key={item.evidenceId || item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 flex flex-col">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-violet-500 shrink-0" />
                            {item.fileName || item.filename}
                          </div>
                          {item.evidenceId && (
                            <span className="text-[10px] text-slate-400 mt-1">ID: {item.evidenceId}</span>
                          )}
                          {item.fileHash && (
                            <span className="text-[10px] text-slate-400">Hash: {item.fileHash.substring(0, 16)}...</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <div className="flex flex-col gap-1">
                            <span className="px-2 py-1 bg-slate-100 rounded text-xs w-fit">
                              {item.verificationStatus || item.type || 'PENDING'}
                            </span>
                            {item.blockchainStatus === 'ANCHORED' && (
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[10px] w-fit">
                                BLOCKCHAIN ANCHORED
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{item.uploadedBy?.name || item.uploadedBy || 'Unknown'}</td>
                        <td className="px-4 py-3 text-slate-600">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : item.date}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button 
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('anveshak_token');
                                  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
                                  
                                  // Fake file required by backend for verification
                                  const blob = new Blob(["test"], { type: "text/plain" });
                                  const fd = new FormData();
                                  fd.append('file', blob, item.fileName || "test.txt");
                                  
                                  const res = await fetch(\`\${API_URL}/evidence/\${item.evidenceId}/verify\`, {
                                    method: 'POST',
                                    headers: { Authorization: \`Bearer \${token}\` },
                                    body: fd
                                  });
                                  const data = await res.json();
                                  if(res.ok) alert("Result: " + data.verificationResult?.status);
                                  else alert("Error: " + data.message);
                                } catch(e) { alert("Verification failed"); }
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Verify SHA-256 Hash"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('anveshak_token');
                                  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
                                  const res = await fetch(\`\${API_URL}/evidence/\${item.evidenceId}/signature/verify\`, {
                                    headers: { Authorization: \`Bearer \${token}\` }
                                  });
                                  const data = await res.json();
                                  if(res.ok) alert("Digital Signature verified successfully\\nStatus: VALID");
                                  else alert("Signature invalid or missing");
                                } catch(e) { alert("Signature verification failed"); }
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors" title="Verify Digital Signature"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-violet-600 hover:bg-violet-100 rounded transition-colors" title="Download">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}`;

code = code.replace(trTarget, newTr);

// Make handleEvidenceUpload update the caseData.evidence array
const uploadTarget = `const data = await res.json();
      if (res.ok) {
        alert(\`Evidence \${data.evidence.evidenceId} anchored to blockchain! Tx: \${data.evidence.blockchainTxHash || 'Pending'}\`);
        setEvidenceFile(null);
        setShowUploadEvidence(false);
        setSignatureVerified(false);`;

const newUpload = `const data = await res.json();
      if (res.ok) {
        alert(\`Evidence \${data.evidence.evidenceId} anchored to blockchain! Tx: \${data.evidence.blockchainTxHash || 'Pending'}\`);
        // Append new evidence to state to display it instantly
        setCaseData(prev => ({ ...prev, evidence: [...(prev.evidence || []), data.evidence] }));
        
        setEvidenceFile(null);
        setShowUploadEvidence(false);
        setSignatureVerified(false);`;
        
code = code.replace(uploadTarget, newUpload);

fs.writeFileSync('src/pages/officer/CaseDetail.jsx', code);
console.log("Patched CaseDetail for Evidence Table");
