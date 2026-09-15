const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8');

const fetchCaseTarget = `const data = await res.json();
        if(res.ok && data.case) {
          const c = data.case;
          setCaseData({
            id: c.caseId || c._id,
            caseId: c.caseId || c._id,
            realId: c._id,
            title: c.firId ? \`\${c.firId.category || 'Incident'} — \${c.firId.incidentLocation || 'Unknown'}\` : 'Case File',
            status: c.status || 'ACTIVE',
            priority: c.priority || 'MEDIUM',
            type: c.firId?.category || 'General',
            date: c.createdAt,
            location: c.jurisdiction || c.firId?.incidentLocation || 'Unknown Location',
            description: c.firId?.incidentDescription || 'No description',
            aiAnalysis: c.aiAnalysis || null
          });
        }`;

const newFetchCase = `const data = await res.json();
        if(res.ok && data.case) {
          const c = data.case;
          
          let timeline = null;
          let auditLog = null;
          try {
            const tRes = await fetch(\`\${API_URL}/case/\${id}/timeline\`, { headers: { Authorization: \`Bearer \${token}\` } });
            if(tRes.ok) {
              const tData = await tRes.json();
              timeline = tData.timeline.map(t => ({
                date: new Date(t.timestamp).toLocaleDateString(),
                event: t.action,
                description: t.description,
                by: t.performedBy?.name || 'System'
              }));
            }
            
            const aRes = await fetch(\`\${API_URL}/case/\${id}/audit\`, { headers: { Authorization: \`Bearer \${token}\` } });
            if(aRes.ok) {
              const aData = await aRes.json();
              auditLog = aData.logs.map(l => ({
                id: l._id,
                action: l.action,
                by: l.performedBy?.name || 'System',
                timestamp: new Date(l.timestamp).toLocaleString(),
                verified: true
              }));
            }
          } catch(err) { console.log(err); }

          setCaseData({
            id: c.caseId || c._id,
            caseId: c.caseId || c._id,
            realId: c._id,
            title: c.firId ? \`\${c.firId.category || 'Incident'} — \${c.firId.incidentLocation || 'Unknown'}\` : 'Case File',
            status: c.status || 'ACTIVE',
            priority: c.priority || 'MEDIUM',
            type: c.firId?.category || 'General',
            date: c.createdAt,
            location: c.jurisdiction || c.firId?.incidentLocation || 'Unknown Location',
            description: c.firId?.incidentDescription || 'No description',
            aiAnalysis: c.aiAnalysis || null,
            timeline: timeline,
            auditLog: auditLog
          });
        }`;

code = code.replace(fetchCaseTarget, newFetchCase);

// Replace caseAuditLog assignment
const auditLogTarget = `const caseAuditLog = mockAuditLog?.filter(log => log.caseId === id) || [`;
const newAuditLog = `const caseAuditLog = caseData.auditLog || [`;
code = code.replace(auditLogTarget, newAuditLog);

fs.writeFileSync('src/pages/officer/CaseDetail.jsx', code);
console.log("Success patching Timeline & Audit in CaseDetail.jsx");
