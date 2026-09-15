const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/OfficerDashboard.jsx', 'utf8');

// The problematic block:
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

code = code.replace(oldBlock, newBlock);

code = code.replace(`{mockOfficerCases.slice(0, 4).map(c => (`, `{recentCases.slice(0, 4).map(c => (`);
code = code.replace(`key={c.id}`, `key={c._id || c.caseId}`);
// Use fixed strings instead of regex to avoid messing up JSX syntax
const oldLink = `to={\`/officer/cases/\${c.id}\`}`;
const newLink = `to={\`/officer/cases/\${c.caseId || c._id}\`}`;
code = code.replace(oldLink, newLink);

const oldName = `{c.id} ? {c.type}`;
const newName = `{c.caseId || c._id} • {c.firId?.category || 'General'}`;
code = code.replace(oldName, newName);

// Also the other replacement for the title:
code = code.replace(`{c.title}`, `{c.firId ? (c.firId.category + ' Case') : 'Investigation File'}`);

fs.writeFileSync('src/pages/officer/OfficerDashboard.jsx', code);
console.log("OfficerDashboard fixed.");
