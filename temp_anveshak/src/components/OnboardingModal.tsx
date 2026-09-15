import React, { useState } from 'react';
import { UserRole, Language, OnboardingData } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onCompleted: (data: OnboardingData) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  language,
  onCompleted,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>('advocate');
  const [fullName, setFullName] = useState<string>('Adv. Rajesh K. Sharma');
  const [idNumber, setIdNumber] = useState<string>('D/1842/2016');
  const [state, setState] = useState<string>('Delhi (NCT)');
  const [courtJurisdiction, setCourtJurisdiction] = useState<string>(
    'High Court of Judicature at Delhi'
  );
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);

  if (!isOpen) return null;

  const roles: {
    id: UserRole;
    titleEn: string;
    titleHi: string;
    icon: string;
    idPlaceholder: string;
    idLabel: string;
  }[] = [
    {
      id: 'advocate',
      titleEn: 'Advocate / Legal Counsel',
      titleHi: 'अधिवक्ता / कानूनी सलाहकार',
      icon: 'gavel',
      idLabel: 'Bar Council Enrollment ID',
      idPlaceholder: 'e.g., D/1842/2016',
    },
    {
      id: 'judicial_officer',
      titleEn: 'Judicial Officer / Bench',
      titleHi: 'न्यायिक अधिकारी / पीठ',
      icon: 'account_balance',
      idLabel: 'e-Courts Judicial Officer PIN',
      idPlaceholder: 'e.g., JO-IND-90218',
    },
    {
      id: 'law_enforcement',
      titleEn: 'Police / Law Enforcement',
      titleHi: 'पुलिस / कानून प्रवर्तन (CCTNS)',
      icon: 'shield_person',
      idLabel: 'CCTNS Official Service No.',
      idPlaceholder: 'e.g., POL-DL-44829',
    },
    {
      id: 'forensic',
      titleEn: 'Forensic & Medico-Legal',
      titleHi: 'फोरेंसिक व मेडिको-लीगल लैब',
      icon: 'science',
      idLabel: 'FSL Accreditation Number',
      idPlaceholder: 'e.g., CFSL-DEL-0941',
    },
    {
      id: 'citizen',
      titleEn: 'Citizen Litigant / Tele-Law',
      titleHi: 'नागरिक वादी / टेली-लॉ',
      icon: 'person',
      idLabel: 'Aadhaar Virtual ID (VID) / Mobile',
      idPlaceholder: 'XXXX-XXXX-XXXX-8921',
    },
  ];

  const handleStartVerification = () => {
    setIsVerifying(true);
    setVerificationLogs([]);

    const logMessages = [
      'Initiating MeghRaj Sovereign Cloud Handshake...',
      'Connecting to National Identity & Bar Database gateway...',
      'Validating 256-Bit SSL Sovereign Session Certificate...',
      'Hashing Biometric Token via GIGW 3.0 secure pipeline...',
      'Identity Verified • Issuing Unified Criminal Justice Grid Token...',
    ];

    logMessages.forEach((msg, idx) => {
      setTimeout(() => {
        setVerificationLogs((prev) => [...prev, msg]);
        if (idx === logMessages.length - 1) {
          setTimeout(() => {
            setIsVerifying(false);
            setStep(3);
          }, 600);
        }
      }, (idx + 1) * 600);
    });
  };

  const handleFinish = () => {
    onCompleted({
      role: selectedRole,
      fullName,
      idNumber,
      courtJurisdiction,
      state,
      authenticated: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#001C3A]/60 backdrop-blur-md font-sans-jakarta animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,34,68,0.3)] border border-[#002244]/15 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Tricolor top border accent */}
        <div className="h-1.5 w-full flex">
          <div className="w-1/3 bg-[#FF9933]"></div>
          <div className="w-1/3 bg-white"></div>
          <div className="w-1/3 bg-[#138808]"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#002244] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-xl">fingerprint</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#001C3A] font-serif-merriweather">
                {language === 'hi'
                  ? 'संप्रभु ऑनबोर्डिंग प्रक्रिया'
                  : 'Sovereign Onboarding Gateway'}
              </h2>
              <p className="text-[11px] text-gray-500">
                {language === 'hi'
                  ? 'चरण ' + step + ' का 3 • राष्ट्रीय न्याय नेटवर्क'
                  : `Step ${step} of 3 • National Justice Network Protocol`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#001C3A] uppercase tracking-wider mb-1">
                  {language === 'hi'
                    ? 'अपनी न्यायिक भूमिका चुनें'
                    : 'Select Your Judicial Authority / Role'}
                </h3>
                <p className="text-xs text-gray-600">
                  {language === 'hi'
                    ? 'कृपया अपने आधिकारिक कार्यक्षेत्र का चयन करें ताकि उचित विशेषाधिकार सक्रिय किए जा सकें।'
                    : 'Choose your jurisdictional profile to assign secure role-based cryptographic access.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRole(r.id);
                      if (r.id === 'citizen') {
                        setFullName('Smt. Meera Sundaram');
                        setIdNumber('9812-4029-1092');
                      } else if (r.id === 'judicial_officer') {
                        setFullName('Hon’ble Justice Alok K. Sen');
                        setIdNumber('JO-DL-98231');
                      } else if (r.id === 'law_enforcement') {
                        setFullName('Insp. Vikramaditya Singh');
                        setIdNumber('CCTNS-DEL-4019');
                      } else if (r.id === 'forensic') {
                        setFullName('Dr. Ananya Mukherjee, FSL');
                        setIdNumber('CFSL-BIO-9021');
                      } else {
                        setFullName('Adv. Rajesh K. Sharma');
                        setIdNumber('D/1842/2016');
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                      selectedRole === r.id
                        ? 'bg-amber-50/60 border-[#fc6018] shadow-sm ring-1 ring-[#fc6018]'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedRole === r.id
                          ? 'bg-[#fc6018] text-white'
                          : 'bg-slate-100 text-[#002244]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {r.icon}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#001C3A]">
                        {language === 'hi' ? r.titleHi : r.titleEn}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {r.idLabel}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Identification & Jurisdiction */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#001C3A] uppercase tracking-wider mb-1">
                  {language === 'hi'
                    ? 'आधिकारिक पहचान व कार्यक्षेत्र विवरण'
                    : 'Official Identity & Jurisdiction Details'}
                </h3>
                <p className="text-xs text-gray-600">
                  {language === 'hi'
                    ? 'राष्ट्रीय एकीकृत ग्रिड में सत्यापन हेतु विवरण दर्ज करें।'
                    : 'Provide credentials for cross-verification with Pan-India judicial databases.'}
                </p>
              </div>

              <div className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#002244] mb-1">
                    {language === 'hi' ? 'पूर्ण नाम' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-[#001C3A] font-medium focus:outline-none focus:border-[#fc6018] focus:ring-1 focus:ring-[#fc6018]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002244] mb-1">
                    {roles.find((r) => r.id === selectedRole)?.idLabel || 'ID Number'}
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder={
                      roles.find((r) => r.id === selectedRole)?.idPlaceholder
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-[#001C3A] font-medium focus:outline-none focus:border-[#fc6018] focus:ring-1 focus:ring-[#fc6018]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#002244] mb-1">
                      {language === 'hi' ? 'राज्य / केंद्रशासित प्रदेश' : 'State / UT'}
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-[#001C3A] font-medium focus:outline-none focus:border-[#fc6018]"
                    >
                      <option>Delhi (NCT)</option>
                      <option>Maharashtra</option>
                      <option>Karnataka</option>
                      <option>Uttar Pradesh</option>
                      <option>Tamil Nadu</option>
                      <option>West Bengal</option>
                      <option>Gujarat</option>
                      <option>Rajasthan</option>
                      <option>Punjab & Haryana</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#002244] mb-1">
                      {language === 'hi' ? 'न्यायिक संस्था' : 'Court Jurisdiction'}
                    </label>
                    <select
                      value={courtJurisdiction}
                      onChange={(e) => setCourtJurisdiction(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-[#001C3A] font-medium focus:outline-none focus:border-[#fc6018]"
                    >
                      <option>Supreme Court of India</option>
                      <option>High Court of Judicature at Delhi</option>
                      <option>High Court of Bombay</option>
                      <option>Karnataka High Court</option>
                      <option>Allahabad High Court</option>
                      <option>Madras High Court</option>
                      <option>District & Sessions Court, Central</option>
                    </select>
                  </div>
                </div>

                {isVerifying && (
                  <div className="mt-4 p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs space-y-1.5 shadow-inner">
                    <div className="flex items-center space-x-2 text-white font-bold pb-1 border-b border-slate-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>MeghRaj Sovereign Security Handshake</span>
                    </div>
                    {verificationLogs.map((log, i) => (
                      <div key={i} className="flex items-center space-x-1.5">
                        <span className="text-amber-400">›</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Sovereign Badge Issued */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#001C3A] font-serif-merriweather">
                  {language === 'hi'
                    ? 'संप्रभु न्यायिक प्रमाणीकरण सफल!'
                    : 'Sovereign Judicial Clearance Approved'}
                </h3>
                <p className="text-xs text-gray-600 max-w-md mt-1">
                  {language === 'hi'
                    ? 'आपकी पहचान भारत सरकार के राष्ट्रीय न्याय नेटवर्क से विधिवत सत्यापित कर ली गई है।'
                    : 'Your identity has been authenticated across the sovereign judicial cloud with full audit clearance.'}
                </p>
              </div>

              {/* Digital Token Card */}
              <div className="w-full max-w-md bg-gradient-to-br from-slate-900 to-[#002244] text-white p-4 rounded-xl shadow-md border border-amber-400/30 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <span className="material-symbols-outlined text-7xl">security</span>
                </div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-[10px] text-amber-300 uppercase tracking-widest font-bold">
                      ANVESHAK Sovereign Pass
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {fullName}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                    ACTIVE
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 border-t border-white/10 pt-2">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Role:</span>
                    <span className="font-semibold text-white capitalize">
                      {selectedRole.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Identifier:</span>
                    <span className="font-semibold text-amber-200">{idNumber}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[10px] block">Bench / Node:</span>
                    <span className="font-semibold text-white">{courtJurisdiction}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {step > 1 && step < 3 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={isVerifying}
              className="px-4 py-2 rounded-lg text-xs font-bold text-[#002244] hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'पिछला' : 'Back'}
            </button>
          ) : (
            <div></div>
          )}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#fc6018] to-[#e65100] text-white text-xs font-extrabold shadow-sm hover:from-[#ff6f1f] hover:to-[#c44300] transition-all flex items-center space-x-1.5 cursor-pointer ml-auto"
            >
              <span>{language === 'hi' ? 'अगला: क्रेडेंशियल्स' : 'Next: Verification'}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}

          {step === 2 && (
            <button
              onClick={handleStartVerification}
              disabled={isVerifying || !fullName || !idNumber}
              className={`px-6 py-2.5 rounded-lg text-white text-xs font-extrabold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer ml-auto ${
                isVerifying || !fullName || !idNumber
                  ? 'bg-slate-400 opacity-60 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#fc6018] to-[#e65100] hover:from-[#ff6f1f] hover:to-[#c44300]'
              }`}
            >
              {isVerifying ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying via MeghRaj...</span>
                </>
              ) : (
                <>
                  <span>
                    {language === 'hi' ? 'हैंडशेक सत्यापित करें' : 'Verify & Authorize'}
                  </span>
                  <span className="material-symbols-outlined text-sm">lock_open</span>
                </>
              )}
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleFinish}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>
                {language === 'hi'
                  ? 'नेटवर्क पोर्टल डैशबोर्ड में प्रवेश करें'
                  : 'Enter Sovereign Justice Terminal'}
              </span>
              <span className="material-symbols-outlined text-sm">dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
