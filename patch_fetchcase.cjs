const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/CaseDetail.jsx', 'utf8');

const regex = /const fetchCase = async \(\) => \{[\s\S]*?fetchCase\(\);\n  \}, \[id\]\);/;

const newFetch = `const fetchCase = async () => {
      try {
        const token = localStorage.getItem('anveshak_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        
        const res = await fetch(\`\${API_URL}/case/\${id}\`, { headers: { Authorization: \`Bearer \${token}\` } });
        const data = await res.json();
        
        let timelineData = [];
        try {
          const tRes = await fetch(\`\${API_URL}/case/\${id}/timeline\`, { headers: { Authorization: \`Bearer \${token}\` } });
          const tData = await tRes.json();
          if (tRes.ok && tData.timeline) {
            timelineData = tData.timeline.map(t => ({
              event: t.action ? t.action.replace(/_/g, ' ') : (t.status || 'Update'),
              date: new Date(t.createdAt).toLocaleDateString(),
              by: t.performedBy ? t.performedBy.name : 'System',
              description: t.description || ''
            }));
          }
        } catch(e) {}

        let auditData = [];
        try {
          const aRes = await fetch(\`\${API_URL}/case/\${id}/audit\`, { headers: { Authorization: \`Bearer \${token}\` } });
          const aData = await aRes.json();
          if (aRes.ok && aData.auditLogs) {
            auditData = aData.auditLogs.map(log => ({
              id: log._id,
              timestamp: log.createdAt,
              user: log.userId ? log.userId.name : 'System',
              action: log.action ? log.action.replace(/_/g, ' ') : 'Action',
              target: log.caseId,
              details: log.description
            }));
          }
        } catch(e) {}

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
            aiAnalysis: c.aiAnalysis || null,
            evidence: (c.evidence || []).map(e => ({
                id: e._id || e.evidenceId,
                filename: e.fileName || e.filename || 'Document',
                type: 'Evidence',
                uploadedBy: e.uploadedBy ? (e.uploadedBy.name || e.uploadedBy) : 'System',
                date: new Date(e.createdAt || Date.now()).toLocaleDateString()
              })),
            timeline: timelineData,
            auditLog: auditData
          });
        }
      } catch(e) {
        console.error("Error fetching case:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCase();
  }, [id]);`;

code = code.replace(regex, newFetch);
fs.writeFileSync('src/pages/officer/CaseDetail.jsx', code);
console.log("fetchCase correctly patched with mappings.");
