import { useState, useEffect } from 'react';
import { Shield, Fingerprint, Lock, CheckCircle, ChevronRight, Loader2, Scale, Smartphone, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AuthGate({ onAuthenticated }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0); // 0: welcome, 1: method select, 2: verifying, 3: done
  const [method, setMethod] = useState(null);

  // SIMULATED: In production, this would redirect to DigiLocker / Aadhaar OAuth
  const handleVerify = (selectedMethod) => {
    setMethod(selectedMethod);
    setStep(2);
    setTimeout(() => {
      setStep(3);
      setTimeout(() => {
        onAuthenticated();
      }, 1500);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Background — KMRL-inspired light gradient with mesh orbs */}
      <div className="absolute inset-0 hero-gradient-light">
        {/* Animated mesh gradient orbs */}
        <div className="mesh-orb w-[500px] h-[500px] bg-navy/[0.04] top-[-10%] left-[-10%]" style={{ animationDelay: '0s' }} />
        <div className="mesh-orb w-[600px] h-[600px] bg-saffron/[0.05] bottom-[-15%] right-[-10%]" style={{ animationDelay: '5s' }} />
        <div className="mesh-orb w-[400px] h-[400px] bg-forest/[0.04] top-[30%] right-[20%]" style={{ animationDelay: '10s' }} />
        <div className="mesh-orb w-[300px] h-[300px] bg-navy/[0.03] bottom-[20%] left-[15%]" style={{ animationDelay: '15s' }} />
        
        {/* Decorative curves (KMRL-inspired) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100,200 Q360,100 720,300 T1540,200" stroke="rgba(11,61,145,0.05)" strokeWidth="1" className="decorative-line" />
          <path d="M-100,400 Q360,300 720,500 T1540,400" stroke="rgba(255,107,53,0.04)" strokeWidth="1" className="decorative-line" style={{ animationDelay: '2s' }} />
          <path d="M-100,600 Q360,500 720,700 T1540,600" stroke="rgba(26,156,86,0.04)" strokeWidth="1" className="decorative-line" style={{ animationDelay: '4s' }} />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-lg mx-4 fade-in-up">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg shadow-navy/10 flex items-center justify-center p-2">
              <img src="/logo.jpg" alt="Anveshak Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-charcoal tracking-tight">
            <span className="font-serif italic text-navy">अन्वेषक</span>
          </h1>
          <p className="text-xs text-charcoal-muted mt-1 tracking-widest uppercase">Anveshak · Digital Justice Platform</p>
          {/* Indian tricolor line */}
          <div className="flex gap-0 w-20 h-0.5 rounded-full overflow-hidden mx-auto mt-4">
            <div className="flex-1 bg-saffron" />
            <div className="flex-1 bg-charcoal-muted" />
            <div className="flex-1 bg-forest" />
          </div>
        </div>

        {/* Auth Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-xl shadow-navy/5">
          {step === 0 && (
            <div className="text-center fade-in-up">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-navy-100 to-navy-50 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-navy" />
              </div>
              <h2 className="text-xl font-bold text-charcoal mb-2">Secure Identity Verification</h2>
              <p className="text-sm text-charcoal-muted mb-8 max-w-sm mx-auto leading-relaxed">
                To access the Anveshak platform, please verify your identity through one of our secure government authentication services.
              </p>
              <button
                onClick={() => setStep(1)}
                className="pill-btn bg-navy text-white hover:bg-navy-700 font-semibold px-8 py-3.5 text-sm shadow-lg shadow-navy/20 mx-auto"
              >
                Continue to Verify
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-charcoal-muted/60 mt-6">
                A Government of India Digital Initiative — SIH 2026 Prototype
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="fade-in-up">
              <h2 className="text-lg font-bold text-charcoal mb-1 text-center">Choose Verification Method</h2>
              <p className="text-xs text-charcoal-muted mb-6 text-center">Select how you'd like to verify your identity</p>

              <div className="space-y-3">
                {/* DigiLocker */}
                <button
                  onClick={() => handleVerify('digilocker')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-transparent bg-gradient-to-r from-[#1a237e]/5 to-[#0d47a1]/5 hover:border-navy-200 hover:shadow-md transition-all duration-300 group text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a237e] to-[#0d47a1] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-navy/20">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-charcoal block">DigiLocker</span>
                    <span className="text-xs text-charcoal-muted">Verify using your DigiLocker digital documents</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-navy opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Aadhaar */}
                <button
                  onClick={() => handleVerify('aadhaar')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-transparent bg-gradient-to-r from-saffron/5 to-saffron/[0.02] hover:border-saffron-200 hover:shadow-md transition-all duration-300 group text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-saffron to-saffron-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-saffron/20">
                    <Fingerprint className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-charcoal block">Aadhaar eKYC</span>
                    <span className="text-xs text-charcoal-muted">Verify using Aadhaar OTP authentication</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-saffron opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Mobile OTP */}
                <button
                  onClick={() => handleVerify('mobile')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-transparent bg-gradient-to-r from-forest/5 to-forest/[0.02] hover:border-forest-200 hover:shadow-md transition-all duration-300 group text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forest to-forest-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-forest/20">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-charcoal block">Mobile OTP</span>
                    <span className="text-xs text-charcoal-muted">Quick login with registered mobile number</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-forest opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              </div>

              <button
                onClick={() => setStep(0)}
                className="w-full text-xs text-charcoal-muted hover:text-navy mt-4 transition-colors"
              >
                ← Go back
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-8 fade-in-up">
              <div className="w-20 h-20 rounded-full bg-navy-50 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-navy animate-spin" />
              </div>
              <h2 className="text-lg font-bold text-charcoal mb-2">Verifying Your Identity</h2>
              <p className="text-sm text-charcoal-muted">
                {method === 'digilocker' && 'Connecting to DigiLocker...'}
                {method === 'aadhaar' && 'Connecting to UIDAI Aadhaar...'}
                {method === 'mobile' && 'Sending OTP to your mobile...'}
              </p>
              <div className="mt-6 flex justify-center gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-navy"
                    style={{
                      animation: 'badgePulse 1.4s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-charcoal-muted/50 mt-4">
                SIMULATED: No real API call is made in this prototype
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8 scale-in">
              <div className="w-20 h-20 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-forest" />
              </div>
              <h2 className="text-lg font-bold text-charcoal mb-2">Identity Verified!</h2>
              <p className="text-sm text-charcoal-muted mb-1">Welcome to Anveshak</p>
              <p className="text-xs text-forest font-medium">Redirecting to platform...</p>
            </div>
          )}
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 mt-6 opacity-50">
          <div className="flex items-center gap-1 text-[10px] text-charcoal-muted">
            <Lock className="w-3 h-3" />
            <span>256-bit SSL</span>
          </div>
          <div className="w-px h-3 bg-charcoal-muted/30" />
          <div className="flex items-center gap-1 text-[10px] text-charcoal-muted">
            <Shield className="w-3 h-3" />
            <span>ISO 27001</span>
          </div>
          <div className="w-px h-3 bg-charcoal-muted/30" />
          <div className="flex items-center gap-1 text-[10px] text-charcoal-muted">
            <Fingerprint className="w-3 h-3" />
            <span>UIDAI Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
