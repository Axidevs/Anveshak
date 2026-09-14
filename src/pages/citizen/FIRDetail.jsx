import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CaseTimeline from '../../components/shared/CaseTimeline';
import { apiFetch } from '../../utils/api';

import {
  ArrowLeft,
  Download,
  MapPin,
  Calendar,
  User,
  File,
  Phone,
  Mail,
  FileText,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function FIRDetail() {
  const { id } = useParams();

  const [fir, setFir] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFIRDetails = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Fetch the actual FIR
        const firResponse = await apiFetch(`/fir/${id}`);

        const backendFIR =
          firResponse?.fir ||
          firResponse?.data ||
          firResponse;

        if (!backendFIR) {
          throw new Error('FIR record not found.');
        }

        setFir(backendFIR);

        // Fetch citizen's cases and find the case linked to this FIR
        try {
          const caseResponse = await apiFetch('/case');

          const cases =
            Array.isArray(caseResponse)
              ? caseResponse
              : caseResponse?.cases ||
                caseResponse?.data ||
                [];

          const linkedCase = cases.find(
            (item) =>
              String(item.firId || item.firID || '') ===
                String(backendFIR._id || backendFIR.id || id) ||
              String(item.firNumber || '') ===
                String(backendFIR.firNumber || '')
          );

          if (linkedCase) {
            setCaseData(linkedCase);

            try {
              const timelineResponse = await apiFetch(
                `/case/${linkedCase.caseId}/timeline`
              );

              const backendTimeline =
                Array.isArray(timelineResponse)
                  ? timelineResponse
                  : timelineResponse?.timeline ||
                    timelineResponse?.data ||
                    [];

              setTimeline(backendTimeline);
            } catch (timelineError) {
              console.warn(
                'Timeline could not be loaded:',
                timelineError
              );
              setTimeline([]);
            }
          }
        } catch (caseError) {
          console.warn(
            'Linked case could not be loaded:',
            caseError
          );
        }
      } catch (err) {
        console.error('Failed to load FIR details:', err);

        setError(
          err.message ||
            'Unable to load FIR details.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadFIRDetails();
  }, [id]);

  const getStatusInfo = (status) => {
    const normalized = (status || 'SUBMITTED').toUpperCase();

    switch (normalized) {
      case 'SUBMITTED':
        return {
          step: 1,
          color: 'bg-blue-500',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          label: 'Filed'
        };

      case 'UNDER_REVIEW':
        return {
          step: 2,
          color: 'bg-amber-500',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          label: 'Under Review'
        };

      case 'REGISTERED':
        return {
          step: 2,
          color: 'bg-amber-500',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          label: 'Registered'
        };

      case 'UNDER_INVESTIGATION':
      case 'INVESTIGATION':
      case 'EVIDENCE_COLLECTION':
        return {
          step: 3,
          color: 'bg-orange-500',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          label: 'Under Investigation'
        };

      case 'CHARGE_SHEET':
      case 'CHARGESHEET':
        return {
          step: 4,
          color: 'bg-orange-500',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          label: 'Chargesheet Filed'
        };

      case 'COURT_PROCEEDINGS':
      case 'COURT':
        return {
          step: 4,
          color: 'bg-purple-500',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          label: 'In Court'
        };

      case 'RESOLVED':
      case 'CLOSED':
      case 'DISPOSED':
        return {
          step: 5,
          color: 'bg-emerald-500',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          label: 'Resolved'
        };

      default:
        return {
          step: 1,
          color: 'bg-blue-500',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          label: 'Filed'
        };
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return 'Not specified';
    }

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'Not specified';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return 'Not specified';
    }

    return parsed.toLocaleString('en-IN');
  };

  const getOfficerName = () => {
    if (!caseData?.assignedOfficer) {
      return 'Pending Assignment';
    }

    if (typeof caseData.assignedOfficer === 'object') {
      return (
        caseData.assignedOfficer.name ||
        caseData.assignedOfficer.email ||
        'Assigned Officer'
      );
    }

    return 'Assigned Officer';
  };

  const getCaseStatus = () => {
    if (caseData?.status) {
      return caseData.status;
    }

    return fir?.status || 'SUBMITTED';
  };

  const buildTimeline = () => {
    if (timeline.length > 0) {
      return timeline.map((item) => ({
        date: item.createdAt
          ? formatDate(item.createdAt)
          : 'Updated',
        event:
          item.action ||
          item.status ||
          'Case Update',
        description:
          item.description ||
          'Case activity recorded in Anveshak.'
      }));
    }

    return [
      {
        date: fir?.createdAt
          ? formatDate(fir.createdAt)
          : 'TBD',
        event: 'FIR Registered',
        description:
          'Your FIR has been successfully submitted in the system.'
      },
      {
        date:
          statusInfo.step >= 2
            ? 'Updated'
            : 'Pending',
        event: 'Under Review',
        description:
          'The submitted FIR is being reviewed by the concerned authorities.'
      },
      {
        date:
          statusInfo.step >= 3
            ? 'Updated'
            : 'Pending',
        event: 'Evidence Collection',
        description:
          'Investigation and evidence collection activities will be recorded here.'
      },
      {
        date:
          statusInfo.step >= 4
            ? 'Updated'
            : 'Pending',
        event: 'Chargesheet / Court',
        description:
          'Further legal proceedings will appear here when recorded.'
      },
      {
        date:
          statusInfo.step >= 5
            ? 'Updated'
            : 'Pending',
        event: 'Resolved',
        description:
          'Final case resolution will be reflected here.'
      }
    ];
  };

  const downloadCopy = () => {
    if (!fir) return;

    const firNumber =
      fir.firNumber ||
      fir._id ||
      fir.id ||
      'Anveshak-FIR';

    const content = `
ANVESHAK
SECURE DIGITAL JUSTICE PLATFORM

========================================
FIRST INFORMATION REPORT
========================================

FIR NUMBER:
${fir.firNumber || 'N/A'}

CATEGORY:
${fir.category || 'Other'}

STATUS:
${statusInfo.label}

DATE & TIME OF INCIDENT:
${formatDateTime(fir.incidentDate)}

LOCATION:
${fir.incidentLocation || 'Not specified'}

COMPLAINANT:
${fir.complainant || 'Registered Citizen'}

INVESTIGATING OFFICER:
${getOfficerName()}

INCIDENT DESCRIPTION:
${fir.incidentDescription || 'No description provided.'}

========================================
DIGITAL RECORD INFORMATION
========================================

FIR RECORD ID:
${fir._id || fir.id || 'N/A'}

CASE ID:
${caseData?.caseId || 'Not created / unavailable'}

CREATED AT:
${formatDateTime(fir.createdAt)}

LAST UPDATED:
${formatDateTime(fir.updatedAt || fir.createdAt)}

========================================

This document is a digitally generated copy
of the FIR record stored in Anveshak.

Secure • Transparent • Accountable
`;

    try {
      const blob = new Blob([content], {
        type: 'text/plain;charset=utf-8'
      });

      const url = URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${firNumber}-FIR-Copy.txt`;

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (downloadError) {
      console.error(
        'FIR download failed:',
        downloadError
      );

      alert('Unable to download FIR copy.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100 shadow-md p-10 text-center">
          <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">
            Loading FIR details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !fir) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-red-100 shadow-md p-10 text-center max-w-md">
          <AlertCircle
            className="w-12 h-12 text-red-500 mx-auto mb-4"
          />

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Unable to Load FIR
          </h2>

          <p className="text-slate-500 text-sm mb-6">
            {error || 'FIR record was not found.'}
          </p>

          <Link
            to="/citizen/view-firs"
            className="inline-flex items-center px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My FIRs
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(
    getCaseStatus()
  );

  const citizenTimeline = buildTimeline();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Navigation */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <Link
            to="/citizen/view-firs"
            className="flex items-center text-purple-700 hover:text-purple-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to My FIRs
          </Link>

          <button
            onClick={downloadCopy}
            className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors shadow-sm text-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Copy
          </button>
        </div>

        {/* Status Banner */}
        <div
          className={`rounded-xl p-4 flex items-center ${statusInfo.bg} ${statusInfo.border} border shadow-sm animate-scale-in`}
        >
          <div
            className={`w-3 h-3 rounded-full ${statusInfo.color} animate-pulse mr-3`}
          />

          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider opacity-70 mb-0.5">
              Current Status
            </p>

            <p
              className={`font-semibold text-lg ${statusInfo.text}`}
            >
              {statusInfo.label}
            </p>
          </div>

          <ShieldCheck
            className={`w-8 h-8 opacity-20 ${statusInfo.text}`}
          />
        </div>

        {/* FIR Header Card */}
        <div
          className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100 shadow-md p-6 sm:p-8 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6 border-b border-purple-50 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-sm font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-md">
                  {fir.firNumber ||
                    fir._id ||
                    fir.id}
                </span>

                <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                  {fir.category || 'General'}
                </span>
              </div>

              <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                {fir.category || 'FIR Report'}
              </h1>

              <p className="text-slate-600 flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {fir.incidentLocation ||
                  'Incident Location'}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-slate-500 text-sm mb-1">
                Date Filed
              </p>

              <p className="font-medium text-slate-800 flex items-center md:justify-end">
                <Calendar className="w-4 h-4 mr-1 text-purple-500" />
                {formatDate(fir.createdAt)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">
                Police Station
              </p>

              <p className="font-medium text-slate-800">
                {caseData?.jurisdiction ||
                  'Concerned Police Station'}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 mb-1">
                Investigating Officer
              </p>

              <p className="font-medium text-slate-800 flex items-center">
                <User className="w-4 h-4 mr-2 text-purple-500" />
                {getOfficerName()}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">

            {/* Case Timeline */}
            <div
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100 shadow-md p-6 sm:p-8 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <h2 className="text-xl font-serif font-semibold text-slate-800 mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-600" />
                Track Progress
              </h2>

              <CaseTimeline
                stages={citizenTimeline}
                currentStep={statusInfo.step}
                totalStages={5}
              />
            </div>

            {/* Documents */}
            <div
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100 shadow-md p-6 animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <h2 className="text-lg font-serif font-semibold text-slate-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-600" />
                Attached Documents
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50/50 border border-purple-100 rounded-lg hover:bg-purple-50 transition-colors">
                  <div className="flex items-center">
                    <File className="w-5 h-5 text-purple-500 mr-3" />

                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Original FIR Copy.pdf
                      </p>

                      <p className="text-xs text-slate-500">
                        Auto-generated •{' '}
                        {formatDate(fir.createdAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={downloadCopy}
                    className="text-purple-600 hover:text-purple-800 p-2 bg-white rounded-md shadow-sm"
                    title="Download FIR copy"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Next Steps */}
            <div
              className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-md p-6 text-white animate-fade-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              <h3 className="font-serif font-semibold text-lg mb-3 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-purple-200" />
                What happens next?
              </h3>

              <p className="text-sm text-purple-100 mb-4 leading-relaxed">
                {statusInfo.step === 1
                  ? 'Your FIR has been submitted. An Investigating Officer (IO) will be assigned shortly to begin the inquiry.'
                  : statusInfo.step === 2
                    ? 'Your FIR is currently under review. The concerned authorities are processing the submission.'
                    : statusInfo.step === 3
                      ? 'The investigation is currently progressing. Evidence and case activities will be updated as they occur.'
                      : statusInfo.step === 4
                        ? 'The case has progressed toward legal proceedings. Further updates will appear here.'
                        : 'The case has reached its final recorded stage.'}
              </p>

              <button className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                Read Citizen Guide
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {/* Contact IO */}
            <div
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100 shadow-md p-6 animate-fade-in-up"
              style={{ animationDelay: '0.5s' }}
            >
              <h3 className="text-lg font-serif font-semibold text-slate-800 mb-4 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-purple-600" />
                Contact Officer
              </h3>

              <div className="flex items-center mb-4 pb-4 border-b border-purple-50">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <User className="w-6 h-6 text-purple-600" />
                </div>

                <div>
                  <p className="font-medium text-slate-800">
                    {getOfficerName()}
                  </p>

                  <p className="text-xs text-slate-500">
                    Investigating Officer
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-center py-2.5 px-4 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-sm font-medium transition-colors border border-purple-100">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Station
                </button>

                <button className="w-full flex items-center justify-center py-2.5 px-4 bg-white text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors border border-slate-200">
                  <Mail className="w-4 h-4 mr-2" />
                  Message Officer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}