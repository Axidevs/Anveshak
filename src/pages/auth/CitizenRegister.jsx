import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Shield, CheckCircle, ChevronRight, User, MapPin } from 'lucide-react';

const CitizenRegister = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState('');
  
  // Digilocker mock state
  const [verifiedData, setVerifiedData] = useState(null);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if(mobile.length === 10) setStep(1.5); // OTP step
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const verifyDigiLocker = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setVerifiedData({
        name: 'Aaditya Sharma',
        dob: '14-05-1992',
        address: 'B-12, Vasant Vihar, New Delhi - 110057',
        id: 'XXXX-XXXX-8921'
      });
      setLoading(false);
      setStep(3);
    }, 2000);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    login('citizen');
    navigate('/citizen');
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12 px-4 flex flex-col items-center">
      
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-navy mb-2">Citizen Registration</h1>
          <p className="text-charcoal/70">Create your secure Anveshak account</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2 rounded-full"></div>
          <div className="absolute left-0 top-1/2 h-1 bg-forest -z-10 transform -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }}></div>
          
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-forest text-white' : 'bg-gray-200 text-gray-500'} border-4 border-cream`}>1</div>
            <span className="text-xs font-semibold mt-1 text-charcoal/70">Mobile</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-forest text-white' : 'bg-gray-200 text-gray-500'} border-4 border-cream`}>2</div>
            <span className="text-xs font-semibold mt-1 text-charcoal/70">Identity</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-forest text-white' : 'bg-gray-200 text-gray-500'} border-4 border-cream`}>3</div>
            <span className="text-xs font-semibold mt-1 text-charcoal/70">Confirm</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6 animate-in fade-in">
              <h2 className="text-xl font-bold text-navy mb-4">Verify Mobile Number</h2>
              <div>
                <label className="block text-sm font-medium text-charcoal/80 mb-2">Mobile Number (Linked to Aadhaar)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="tel" 
                    maxLength="10"
                    required
                    className="pl-10 w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navy focus:border-transparent text-charcoal font-medium tracking-wide"
                    placeholder="Enter 10-digit number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-navy text-white p-3.5 rounded-xl font-bold hover:bg-navy-800 transition-colors shadow-sm flex justify-center items-center gap-2">
                Get OTP <ChevronRight size={18} />
              </button>
            </form>
          )}

          {step === 1.5 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-navy mb-2">Enter OTP</h2>
                <p className="text-sm text-charcoal/60">Sent to +91 {mobile}</p>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-navy font-semibold mt-1">Edit Number</button>
              </div>
              <div className="flex justify-between gap-2 max-w-xs mx-auto">
                {[...Array(6)].map((_, i) => (
                  <input 
                    key={i}
                    type="text"
                    maxLength="1"
                    required
                    className="w-10 h-12 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent text-xl font-bold text-charcoal"
                    defaultValue="1"
                  />
                ))}
              </div>
              <button type="submit" className="w-full bg-navy text-white p-3.5 rounded-xl font-bold hover:bg-navy-800 transition-colors shadow-sm flex justify-center items-center gap-2">
                Verify Mobile <CheckCircle size={18} />
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-navy mb-2">Identity Verification</h2>
              <p className="text-sm text-charcoal/70 mb-8">
                Anveshak requires verified identity using DigiLocker to ensure authentic access to legal documents.
              </p>
              
              {loading ? (
                <div className="py-8 flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-navy border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="font-semibold text-navy">Connecting to DigiLocker...</p>
                  <p className="text-sm text-charcoal/50 mt-2">Fetching verified credentials</p>
                </div>
              ) : (
                <button 
                  onClick={verifyDigiLocker}
                  className="w-full bg-navy text-white p-4 rounded-xl font-bold hover:bg-navy-800 transition-colors shadow-sm flex flex-col items-center justify-center gap-2 h-32 hover:-translate-y-1"
                >
                  <Shield size={32} className="text-saffron" />
                  <span>Verify via DigiLocker</span>
                </button>
              )}
            </div>
          )}

          {step === 3 && verifiedData && (
            <form onSubmit={handleRegister} className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-center gap-2 mb-6 text-forest">
                <CheckCircle size={24} />
                <h2 className="text-xl font-bold">Identity Verified</h2>
              </div>

              <div className="bg-cream p-5 rounded-xl border border-gray-200 space-y-4">
                <div className="flex items-start gap-3">
                  <User size={20} className="text-navy mt-0.5" />
                  <div>
                    <p className="text-xs text-charcoal/50 font-semibold uppercase">Full Name</p>
                    <p className="font-bold text-charcoal">{verifiedData.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-navy mt-0.5" />
                  <div>
                    <p className="text-xs text-charcoal/50 font-semibold uppercase">Verified ID</p>
                    <p className="font-bold text-charcoal">{verifiedData.id}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-navy mt-0.5" />
                  <div>
                    <p className="text-xs text-charcoal/50 font-semibold uppercase">Address</p>
                    <p className="font-bold text-charcoal">{verifiedData.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input type="checkbox" required className="mt-1 rounded text-navy focus:ring-navy" id="tc" />
                <label htmlFor="tc" className="text-sm text-charcoal/70">
                  I confirm these details are correct and agree to the <a href="#" className="text-navy font-bold hover:underline">Terms & Conditions</a> of Anveshak.
                </label>
              </div>

              <button type="submit" className="w-full bg-forest text-white p-3.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-sm text-lg">
                Complete Registration
              </button>
            </form>
          )}

        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-charcoal/70">
            Already have an account? <Link to="/auth/login" className="text-navy font-bold hover:underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CitizenRegister;
