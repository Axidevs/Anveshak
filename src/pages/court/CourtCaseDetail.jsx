import React, { useEffect, useState } from 'react';

import { useParams, Link } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';

import { apiFetch } from '../../utils/api';

import CaseTimeline from '../../components/shared/CaseTimeline';

import FormalCaseChat from '../../components/shared/FormalCaseChat';

import SignatureVerification from '../../components/shared/SignatureVerification';

import {
  ArrowLeft,
  Download,
  Shield,
  Clock,
  MapPin,
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle,
  Link as LinkIcon,
  User,
  Activity,
  FileCheck,
  Plus,
  Scale,
  X
} from 'lucide-react';

import AuditTrail from '../../components/shared/AuditTrail';

const defaultTimeline = [
  {
    date: 'As filed',
    event: 'FIR Filed',
    description: 'First Information Report registered at station.',
    by: 'Station IO'
  },
  {
    date: 'Investigation',
    event: 'Investigation',
    description: 'Police investigation is in progress.',
    by: 'Investigating Officer'
  },
  {
    date: 'Court',
    event: 'Court Registered',
    description: 'Case registered in court docket.',
    by: 'Court Registry'
  }
];

const statusMap = {
  FIR_REGISTERED: 2,
  UNDER_REVIEW: 3,
  ASSIGNED: 4,
  INVESTIGATION: 5,
  EVIDENCE_COLLECTION: 6,
  FORENSIC_REVIEW: 7,
  CHARGE_SHEET: 8,
  COURT_PROCEEDINGS: 9,
  RESOLVED: 9
};

const formatStatus = (status) => {
  if (!status) return 'Court Trial';

  const map = {
    FIR_REGISTERED: 'FIR Registered',
    UNDER_REVIEW: 'Under Review',
    ASSIGNED: 'Assigned',
    INVESTIGATION: 'Investigation',
    EVIDENCE_COLLECTION: 'Evidence Collection',
    FORENSIC_REVIEW: 'Forensic Review',
    CHARGE_SHEET: 'Charge Sheet',
    COURT_PROCEEDINGS: 'Court Proceedings',
    RESOLVED: 'Resolved'
  };

  return map[status] || status.replaceAll('_', ' ');
};

const formatDate = (date) => {
  if (!date) return 'Not specified';

  try {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return date;
  }
};

const getCaseTitle = (caseData) => {
  return (
    caseData?.title ||
    caseData?.caseTitle ||
    caseData?.fir?.title ||
    caseData?.firNumber ||
    caseData?.caseId ||
    'Case Dossier'
  );
};

const getEvidenceName = (item) => {
  return item?.filename || item?.fileName || item?.name || 'Unnamed Document';
};

const getEvidenceId = (item, index) => {
  return item?.evidenceId || item?.id || item?._id || `document-${index}`;
};

