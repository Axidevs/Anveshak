import React, { useState } from 'react';

import { Link } from 'react-router-dom';

import {
  Shield,
  Clock,
  BadgeCheck,
  Scale
} from 'lucide-react';

const CourtRegister = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [verifiedData, setVerifiedData] =
    useState(null);

  const [courtType, setCourtType] =
    useState('');

  const [courtId, setCourtId] =
    useState('');

  const [jurisdiction, setJurisdiction] =
    useState('');

  const verifyDigiLocker = () => {
    setLoading(true);

    setTimeout(() => {
      setVerifiedData({
        name: 'Hon. Court Officer',
        id: 'XXXX-XXXX-7890',
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
            Court Registration
          </h1>

          <p className="text-charcoal/70">
            Official account creation for Court & Judicial staff
          </p>

        </div>

        {/* Stepper */}

        <div className="flex items-center justify-between mb-8 relative">

          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2 rounded-full" />

          <div
            className="absolute left-0 top-1/2 h-1 bg-navy -z-10 transform -translate-y-1/2 rounded-full transition-all duration-500"
            style={{
              width: `${(step - 1) * 50}%`
            }}
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
              Court Details
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

          {/* STEP 1 */}

          {step === 1 && (

            <div className="space-y-6 text-center animate-in fade-in">

              <h2 className="text-xl font-bold text-navy mb-2">
                Identity Verification
              </h2>

              <p className="text-sm text-charcoal/70 mb-8">
                Court accounts require strict identity verification through Govt of India Parichay / DigiLocker.
              </p>

              {loading ? (

                <div className="py-8 flex flex-col items-center">

                  <div className="w-12 h-12 border-4 border-navy border-t-transparent rounded-full animate-spin mb-4" />

                  <p className="font-semibold text-navy">
                    Authenticating Court Credentials...
                  </p>

                </div>

              ) : (

                <button
                  onClick={verifyDigiLocker}
                  className="w-full bg-navy text-white p-4 rounded-xl font-bold hover:bg-navy-800 transition-colors shadow-sm flex flex-col items-center justify-center gap-2 h-32 hover:-translate-y-1"
                >

                  <Shield
                    size={32}
                    className="text-saffron"
                  />

                  <span>
                    Verify via Govt ID
                  </span>

                </button>

              )}

            </div>
          )}

          {/* STEP 2 */}

          {step === 2 && verifiedData && (

            <form
              onSubmit={handleSubmitDetails}
              className="space-y-5 animate-in fade-in slide-in-from-right-4"
            >

              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-6">

                <BadgeCheck
                  size={24}
                  className="text-forest"
                />

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
                Court Details
              </h2>

              <div>

                <label className="block text-sm font-medium text-charcoal/80 mb-2">
                  Court Type
                </label>

                <select
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navy focus:border-transparent text-charcoal"
                  value={courtType}
                  onChange={(e) =>
                    setCourtType(e.target.value)
                  }
                >

                  <option value="" disabled>
                    Select Court Type
                  </option>

                  <option value="district">
                    District Court
                  </option>

                  <option value="high">
                    High Court
                  </option>

                  <option value="supreme">
                    Supreme Court
                  </option>

                </select>

              </div>

              <div>

                <label className="block text-sm font-medium text-charcoal/80 mb-2">
                  Court / Officer ID
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. COURT-DEL-001"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navy focus:border-transparent text-charcoal uppercase"
                  value={courtId}
                  onChange={(e) =>
                    setCourtId(e.target.value)
                  }
                />

              </div>

              <div>

                <label className="block text-sm font-medium text-charcoal/80 mb-2">
                  Jurisdiction
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Delhi District"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navy focus:border-transparent text-charcoal"
                  value={jurisdiction}
                  onChange={(e) =>
                    setJurisdiction(e.target.value)
                  }
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

          {/* STEP 3 */}

          {step === 3 && (

            <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4 py-8">

              <div className="relative inline-block mb-4">

                <Clock
                  size={64}
                  className="text-saffron animate-pulse"
                />

                <div className="absolute top-0 right-0 w-4 h-4 bg-navy rounded-full border-2 border-white animate-bounce" />

              </div>

              <h2 className="text-2xl font-bold text-navy">
                Registration Submitted
              </h2>

              <div className="bg-cream p-6 rounded-xl border border-gray-200">

                <p className="text-charcoal font-medium mb-2">
                  Your court account is pending verification.
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
                    REQ-COURT-2026
                  </p>

                </div>

              </div>

              <p className="text-sm text-charcoal/60">
                You will receive an SMS/Email once your access is approved by the authorized court administrator.
              </p>

              <Link
                to="/login"
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
              to="/login"
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

export default CourtRegister;

