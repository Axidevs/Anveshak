import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  PenTool,
  Lock,
  CheckCircle,
  X,
  Fingerprint
} from 'lucide-react';

const SignatureVerification = ({
  isOpen,
  onClose,
  onVerified,
  officerName,
  actionDescription
}) => {
  const canvasRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [method, setMethod] = useState('canvas');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Reset verification state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setVerificationSuccess(false);
      setSuccessData(null);
      setIsAuthenticating(false);
      setHasSignature(false);
      setMethod('canvas');
    }
  }, [isOpen]);

  // Canvas setup
  useEffect(() => {
    if (
      isOpen &&
      method === 'canvas' &&
      canvasRef.current &&
      !verificationSuccess
    ) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0f172a';
    }
  }, [isOpen, method, verificationSuccess]);

  // --------------------------------------------------
  // DRAWING
  // --------------------------------------------------

  const getPointerPosition = (e) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();

    const clientX =
      e.clientX ??
      e.touches?.[0]?.clientX;

    const clientY =
      e.clientY ??
      e.touches?.[0]?.clientY;

    if (
      typeof clientX !== 'number' ||
      typeof clientY !== 'number'
    ) {
      return null;
    }

    return {
      x:
        ((clientX - rect.left) / rect.width) *
        canvas.width,

      y:
        ((clientY - rect.top) / rect.height) *
        canvas.height
    };
  };

  const startDrawing = (e) => {
    if (verificationSuccess) return;

    e.preventDefault();

    const canvas = canvasRef.current;

    if (!canvas) return;

    const position = getPointerPosition(e);

    if (!position) return;

    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(position.x, position.y);

    setIsDrawing(true);
  };

  const draw = (e) => {
    if (
      !isDrawing ||
      verificationSuccess
    ) {
      return;
    }

    e.preventDefault();

    const canvas = canvasRef.current;

    if (!canvas) return;

    const position = getPointerPosition(e);

    if (!position) return;

    const ctx = canvas.getContext('2d');

    ctx.lineTo(position.x, position.y);
    ctx.stroke();

    setHasSignature(true);
  };

  const stopDrawing = (e) => {
    if (e) {
      e.preventDefault();
    }

    if (isDrawing) {
      const canvas = canvasRef.current;

      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.closePath();
      }

      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    setHasSignature(false);
  };

  // --------------------------------------------------
  // VERIFICATION
  // --------------------------------------------------

  const handleVerify = (selectedMethod) => {
    if (selectedMethod === 'digilocker') {
      setIsAuthenticating(true);

      setTimeout(() => {
        completeVerification('digilocker');
      }, 2000);

      return;
    }

    if (!hasSignature) {
      return;
    }

    completeVerification('canvas');
  };

  const completeVerification = (usedMethod) => {
    const timestamp = new Date().toISOString();

    const data = {
      method: usedMethod,
      officerName,
      timestamp
    };

    setIsAuthenticating(false);
    setSuccessData(data);
    setVerificationSuccess(true);

    /*
      IMPORTANT:

      We call onVerified FIRST.

      We DO NOT call onClose here.

      The parent component decides what should happen
      after verification.

      For CaseDetail:
      timelineSignatureVerified becomes true
      → SignatureVerification disappears
      → Timeline form appears.
    */

    if (typeof onVerified === 'function') {
      onVerified(data);
    }
  };

  // --------------------------------------------------
  // CLOSE
  // --------------------------------------------------

  const handleClose = () => {
    if (
      isAuthenticating ||
      verificationSuccess
    ) {
      return;
    }

    setHasSignature(false);
    setSuccessData(null);
    setVerificationSuccess(false);
    setMethod('canvas');

    if (typeof onClose === 'function') {
      onClose();
    }
  };

  // --------------------------------------------------
  // HIDDEN
  // --------------------------------------------------

  if (!isOpen) {
    return null;
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-cream overflow-hidden">

        {/* Header */}

        <div className="flex items-center justify-between px-6 py-4 border-b border-navy/10 bg-gradient-to-r from-navy/5 to-transparent">

          <div className="flex items-center gap-3">

            <Shield className="w-6 h-6 text-navy" />

            <h2 className="text-xl font-serif font-bold text-navy">
              Verify Your Identity to Confirm This Action
            </h2>

          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-navy/10 transition-colors"
            disabled={
              isAuthenticating ||
              verificationSuccess
            }
          >
            <X className="w-5 h-5 text-charcoal" />
          </button>

        </div>

        {/* Content */}

        <div className="p-6">

          {/* Action information */}

          <div className="mb-6 p-4 rounded-xl bg-navy/5 border border-navy/10">

            <p className="text-sm text-charcoal font-medium">
              Action:{' '}
              <span className="text-navy">
                {actionDescription}
              </span>
            </p>

            <p className="text-xs text-charcoal/70 mt-1">
              Officer:{' '}
              <span className="font-semibold">
                {officerName}
              </span>
            </p>

          </div>

          {/* SUCCESS */}

          {verificationSuccess ? (

            <div className="flex flex-col items-center justify-center py-8 animate-fade-in-up">

              <CheckCircle className="w-16 h-16 text-forest mb-4" />

              <h3 className="text-lg font-bold text-forest mb-2">
                Verification Successful
              </h3>

              <p className="text-sm text-center text-charcoal px-4">
                Action verified and logged —{' '}
                {successData?.officerName},{' '}
                {successData?.timestamp
                  ? new Date(
                      successData.timestamp
                    ).toLocaleString()
                  : ''}
              </p>

              <p className="text-xs text-slate-500 mt-4">
                Continuing to the next step...
              </p>

            </div>

          ) : (

            <>

              {/* Method Tabs */}

              <div className="flex p-1 mb-6 bg-cream/50 rounded-lg">

                <button
                  type="button"
                  onClick={() =>
                    setMethod('canvas')
                  }
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    method === 'canvas'
                      ? 'bg-white text-navy shadow-sm'
                      : 'text-charcoal hover:text-navy'
                  }`}
                >

                  <PenTool className="w-4 h-4" />

                  E-Signature

                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMethod('digilocker')
                  }
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    method === 'digilocker'
                      ? 'bg-white text-navy shadow-sm'
                      : 'text-charcoal hover:text-navy'
                  }`}
                >

                  <Fingerprint className="w-4 h-4" />

                  DigiLocker

                </button>

              </div>

              {/* E-SIGNATURE */}

              {method === 'canvas' ? (

                <div className="space-y-4 animate-fade-in-up">

                  <div className="relative">

                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={200}
                      className="w-full bg-cream/30 border-2 border-dashed border-navy/20 rounded-xl cursor-crosshair touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />

                    {!hasSignature &&
                      !isDrawing && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

                          <span className="text-navy/40 font-medium select-none">
                            Draw your signature here
                          </span>

                        </div>
                      )}

                  </div>

                  <div className="flex justify-end gap-3">

                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="px-4 py-2 text-sm font-medium text-charcoal hover:text-navy hover:bg-navy/5 rounded-lg transition-colors"
                    >
                      Clear
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleVerify('canvas')
                      }
                      disabled={!hasSignature}
                      className="px-6 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-navy/20"
                    >

                      <CheckCircle className="w-4 h-4" />

                      Submit Signature

                    </button>

                  </div>

                </div>

              ) : (

                /* DIGILOCKER */

                <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-fade-in-up">

                  <div className="w-20 h-20 bg-navy/5 rounded-full flex items-center justify-center border-4 border-white shadow-inner">

                    <Lock className="w-10 h-10 text-navy" />

                  </div>

                  <div className="text-center">

                    <h3 className="text-lg font-bold text-navy mb-2">
                      Secure Authentication
                    </h3>

                    <p className="text-sm text-charcoal/80 mb-6 max-w-sm">
                      Authenticate with your official DigiLocker credentials to verify this critical action.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        handleVerify('digilocker')
                      }
                      disabled={isAuthenticating}
                      className="relative px-8 py-3 bg-navy text-white font-medium rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-80 flex items-center justify-center gap-3 w-full shadow-lg shadow-navy/20"
                    >

                      {isAuthenticating ? (

                        <>

                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >

                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />

                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />

                          </svg>

                          Authenticating...

                        </>

                      ) : (

                        <>

                          <Fingerprint className="w-5 h-5" />

                          Verify via DigiLocker

                        </>

                      )}

                    </button>

                  </div>

                </div>

              )}

            </>

          )}

        </div>

      </div>
    </div>
  );
};

export default SignatureVerification;