export default function CourtCaseDetail() {
  const { id } = useParams();

  const { user } = useAuth();

  const [caseData, setCaseData] = useState(null);

  const [timeline, setTimeline] = useState([]);

  const [caseAuditLog, setCaseAuditLog] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [showUploadOrder, setShowUploadOrder] = useState(false);

  const [signatureVerified, setSignatureVerified] = useState(false);

  const [orderFile, setOrderFile] = useState(null);

  const [showAuditModal, setShowAuditModal] = useState(false);

  const loadCase = async () => {
    try {
      setLoading(true);
      setError('');

      const caseResponse = await apiFetch(`/case/${id}`);

      const actualCase =
        caseResponse?.case ||
        caseResponse?.data ||
        caseResponse;

      if (!actualCase) {
        throw new Error('Case details not found');
      }

      setCaseData(actualCase);

      const results = await Promise.allSettled([
        apiFetch(`/case/${id}/timeline`),
        apiFetch(`/case/${id}/audit`)
      ]);

      const timelineResponse = results[0];
      const auditResponse = results[1];

      if (timelineResponse.status === 'fulfilled') {
        const timelineData =
          timelineResponse.value?.timeline ||
          timelineResponse.value?.data ||
          timelineResponse.value;

        setTimeline(
          Array.isArray(timelineData)
            ? timelineData
            : []
        );
      } else {
        setTimeline([]);
      }

      if (auditResponse.status === 'fulfilled') {
        const auditData =
          auditResponse.value?.logs ||
          auditResponse.value?.auditLogs ||
          auditResponse.value?.data ||
          auditResponse.value;

        setCaseAuditLog(
          Array.isArray(auditData)
            ? auditData
            : []
        );
      } else {
        setCaseAuditLog([]);
      }
    } catch (err) {
      console.error('Failed to load court case:', err);

      setError(
        err.message ||
          'Unable to load case details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadCase();
    }
  }, [id]);

  const getTimelineStages = () => {
    if (timeline.length > 0) {
      return timeline.map((item) => ({
        date:
          item.createdAt ||
          item.date ||
          item.timestamp ||
          'N/A',

        event:
          item.action ||
          item.status ||
          item.event ||
          'Case Update',

        description:
          item.description ||
          item.details ||
          'Case activity recorded.',

        by:
          item.performedBy?.name ||
          item.userId?.name ||
          item.by ||
          'Authorized Officer'
      }));
    }

    if (caseData?.timeline && Array.isArray(caseData.timeline)) {
      return caseData.timeline;
    }

    return defaultTimeline;
  };

  const downloadCaseDossier = () => {
    if (!caseData) return;

    const documents = Array.isArray(caseData.evidence)
      ? caseData.evidence
      : [];

    const dossierText = `
ANVESHAK — COURT CASE DOSSIER

Case ID:
${caseData.caseId || id}

Case Title:
${getCaseTitle(caseData)}

Status:
${formatStatus(caseData.status)}

Priority:
${caseData.priority || 'Normal'}

Category:
${caseData.type || caseData.category || 'Criminal Litigation'}

Registered Date:
${formatDate(caseData.createdAt || caseData.date)}

Location:
${caseData.location || caseData.jurisdiction || 'Not specified'}

Presiding Judge:
Hon. ${user?.name || 'Authorized Judge'}

Assigned Officer:
${
  caseData.assignedOfficer?.name ||
  caseData.assignedOfficer?.email ||
  'Not assigned'
}

Description:
${caseData.description || 'No description available.'}

DOCUMENTS / EVIDENCE:
${
  documents.length
    ? documents
        .map(
          (item, index) =>
            `${index + 1}. ${getEvidenceName(item)}`
        )
        .join('\n')
    : 'No documents submitted.'
}

STATUS:
${formatStatus(caseData.status)}

Generated by Anveshak Secure Digital Justice Platform.
`;

    const blob = new Blob(
      [dossierText],
      {
        type: 'text/plain;charset=utf-8'
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    link.download = `${
      caseData.caseId || id || 'Anveshak-Case'
    }-Dossier.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleDocumentDownload = async (item) => {
    const filePath =
      item?.filePath ||
      item?.path ||
      item?.url;

    if (filePath) {
      window.open(filePath, '_blank', 'noopener,noreferrer');
      return;
    }

    alert(
      'The document file is securely stored, but a download URL is not available for this document.'
    );
  };

  const handleOrderUpload = async (e) => {
    e.preventDefault();

    if (!orderFile) return;

    try {
      const token =
        localStorage.getItem('anveshak_token');

      const formData = new FormData();

      formData.append('file', orderFile);

      formData.append(
        'caseId',
        caseData?.caseId || id
      );

      const response = await fetch(
        'http://localhost:5001/api/evidence/upload',
        {
          method: 'POST',
          headers: {
            ...(token
              ? {
                  Authorization: `Bearer ${token}`
                }
              : {})
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Court order upload failed.'
        );
      }

      alert(
        `Order ${orderFile.name} securely uploaded.`
      );

      setOrderFile(null);

      setShowUploadOrder(false);

      setSignatureVerified(false);

      await loadCase();
    } catch (err) {
      console.error(
        'Court order upload failed:',
        err
      );

      alert(
        err.message ||
          'Unable to upload court order.'
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 via-blue-50 to-cream p-4 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-navy-100 shadow-sm p-8 text-center">
            <p className="text-navy font-medium">
              Loading case dossier...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 via-blue-50 to-cream p-4 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">
          <Link
            to="/court"
            className="flex items-center text-navy hover:text-navy-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Court Dashboard
          </Link>

          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto text-alert mb-3" />

            <h2 className="text-xl font-bold text-navy mb-2">
              Unable to Load Case
            </h2>

            <p className="text-slate-600">
              {error ||
                'Case details could not be found.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const caseId =
    caseData.caseId ||
    caseData.id ||
    caseData._id ||
    id;

  const title = getCaseTitle(caseData);

  const status = caseData.status || 'COURT_PROCEEDINGS';

  const statusStep =
    statusMap[status] || 6;

  const documentList = Array.isArray(
    caseData.evidence
  )
    ? caseData.evidence
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-blue-50 to-cream p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Navigation */}

        <div className="flex items-center justify-between animate-fade-in-up">

          <Link
            to="/court"
            className="flex items-center text-navy hover:text-navy-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Court Dashboard
          </Link>

          <button
            onClick={downloadCaseDossier}
            className="flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm border border-navy-200 text-navy rounded-lg hover:bg-navy-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Case Dossier
          </button>

        </div>

        {/* Header Bar */}

        <div
          className="bg-white/70 backdrop-blur-sm rounded-2xl border border-navy-100 shadow-sm p-6 animate-fade-in-up"
          style={{
            animationDelay: '0.1s'
          }}
        >

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

            <div>

              <div className="flex items-center space-x-3 mb-2">

                <span className="font-mono text-sm font-semibold text-navy-600 bg-navy-100 px-3 py-1 rounded-full">
                  {caseId}
                </span>

                <span className="flex items-center text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                  <Scale className="w-3 h-3 mr-1" />
                  Active Trial
                </span>

              </div>

              <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900 mb-2">
                {title}
              </h1>

              <p className="text-slate-600 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {caseData.location ||
                  caseData.jurisdiction ||
                  'Jurisdiction Area'}
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <span className="px-3 py-1 rounded-full text-sm font-medium border bg-purple-50 text-purple-700 border-purple-200">
                {formatStatus(status)}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  caseData.priority?.toLowerCase() ===
                  'high'
                    ? 'bg-alert-50 text-alert border-alert-200'
                    : caseData.priority?.toLowerCase() ===
                      'medium'
                    ? 'bg-saffron-50 text-saffron-700 border-saffron-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                Priority:{' '}
                {caseData.priority || 'Normal'}
              </span>

            </div>

          </div>

        </div>

        {/* Three Column Grid */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}

          <div className="lg:col-span-2 space-y-6">

            {/* Case Info Card */}

            <div
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-navy-100 shadow-sm p-6 animate-fade-in-up"
              style={{
                animationDelay: '0.2s'
              }}
            >

              <h2 className="text-xl font-serif font-semibold text-navy mb-4 flex items-center">
                <Scale className="w-5 h-5 mr-2" />
                Trial Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">

                <div>
                  <p className="text-slate-500 mb-1">
                    Case Category
                  </p>

                  <p className="font-medium text-slate-800">
                    {caseData.type ||
                      caseData.category ||
                      'Criminal Litigation'}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 mb-1">
                    Registered Date
                  </p>

                  <p className="font-medium text-slate-800 flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-slate-400" />

                    {formatDate(
                      caseData.createdAt ||
                        caseData.date
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 mb-1">
                    Presiding Judge
                  </p>

                  <p className="font-medium text-slate-800 flex items-center">
                    <User className="w-4 h-4 mr-1 text-slate-400" />

                    Hon. {user?.name || 'Authorized Judge'}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 mb-1">
                    Court Room
                  </p>

                  <p className="font-medium text-slate-800">
                    {caseData.courtRoom ||
                      'District Court'}
                  </p>
                </div>

                <div className="md:col-span-2 pt-2 border-t border-slate-100 mt-2">

                  <p className="text-slate-500 mb-1">
                    Key Parties
                  </p>

                  <div className="flex flex-wrap gap-2">

                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Prosecution:{' '}
                      {caseData.prosecution ||
                        'State'}
                    </span>

                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Defense:{' '}
                      {caseData.defense ||
                        'Not specified'}
                    </span>

                  </div>

                </div>

                <div className="md:col-span-2 pt-2 border-t border-slate-100">

                  <p className="text-slate-500 mb-1">
                    Linked Cases (Precedents & Related)
                  </p>

                  <p className="font-medium text-navy flex items-center hover:underline cursor-pointer">

                    <LinkIcon className="w-4 h-4 mr-1" />

                    {caseData.linkedCase ||
                      caseData.firNumber ||
                      'Primary Investigation File'}

                  </p>

                </div>

              </div>

            </div>

            {/* Case Timeline */}

            <div
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-navy-100 shadow-sm p-6 animate-fade-in-up"
              style={{
                animationDelay: '0.3s'
              }}
            >

              <h2 className="text-xl font-serif font-semibold text-navy mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Trial Progression
              </h2>

              <CaseTimeline
                stages={getTimelineStages()}
                currentStep={statusStep}
                totalStages={9}
              />

            </div>

            {/* Evidence & Documents */}

            <div
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-navy-100 shadow-sm p-6 animate-fade-in-up"
              style={{
                animationDelay: '0.4s'
              }}
            >

              <div className="flex justify-between items-center mb-4">

                <h2 className="text-xl font-serif font-semibold text-navy flex items-center">
                  <FileCheck className="w-5 h-5 mr-2" />
                  Case Documents & Evidence
                </h2>

                <button
                  onClick={() =>
                    setShowUploadOrder(
                      !showUploadOrder
                    )
                  }
                  className="text-sm px-3 py-1.5 bg-navy-100 text-navy-700 rounded-lg hover:bg-navy-200 transition-colors flex items-center font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Issue Order
                </button>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-sm text-left">

                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">

                    <tr>
                      <th className="px-4 py-3 font-medium">
                        Filename
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Type
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Submitted By
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Date
                      </th>

                      <th className="px-4 py-3 font-medium text-right">
                        Action
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {documentList.map(
                      (item, index) => (
                        <tr
                          key={getEvidenceId(
                            item,
                            index
                          )}
                          className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                        >

                          <td className="px-4 py-3 font-medium text-slate-800 flex items-center">

                            <FileText className="w-4 h-4 mr-2 text-navy-500" />

                            {getEvidenceName(item)}

                          </td>

                          <td className="px-4 py-3 text-slate-600">

                            <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                              {item.type ||
                                item.category ||
                                'Evidence'}
                            </span>

                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {item.uploadedBy?.name ||
                              item.uploadedBy?.email ||
                              item.uploadedBy ||
                              'Authorized Officer'}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {formatDate(
                              item.createdAt ||
                                item.date
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">

                            <button
                              onClick={() =>
                                handleDocumentDownload(
                                  item
                                )
                              }
                              className="p-1.5 text-navy hover:bg-navy-100 rounded transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

                {documentList.length === 0 && (
                  <p className="text-center text-slate-500 py-6">
                    No documents submitted yet.
                  </p>
                )}

              </div>

            </div>

            {/* Formal Case Chat */}

            <div
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-navy-100 shadow-sm p-6 animate-fade-in-up"
              style={{
                animationDelay: '0.5s'
              }}
            >

              <FormalCaseChat
                caseId={caseId}
                caseName={title}
                currentStage={status}
              />

            </div>

          </div>

          {/* RIGHT COLUMN */}

          <div className="space-y-6">

            {/* Upload Order */}

            {showUploadOrder && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-navy-200 shadow-sm p-6 animate-scale-in">

                <h3 className="text-lg font-serif font-semibold text-navy mb-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Court Order
                </h3>

                {!signatureVerified ? (
                  <div className="space-y-4">

                    <p className="text-sm text-slate-600 mb-2">
                      Aadhaar/e-Pramaan signature required to issue official court orders to this docket. Please complete the signature verification prompt.
                    </p>

                  </div>
                ) : (
                  <form
                    onSubmit={handleOrderUpload}
                    className="space-y-4 animate-fade-in-up"
                  >

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start">

                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-2 shrink-0 mt-0.5" />

                      <p className="text-xs text-emerald-800">
                        Judicial Identity verified. Your digital signature and court seal will be appended.
                      </p>

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Select Order PDF
                      </label>

                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                          setOrderFile(
                            e.target.files?.[0] ||
                              null
                          )
                        }
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100"
                        required
                      />

                    </div>

                    <div className="flex space-x-2 pt-2">

                      <button
                        type="submit"
                        className="flex-1 bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy-700 transition-colors text-sm font-medium"
                      >
                        Sign & Issue
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUploadOrder(false);
                          setSignatureVerified(false);
                          setOrderFile(null);
                        }}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>

                    </div>

                  </form>
                )}

              </div>
            )}

            {/* Quick Actions */}

            <div
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-navy-100 shadow-sm p-6 animate-fade-in-up"
              style={{
                animationDelay: '0.3s'
              }}
            >

              <h3 className="text-lg font-serif font-semibold text-navy mb-4">
                Judicial Actions
              </h3>

              <div className="space-y-2">

                <button className="w-full text-left px-4 py-3 rounded-lg border border-navy-100 hover:border-navy-300 hover:bg-navy-50 transition-colors flex items-center text-sm font-medium text-slate-700">
                  <Clock className="w-4 h-4 mr-3 text-navy" />
                  Schedule Next Hearing
                </button>

                <button className="w-full text-left px-4 py-3 rounded-lg border border-navy-100 hover:border-navy-300 hover:bg-navy-50 transition-colors flex items-center text-sm font-medium text-slate-700">
                  <FileText className="w-4 h-4 mr-3 text-navy" />
                  Issue Summons/Notices
                  <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded">
                    SIG
                  </span>
                </button>

                <button className="w-full text-left px-4 py-3 rounded-lg border border-navy-100 hover:border-navy-300 hover:bg-navy-50 transition-colors flex items-center text-sm font-medium text-slate-700">
                  <Shield className="w-4 h-4 mr-3 text-navy" />
                  Request Investigation Status
                </button>

                <button className="w-full text-left px-4 py-3 rounded-lg border border-rose-100 hover:border-rose-300 hover:bg-rose-50 transition-colors flex items-center text-sm font-medium text-slate-700">
                  <AlertTriangle className="w-4 h-4 mr-3 text-rose-500" />
                  Record Final Judgment
                </button>

              </div>

            </div>

            {/* Case Audit Log */}

            <div
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-navy-100 shadow-sm p-6 animate-fade-in-up"
              style={{
                animationDelay: '0.4s'
              }}
            >

              <h3 className="text-lg font-serif font-semibold text-navy mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Court Proceedings Log
              </h3>

              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">

                {caseAuditLog.map(
                  (log, index) => (
                    <div
                      key={
                        log._id ||
                        log.id ||
                        `${log.action}-${index}`
                      }
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >

                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">

                        {(log.verificationStatus ===
                          'VERIFIED' ||
                          log.verified) && (
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                        )}

                      </div>

                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-slate-100 bg-white/50 shadow-sm text-sm">

                        <div className="flex justify-between items-start mb-1">

                          <span className="font-medium text-slate-800 text-xs">
                            {log.action ||
                              'Case Activity'}
                          </span>

                          <span className="text-[10px] text-slate-500">
                            {log.createdAt
                              ? formatDate(
                                  log.createdAt
                                )
                              : log.timestamp ||
                                'Recent'}
                          </span>

                        </div>

                        <p className="text-xs text-slate-600">
                          {log.userId?.name ||
                            log.performedBy?.name ||
                            log.by ||
                            'Authorized User'}
                        </p>

                      </div>

                    </div>
                  )
                )}

                {caseAuditLog.length === 0 && (
                  <p className="text-center text-slate-500 py-4 text-sm">
                    No proceedings logs available.
                  </p>
                )}

              </div>

              <button
                onClick={() =>
                  setShowAuditModal(true)
                }
                className="w-full mt-4 text-xs font-medium text-navy hover:text-navy-700 flex justify-center items-center"
              >
                View Full Logs
                <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Signature Verification Modal */}

      <SignatureVerification
        isOpen={
          showUploadOrder &&
          !signatureVerified
        }
        onClose={() =>
          setShowUploadOrder(false)
        }
        onVerified={() =>
          setSignatureVerified(true)
        }
        actionName="Order Issuance"
        officerName="Hon. Judge"
      />

      {/* Audit Trail Modal */}

      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

            <div className="flex items-center justify-between p-4 border-b border-slate-100">

              <h2 className="text-xl font-serif font-bold text-navy-900 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Complete Court Proceedings Log
              </h2>

              <button
                onClick={() =>
                  setShowAuditModal(false)
                }
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <div className="p-4 overflow-y-auto flex-1">

              <AuditTrail
                caseFilter={caseId}
                limit={50}
              />

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">

              <button
                onClick={() =>
                  setShowAuditModal(false)
                }
                className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-700 transition-colors text-sm font-medium"
              >
                Close Logs
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}