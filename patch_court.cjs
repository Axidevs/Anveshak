const fs = require('fs');
let code = fs.readFileSync('src/pages/court/CourtMyCases.jsx', 'utf8');

const mockTarget = `const cases = (mockCourtCases && mockCourtCases.length > 0) ? mockCourtCases : fallbackCases;`;

const newCode = `const [cases, setCases] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCases = async () => {
      try {
        const token = localStorage.getItem('anveshak_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const res = await fetch(\`\${API_URL}/case\`, {
          headers: { Authorization: \`Bearer \${token}\` }
        });
        const data = await res.json();
        if(res.ok) {
           const mapped = data.cases.filter(c => c.status === 'COURT_PROCEEDINGS' || c.status === 'CHARGESHEET').map(c => ({
             id: c.caseId || c._id,
             title: c.firId ? \`\${c.firId.category} Case\` : 'Case File',
             status: 'Hearing Scheduled',
             hearingDate: 'Upcoming',
             priority: c.priority || 'Medium',
             nextAction: 'Review Evidence'
           }));
           setCases(mapped.length > 0 ? mapped : fallbackCases);
        }
      } catch(e) { console.error(e); } finally { setIsLoading(false); }
    };
    fetchCases();
  }, []);`;

code = code.replace(mockTarget, newCode);
fs.writeFileSync('src/pages/court/CourtMyCases.jsx', code);
