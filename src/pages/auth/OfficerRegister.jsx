import React, { useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import {
  Shield,
  CheckCircle,
  User,
  Building,
  MapPin,
  Clock,
  BadgeCheck
} from 'lucide-react';

// Static registration options — no mockData dependency
const departments = [
  {
    value: 'delhi_police',
    label: 'Delhi Police',
    labelHi: 'दिल्ली पुलिस'
  },
  {
    value: 'mumbai_police',
    label: 'Mumbai Police',
    labelHi: 'मुम्बई पुलिस'
  },
  {
    value: 'up_police',
    label: 'Uttar Pradesh Police',
    labelHi: 'उत्तर प्रदेश पुलिस'
  },
  {
    value: 'cbi',
    label: 'Central Bureau of Investigation (CBI)',
    labelHi: 'केंद्रीय जांच ब्यूरो (CBI)'
  },
  {
    value: 'ed',
    label: 'Enforcement Directorate (ED)',
    labelHi: 'प्रवर्तन निदेशालय (ED)'
  },
  {
    value: 'cbic',
    label: 'Central Board of Indirect Taxes & Customs',
    labelHi: 'केंद्रीय अप्रत्यक्ष कर एवं सीमा शुल्क बोर्ड'
  },
  {
    value: 'nia',
    label: 'National Investigation Agency (NIA)',
    labelHi: 'राष्ट्रीय जांच एजेंसी (NIA)'
  },
  {
    value: 'ncb',
    label: 'Narcotics Control Bureau (NCB)',
    labelHi: 'नारकोटिक्स कंट्रोल ब्यूरो (NCB)'
  },
  {
    value: 'judiciary',
    label: 'Judiciary',
    labelHi: 'न्यायपालिका'
  }
];

const ranks = {
  delhi_police: [
    { value: 'constable', label: 'Constable', labelHi: 'कांस्टेबल' },
    { value: 'hc', label: 'Head Constable', labelHi: 'हेड कांस्टेबल' },
    { value: 'si', label: 'Sub-Inspector (SI)', labelHi: 'उप निरीक्षक (SI)' },
    { value: 'inspector', label: 'Inspector', labelHi: 'निरीक्षक' },
    { value: 'acp', label: 'ACP', labelHi: 'ACP' },
    { value: 'dcp', label: 'DCP', labelHi: 'DCP' },
    { value: 'jcp', label: 'Joint CP', labelHi: 'संयुक्त CP' }
  ],

  mumbai_police: [
    { value: 'constable', label: 'Constable', labelHi: 'कांस्टेबल' },
    { value: 'hc', label: 'Head Constable', labelHi: 'हेड कांस्टेबल' },
    { value: 'api', label: 'API (Asst. Police Inspector)', labelHi: 'API' },
    { value: 'pi', label: 'Police Inspector (PI)', labelHi: 'पुलिस इन्स्पेक्टर (PI)' },
    { value: 'acp', label: 'ACP', labelHi: 'ACP' },
    { value: 'dcp', label: 'DCP', labelHi: 'DCP' }
  ],

  up_police: [
    { value: 'constable', label: 'Constable', labelHi: 'कांस्टेबल' },
    { value: 'hc', label: 'Head Constable', labelHi: 'हेड कांस्टेबल' },
    { value: 'si', label: 'Sub-Inspector (SI)', labelHi: 'उप निरीक्षक (SI)' },
    { value: 'inspector', label: 'Inspector', labelHi: 'निरीक्षक' },
    { value: 'co', label: 'Circle Officer (CO)', labelHi: 'सर्किल ऑफिसर (CO)' },
    { value: 'sp', label: 'SP', labelHi: 'SP' }
  ],

  cbi: [
    { value: 'inspector', label: 'Inspector', labelHi: 'निरीक्षक' },
    { value: 'dsp', label: 'Deputy SP', labelHi: 'उप अधीक्षक' },
    { value: 'sp', label: 'Superintendent', labelHi: 'अधीक्षक' },
    { value: 'addl_sp', label: 'Addl. Superintendent', labelHi: 'अतिरिक्त अधीक्षक' },
    { value: 'jd', label: 'Joint Director', labelHi: 'संयुक्त निदेशक' }
  ],

  ed: [
    { value: 'eo', label: 'Enforcement Officer', labelHi: 'प्रवर्तन अधिकारी' },
    { value: 'aed', label: 'Asst. Enforcement Director', labelHi: 'सहायक प्रवर्तन निदेशक' },
    { value: 'dep_dir', label: 'Deputy Director', labelHi: 'उप निदेशक' },
    { value: 'jd', label: 'Joint Director', labelHi: 'संयुक्त निदेशक' },
    { value: 'spl_dir', label: 'Special Director', labelHi: 'विशेष निदेशक' }
  ],

  cbic: [
    { value: 'inspector', label: 'Inspector', labelHi: 'निरीक्षक' },
    { value: 'supdt', label: 'Superintendent', labelHi: 'अधीक्षक' },
    { value: 'asst_comm', label: 'Asst. Commissioner', labelHi: 'सहायक आयुक्त' },
    { value: 'dep_comm', label: 'Deputy Commissioner', labelHi: 'उपायुक्त' },
    { value: 'commissioner', label: 'Commissioner', labelHi: 'आयुक्त' }
  ],

  nia: [
    { value: 'inspector', label: 'Inspector', labelHi: 'निरीक्षक' },
    { value: 'dsp', label: 'Deputy SP', labelHi: 'उप अधीक्षक' },
    { value: 'sp', label: 'Superintendent', labelHi: 'अधीक्षक' },
    { value: 'ig', label: 'Inspector General', labelHi: 'महानिरीक्षक' }
  ],

  ncb: [
    { value: 'io', label: 'Intelligence Officer', labelHi: 'खुफिया अधिकारी' },
    { value: 'supdt', label: 'Superintendent', labelHi: 'अधीक्षक' },
    { value: 'dep_dir', label: 'Deputy Director', labelHi: 'उप निदेशक' },
    { value: 'zonal_dir', label: 'Zonal Director', labelHi: 'जोनल निदेशक' }
  ],

  judiciary: [
    { value: 'court_clerk', label: 'Court Clerk', labelHi: 'कोर्ट क्लर्क' },
    { value: 'registrar', label: 'Registrar', labelHi: 'रजिस्ट्रार' },
    { value: 'addl_judge', label: 'Additional Judge', labelHi: 'अतिरिक्त न्यायाधीश' },
    { value: 'district_judge', label: 'District Judge', labelHi: 'जिला न्यायाधीश' },
    { value: 'hc_judge', label: 'High Court Judge', labelHi: 'उच्च न्यायालय न्यायाधीश' }
  ]
};

const OfficerRegister = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // DigiLocker demo state
  const [verifiedData, setVerifiedData] = useState(null);

  const [dept, setDept] = useState('');
  const [rank, setRank] = useState('');
  const [station, setStation] = useState('');

  const verifyDigiLocker = () => {
    setLoading(true);

    setTimeout(() => {
      setVerifiedData({
        name: 'Insp. Vikram Singh',
        id: 'XXXX-XXXX-4567',
        dob: '22-08-1985'
      });

      setLoading(false);
      setStep(2);
    }, 2000);
  };

  const handleSubmitDetails = (e) => {
    e.preventDefault();
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-xl">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-navy mb-2">
            Officer Registration
          </h1>

          <p className="text-charcoal/70">
            Official account creation for Government & Police staff
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 relative">

          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2 rounded-full" />

          <div
            className="absolute left-0 top-1/2 h-1 bg-navy -z-10 transform -translate-y-1/2 rounded-full transition-all duration-500"
            style={{ width: `${(step - 1) * 50}%` }}
          />

          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 1
                  ? 'bg-navy text-white'
                  : 'bg-gray-200 text-gray-500'
              } border-4 border-cream`}
            >
              1
            </div>

            <span className="text-xs font-semibold mt-1 text-charcoal/70">
              Identity
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 2
                  ? 'bg-navy text-white'
                  : 'bg-gray-200 text-gray-500'
              } border-4 border-cream`}
            >
              2
            </div>

            <span className="text-xs font-semibold mt-1 text-charcoal/70">
              Department
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 3
                  ? 'bg-navy text-white'
                  : 'bg-gray-200 text-gray-500'
              } border-4 border-cream`}
            >
              3
            </div>

            <span className="text-xs font-semibold mt-1 text-charcoal/70">
              Approval
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

          {step === 1 && (
            <div className="space-y-6 text-center animate-in fade-in">

              <h2 className="text-xl font-bold text-navy mb-2">
                Identity Verification
              </h2>

              <p className="text-sm text-charcoal/70 mb-8">
                Officer accounts require strict identity verification through
                Govt of India Parichay / DigiLocker.
              </p>

              {loading ? (
                <div className="py-8 flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-navy border-t-transparent rounded-full animate-spin mb-4" />

                  <p className="font-semibold text-navy">
                    Authenticating Officer Credentials...
                  </p>
                </div>
              ) : (
                <button
                  onClick={verifyDigiLocker}
                  className="w-full bg-navy text-white p-4 rounded-xl font-bold hover:bg-navy-800 transition-colors shadow-sm flex flex-col items-center justify-center gap-2 h-32 hover:-translate-y-1"
                >
                  <Shield size={32} className="text-saffron" />

                  <span>Verify via Govt ID</span>
                </button>
              )}
            </div>
          )}

          {step === 2 && verifiedData && (
            <form
              onSubmit={handleSubmitDetails}
              className="space-y-5 animate-in fade-in slide-in-from-right-4"
            >

              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-6">

                <BadgeCheck size={24} className="text-forest" />

                <div>
                  <p className="text-sm text-forest font-bold">
                    {verifiedData.name}
                  </p>

                  <p className="text-xs text-forest/70">
                    Verified ID: {verifiedData.id}
                  </p>
                </div>
              </div>

              <h2 className="text-xl font-bold text-navy mb-4">
                Department Details
              </h2>

              <div>
                <label className="block text-sm font-medium text-charcoal/80 mb-2">
                  Department
                </label>

                <select
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navy focus:border-transparent text-charcoal"
                  value={dept}
                  onChange={(e) => {
                    setDept(e.target.value);
                    setRank('');
                  }}
                >
                  <option value="" disabled>
                    Select Department
                  </option>

                  {departments.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal/80 mb-2">
                  Post / Rank
                </label>

                <select
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navy focus:border-transparent text-charcoal"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  disabled={!dept}
                >
                  <option value="" disabled>
                    Select Rank
                  </option>

                  {ranks[dept]
                    ? ranks[dept].map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))
                    : (
                      <option value="inspector">
                        Inspector
                      </option>
                    )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal/80 mb-2">
                  Station / Office ID
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. PS-Central-01"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navy focus:border-transparent text-charcoal uppercase"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-navy text-white p-3.5 rounded-xl font-bold hover:bg-navy-800 transition-colors shadow-sm mt-4"
              >
                Submit Request
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4 py-8">

              <div className="relative inline-block mb-4">
                <Clock size={64} className="text-saffron animate-pulse" />

                <div className="absolute top-0 right-0 w-4 h-4 bg-navy rounded-full border-2 border-white animate-bounce" />
              </div>

              <h2 className="text-2xl font-bold text-navy">
                Registration Submitted
              </h2>

              <div className="bg-cream p-6 rounded-xl border border-gray-200">

                <p className="text-charcoal font-medium mb-2">
                  Your account is pending supervisor approval.
                </p>

                <p className="text-sm text-charcoal/70">
                  Estimated review time:{' '}
                  <span className="font-bold">
                    Usually within 24-48 hours
                  </span>
                </p>

                <div className="mt-4 pt-4 border-t border-gray-200">

                  <p className="text-xs text-charcoal/50 uppercase font-semibold">
                    Reference Number
                  </p>

                  <p className="text-lg font-mono font-bold text-navy tracking-widest mt-1">
                    REQ-8921-GOV
                  </p>
                </div>
              </div>

              <p className="text-sm text-charcoal/60">
                You will receive an SMS/Email once your access is approved by
                your Nodal Officer.
              </p>

              <Link
                to="/auth/login"
                className="inline-block mt-4 text-navy font-bold hover:underline"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-charcoal/70">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-navy font-bold hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default OfficerRegister;