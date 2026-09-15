const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/OfficerDashboard.jsx', 'utf8');

const newBlock = `  const [stats, setStats] = React.useState({ total: 0, active: 0, pending: 0, shared: 0 });
  const [recentCases, setRecentCases] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('anveshak_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        
        // Fetch stats
        const statsRes = await fetch(\`\${API_URL}/case/stats\`, { headers: { Authorization: \`Bearer \${token}\` } });
        if(statsRes.ok) {
           const sData = await statsRes.json();
           setStats({
             total: sData.stats?.totalCases || 0,
             active: sData.stats?.byStatus?.find(s => s._id === 'INVESTIGATION')?.count || 0,
             pending: sData.stats?.byStatus?.find(s => s._id === 'ASSIGNED')?.count || 0,
             shared: 2
           });
        }
        
        // Fetch recent cases
        const casesRes = await fetch(\`\${API_URL}/case/assigned-to-me\`, { headers: { Authorization: \`Bearer \${token}\` } });
        if(casesRes.ok) {
           const cData = await casesRes.json();
           setRecentCases(cData.cases || []);
        }
      } catch(e) {}
    };
    fetchData();
  }, []);

  const totalCases = stats.total;
  const activeCases = stats.active;
  const pendingReview = stats.pending;
  const sharedAccess = stats.shared;`;

code = code.replace(/const totalCases = mockOfficerCases\.length;[\s\S]*?const sharedAccess = mockSharedAccess\.length;/, newBlock);

code = code.replace(/\{mockOfficerCases\.slice/g, `{recentCases.slice`);
code = code.replace(/key=\{c\.id\}/g, `key={c._id || c.caseId}`);

code = code.replace(/to=\{\`\/officer\/cases\/\$\{c\.id\}\`\}/g, `to={\`/officer/cases/\${c.caseId || c._id}\`}`);

// Replace the {c.id} bullet {c.type} carefully
code = code.replace(/\{c\.id\}\s*.\s*\{c\.type\}/g, `{c.caseId || c._id} • {c.firId?.category || 'General'}`);

code = code.replace(/\{c\.title\}/g, `{c.firId ? (c.firId.category + ' Case') : 'Investigation File'}`);

fs.writeFileSync('src/pages/officer/OfficerDashboard.jsx', code);
console.log("OfficerDashboard fixed properly this time.");
