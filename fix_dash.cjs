const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/OfficerDashboard.jsx', 'utf8');

// The problematic block that wasn't replaced properly:
const oldBlock = `  const totalCases = mockOfficerCases.length;
  const activeCases = mockOfficerCases.filter(c => c.status === 'Active' || c.status === 'Court').length;
  const pendingReview = 2; // Mocked stat
  const sharedAccess = mockSharedAccess.length;`;

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

// Use a regex to replace the old block robustly (ignoring exact whitespace)
code = code.replace(/const totalCases = mockOfficerCases\.length;[\s\S]*?const sharedAccess = mockSharedAccess\.length;/, newBlock);

// Also fix the link in recentCases map, because `c.id` might be undefined. We need `c.caseId` for the route.
code = code.replace(/<p className="text-xs text-gray-500 mt-1">\{c\.id\} \\? \{c\.type\}<\/p>/g, `<p className="text-xs text-gray-500 mt-1">{c.caseId || c._id} • {c.firId?.category || 'General'}</p>`);
code = code.replace(/to=\{\`\/officer\/cases\/\$\{c\.id\}\`\}/g, `to={\`/officer/cases/\${c.caseId || c._id}\`}`);

// Clean up any weird characters introduced by powershell encoding
code = code.replace(/\?/g, '•');

fs.writeFileSync('src/pages/officer/OfficerDashboard.jsx', code);
console.log("OfficerDashboard fixed.");
