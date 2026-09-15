const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/CitizenRegister.jsx', 'utf8');

// 1. Add state variables
const stateTarget = `const [mobile, setMobile] = useState('');`;
const newState = `const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regError, setRegError] = useState('');`;
code = code.replace(stateTarget, newState);

// 2. Replace handleRegister with the actual API call
const registerTarget = `const handleRegister = (e) => {
    e.preventDefault();
    // In real app, call API here
    alert("Registration successful! Redirecting to login...");
    navigate('/login');
  };`;

const newRegister = `const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await fetch(\`\${API_URL}/auth/register\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: verifiedData.name,
          email,
          password,
          role: 'CITIZEN'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      alert("Registration successful! Please login.");
      navigate('/login');
    } catch(err) {
      setRegError(err.message);
    }
  };`;
code = code.replace(registerTarget, newRegister);

// 3. Update step 3 UI to include Email and Password
const step3Target = `<div className="flex items-start gap-3">
                  <MapPin size={20} className="text-navy mt-0.5" />
                  <div>
                    <p className="text-xs text-charcoal/50 font-semibold uppercase">Address</p>
                    <p className="font-bold text-charcoal">{verifiedData.address}</p>
                  </div>
                </div>
              </div>`;
              
const newStep3 = `<div className="flex items-start gap-3">
                  <MapPin size={20} className="text-navy mt-0.5" />
                  <div>
                    <p className="text-xs text-charcoal/50 font-semibold uppercase">Address</p>
                    <p className="font-bold text-charcoal">{verifiedData.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-navy focus:border-transparent" placeholder="citizen@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-navy focus:border-transparent" placeholder="Create a password" />
                </div>
                {regError && <p className="text-red-500 text-sm font-medium">{regError}</p>}
              </div>`;
code = code.replace(step3Target, newStep3);

fs.writeFileSync('src/pages/auth/CitizenRegister.jsx', code);
console.log("CitizenRegister updated.");
