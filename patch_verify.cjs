const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8');

const targetStr = `const blob = new Blob(["test"], { type: "text/plain" });
                                  const fd = new FormData();
                                  fd.append('file', blob, item.fileName || "test.txt");
                                  
                                  const res = await fetch(\`\${API_URL}/evidence/\${item.evidenceId}/verify\`, {
                                    method: 'POST',
                                    headers: { Authorization: \`Bearer \${token}\` },
                                    body: fd
                                  });
                                  const data = await res.json();
                                  if(res.ok) alert("Result: " + data.verificationResult?.status);
                                  else alert("Error: " + data.message);`;

const newStr = `const fileInput = document.createElement('input');
                                  fileInput.type = 'file';
                                  fileInput.onchange = async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    try {
                                      const fd = new FormData();
                                      fd.append('file', file);
                                      const res = await fetch(\`\${API_URL}/evidence/\${item.evidenceId}/verify\`, {
                                        method: 'POST',
                                        headers: { Authorization: \`Bearer \${token}\` },
                                        body: fd
                                      });
                                      const data = await res.json();
                                      if(res.ok) alert("Result: " + data.verificationResult?.status + "\\nOriginal Hash: " + data.originalHash);
                                      else alert("Error: " + data.message);
                                      
                                      // refresh case to update verification status in UI
                                      fetchCase();
                                    } catch(err) { alert("Verification failed"); }
                                  };
                                  fileInput.click();`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('src/pages/officer/CaseDetail.jsx', code);
console.log("Patched CaseDetail for Real File Verification");
