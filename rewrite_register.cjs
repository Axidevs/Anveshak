const fs = require('fs');

const code = `import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle, Loader2 } from 'lucide-react';

const CitizenRegister = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setIsLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await fetch(\`\${API_URL}/auth/register\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'CITIZEN' })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch(err) {
      setRegError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4 pt-20">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 fade-in-up">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-navy mb-2">Citizen Registration</h2>
          <p className="text-charcoal/70">Join Anveshak to file and track your FIRs securely.</p>
        </div>

        {success ? (
          <div className="text-center py-8 scale-in">
            <CheckCircle className="w-16 h-16 text-forest mx-auto mb-4" />
            <h3 className="text-xl font-bold text-charcoal mb-2">Registration Successful!</h3>
            <p className="text-sm text-charcoal/70">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/50 w-5 h-5" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-navy/20 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-navy/50" placeholder="Aaditya Sharma" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/50 w-5 h-5" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-navy/20 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-navy/50" placeholder="citizen@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/50 w-5 h-5" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border border-navy/20 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-navy/50" placeholder="Create a secure password" />
              </div>
            </div>

            {regError && <p className="text-red-500 text-sm font-medium text-center">{regError}</p>}

            <button type="submit" disabled={isLoading} className="w-full bg-navy hover:bg-navy/90 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all mt-6 shadow-md">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Complete Registration</span>}
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-charcoal/70">
            Already have an account? <Link to="/login" className="text-navy font-bold hover:underline">Sign in here</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default CitizenRegister;
`;

fs.writeFileSync('src/pages/auth/CitizenRegister.jsx', code);
console.log("Rewrote CitizenRegister.jsx to be a direct registration form.");
