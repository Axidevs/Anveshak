import React, {
  useEffect,
  useRef,
  useState
} from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
  Share2,
  Briefcase,
  Plus,
  Send,
  X
} from 'lucide-react';

import { apiFetch } from '../../utils/api';

const defaultTimeline = [];

export default function CaseDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [caseData, setCaseData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [caseAuditLog, setCaseAuditLog] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showUploadEvidence, setShowUploadEvidence] =
    useState(false);
  const [signatureVerified, setSignatureVerified] =
    useState(false);
  const [evidenceFile, setEvidenceFile] =
    useState(null);
  const [uploadingEvidence, setUploadingEvidence] =
    useState(false);

  // Timeline edit state
  const [showEditTimeline, setShowEditTimeline] =
    useState(false);

  const [
    timelineSignatureVerified,
    setTimelineSignatureVerified
  ] = useState(false);

  const [updatingTimeline, setUpdatingTimeline] =
    useState(false);

  const timelineEditorRef = useRef(null);

  const [timelineEvent, setTimelineEvent] = useState({
    date: '',
    event: '',
    description: ''
  });

  const [showAuditModal, setShowAuditModal] =
    useState(false);

  // --------------------------------------------------
  // LOAD CASE
  // --------------------------------------------------

  const loadCase = async () => {
    try {
      setLoading(true);
      setError('');

      const caseResponse = await apiFetch(
        `/case/${id}`
      );

      const loadedCase =
        caseResponse?.case ||
        caseResponse?.data ||
        caseResponse;

      if (
        !loadedCase ||
        typeof loadedCase !== 'object'
      ) {
        throw new Error(
          'Case details could not be loaded'
        );
      }

      setCaseData(loadedCase);

      const [
        timelineResponse,
        auditResponse
      ] = await Promise.allSettled([
        apiFetch(`/case/${id}/timeline`),
        apiFetch(`/case/${id}/audit`)
      ]);

      // Timeline
      if (
        timelineResponse.status ===
        'fulfilled'
      ) {
        const timelineData =
          timelineResponse.value?.timeline ||
          timelineResponse.value?.data ||
          timelineResponse.value ||
          [];

        setTimeline(
          Array.isArray(timelineData)
            ? timelineData
            : []
        );
      } else {
        setTimeline([]);
      }

      // Audit
      if (
        auditResponse.status ===
        'fulfilled'
      ) {
        const auditData =
          auditResponse.value?.auditLogs ||
          auditResponse.value?.logs ||
          auditResponse.value?.data ||
          auditResponse.value ||
          [];

        setCaseAuditLog(
          Array.isArray(auditData)
            ? auditData
            : []
        );
      } else {
        setCaseAuditLog([]);
      }
    } catch (err) {
      console.error(
        'Failed to load case:',
        err
      );

      setError(
        err.message ||
          'Unable to load case details.'
      );

      setCaseData(null);
      setTimeline([]);
      setCaseAuditLog([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadCase();
    }
  }, [id]);

  // --------------------------------------------------
  // TIMELINE EDITOR AUTO SCROLL
  // --------------------------------------------------

  useEffect(() => {
    if (
      showEditTimeline &&
      timelineSignatureVerified
    ) {
      setTimeout(() => {
        timelineEditorRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300);
    }
  }, [
    showEditTimeline,
    timelineSignatureVerified
  ]);

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getCaseId = () => {
    return (
      caseData?.caseId ||
      caseData?.id ||
      id ||
      'CAS-000'
    );
  };

  const getCaseTitle = () => {
    return (
      caseData?.title ||
      caseData?.caseTitle ||
      caseData?.incidentDescription ||
      `Case ${getCaseId()}`
    );
  };

  const getCaseType = () => {
    return (
      caseData?.type ||
      caseData?.category ||
      caseData?.aiAnalysis?.classification ||
      'General Investigation'
    );
  };

  const getLocation = () => {
    return (
      caseData?.location ||
      caseData?.jurisdiction ||
      'Jurisdiction Area'
    );
  };

  const getOfficerName = () => {
    if (
      caseData?.assignedOfficer &&
      typeof caseData.assignedOfficer ===
        'object'
    ) {
      return (
        caseData.assignedOfficer?.name ||
        caseData.assignedOfficer?.email ||
        'Unassigned'
      );
    }

    return (
      caseData?.officer ||
      caseData?.assignedTo ||
      'Unassigned'
    );
  };

  const getTeam = () => {
    if (
      Array.isArray(caseData?.team) &&
      caseData.team.length > 0
    ) {
      return caseData.team;
    }

    if (
      caseData?.assignedOfficer &&
      typeof caseData.assignedOfficer ===
        'object'
    ) {
      return [
        caseData.assignedOfficer?.name ||
          caseData.assignedOfficer?.email ||
          'Assigned Officer'
      ];
    }

    return getOfficerName() !== 'Unassigned'
      ? [getOfficerName()]
      : [];
  };

  const getEvidenceList = () => {
    if (
      Array.isArray(caseData?.evidence)
    ) {
      return caseData.evidence;
    }

    return [];
  };

  const normalizeTimeline = () => {
    if (!Array.isArray(timeline)) {
      return defaultTimeline;
    }

    return timeline.map((item) => {
      let performedBy =
        item.by ||
        item.performedBy;

      if (
        typeof performedBy === 'object' &&
        performedBy !== null
      ) {
        performedBy =
          performedBy.name ||
          performedBy.email ||
          'Authorized Officer';
      }

      return {
        date:
          item.date ||
          item.createdAt ||
          item.timestamp ||
          'Ongoing',

        event:
          item.event ||
          item.action ||
          item.status ||
          'Case Update',

        description:
          item.description ||
          item.details ||
          'Case activity recorded.',

        by:
          performedBy ||
          item.userId?.name ||
          item.userId?.email ||
          'Authorized Officer'
      };
    });
  };

  const getStatusStep = () => {
    const status = String(
      caseData?.status || ''
    ).toUpperCase();

    const statusMap = {
      FIR_REGISTERED: 1,
      UNDER_REVIEW: 2,
      ASSIGNED: 3,
      INVESTIGATION: 4,
      EVIDENCE_COLLECTION: 5,
      FORENSIC_REVIEW: 6,
      CHARGE_SHEET: 7,
      COURT_PROCEEDINGS: 8,
      RESOLVED: 9
    };

    return statusMap[status] || 1;
  };

  const formatAuditTimestamp = (log) => {
    const timestamp =
      log.createdAt ||
      log.timestamp ||
      log.updatedAt;

    if (!timestamp) {
      return '';
    }

    const date = new Date(timestamp);

    if (
      Number.isNaN(date.getTime())
    ) {
      return String(timestamp);
    }

    return date.toLocaleString(
      'en-IN',
      {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    );
  };

  const getAuditAction = (log) => {
    return (
      log.action ||
      log.description ||
      'Case activity'
    );
  };

  const getAuditUser = (log) => {
    if (
      log.userId &&
      typeof log.userId === 'object'
    ) {
      return (
        log.userId?.name ||
        log.userId?.email ||
        'Authorized User'
      );
    }

    return (
      log.by ||
      log.performedBy ||
      'Authorized User'
    );
  };

  // --------------------------------------------------
  // DOWNLOAD CASE BRIEF
  // --------------------------------------------------

  const handleDownloadCaseBrief = () => {
    if (!caseData) return;

    const caseId = getCaseId();

    const brief = `
ANVESHAK — CASE BRIEF

Case ID:
${caseId}

Title:
${getCaseTitle()}

Crime Type:
${getCaseType()}

Status:
${caseData.status || 'N/A'}

Priority:
${caseData.priority || 'N/A'}

Jurisdiction:
${getLocation()}

Investigating Officer:
${getOfficerName()}

Filed Date:
${caseData.date ||
  caseData.createdAt ||
  'N/A'}

Description:
${
  caseData.description ||
  caseData.incidentDescription ||
  'No description available.'
}

Evidence Count:
${getEvidenceList().length}

Generated through Anveshak.
`;

    const blob = new Blob(
      [brief],
      {
        type: 'text/plain;charset=utf-8'
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;
    link.download =
      `${caseId}-Case-Brief.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // --------------------------------------------------
  // EVIDENCE UPLOAD
  // --------------------------------------------------

  const handleEvidenceUpload = async (
    e
  ) => {
    e.preventDefault();

    if (!evidenceFile) {
      alert(
        'Please select an evidence file.'
      );
      return;
    }

    try {
      setUploadingEvidence(true);

      const token =
        localStorage.getItem(
          'anveshak_token'
        );

      const formData = new FormData();

      formData.append(
        'file',
        evidenceFile
      );

      formData.append(
        'caseId',
        getCaseId()
      );

      const response = await fetch(
        'http://localhost:5001/api/evidence/upload',
        {
          method: 'POST',

          headers: {
            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`
                }
              : {})
          },

          body: formData
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Evidence upload failed.'
        );
      }

      alert(
        data.message ||
          'Evidence uploaded successfully.'
      );

      setEvidenceFile(null);

      setShowUploadEvidence(false);

      setSignatureVerified(false);

      await loadCase();
    } catch (err) {
      console.error(
        'Evidence upload failed:',
        err
      );

      alert(
        err.message ||
          'Evidence upload failed.'
      );
    } finally {
      setUploadingEvidence(false);
    }
  };

  // --------------------------------------------------
  // CASE LIFECYCLE UPDATE
  // --------------------------------------------------

  const handleTimelineUpdate = async (
    e
  ) => {
    e.preventDefault();

    if (
      !timelineEvent.event.trim() ||
      !timelineEvent.description.trim()
    ) {
      alert(
        'Please enter the event details.'
      );
      return;
    }

    const statusFlow = {
      FIR_REGISTERED:
        'UNDER_REVIEW',

      UNDER_REVIEW:
        'ASSIGNED',

      ASSIGNED:
        'INVESTIGATION',

      INVESTIGATION:
        'EVIDENCE_COLLECTION',

      EVIDENCE_COLLECTION:
        'FORENSIC_REVIEW',

      FORENSIC_REVIEW:
        'CHARGE_SHEET',

      CHARGE_SHEET:
        'COURT_PROCEEDINGS',

      COURT_PROCEEDINGS:
        'RESOLVED'
    };

    const currentStatus =
      String(
        caseData?.status || ''
      ).toUpperCase();

    const nextStatus =
      statusFlow[currentStatus];

    if (!nextStatus) {
      alert(
        'This case has already reached the final status.'
      );
      return;
    }

    try {
      setUpdatingTimeline(true);

      const response =
        await apiFetch(
          '/case/status',
          {
            method: 'PATCH',

            body: JSON.stringify({
  caseId: getCaseId(),
  status: nextStatus
})
          }
        );

      alert(
        response?.message ||
          `Case status updated to ${nextStatus}`
      );

      setTimelineEvent({
        date: '',
        event: '',
        description: ''
      });

      setTimelineSignatureVerified(
        false
      );

      setShowEditTimeline(false);

      await loadCase();
    } catch (err) {
      console.error(
        'Lifecycle update failed:',
        err
      );

      alert(
        err.message ||
          'Unable to update case status.'
      );
    } finally {
      setUpdatingTimeline(false);
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 p-4 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-10 text-center">
            <FileText className="w-10 h-10 mx-auto mb-3 text-violet-500" />

            <p className="text-slate-600 font-medium">
              Loading case details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (
    error ||
    !caseData
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 p-4 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">

          <Link
            to="/officer/cases"
            className="flex items-center text-violet-700 hover:text-violet-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to My Cases
          </Link>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-rose-100 shadow-sm p-10 text-center">

            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-rose-500" />

            <h2 className="text-xl font-semibold text-slate-800">
              Unable to load case
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              {error ||
                'Case details not found.'}
            </p>

          </div>
        </div>
      </div>
    );
  }

  const caseId = getCaseId();

  const evidenceList =
    getEvidenceList();

  const team = getTeam();

  const currentTimeline =
    normalizeTimeline();

  const currentStatus =
    String(
      caseData.status || ''
    ).toUpperCase();

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 p-4 md:p-8 font-sans">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Navigation */}

        <div className="flex items-center justify-between animate-fade-in-up">

          <Link
            to="/officer/cases"
            className="flex items-center text-violet-700 hover:text-violet-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to My Cases
          </Link>

          <button
            onClick={
              handleDownloadCaseBrief
            }
            className="flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm border border-violet-200 text-violet-700 rounded-lg hover:bg-violet-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Case Brief
          </button>

        </div>

        {/* Header Bar */}

        <div
          className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-6 animate-fade-in-up"
          style={{
            animationDelay: '0.1s'
          }}
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

            <div>

              <div className="flex items-center space-x-3 mb-2">

                <span className="font-mono text-sm font-semibold text-violet-600 bg-violet-100 px-3 py-1 rounded-full">
                  {caseId}
                </span>

                {caseData.isCrossAgency ||
                caseData.crossAgency ? (
                  <span className="flex items-center text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                    <Share2 className="w-3 h-3 mr-1" />
                    Cross-Agency
                  </span>
                ) : null}

              </div>

              <h1 className="text-2xl md:text-3xl font-serif font-bold text-violet-900 mb-2">
                {getCaseTitle()}
              </h1>

              <p className="text-slate-600 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {getLocation()}
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  currentStatus ===
                    'INVESTIGATION' ||
                  currentStatus ===
                    'ASSIGNED' ||
                  currentStatus ===
                    'EVIDENCE_COLLECTION'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentStatus ===
                      'COURT_PROCEEDINGS'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {caseData.status ||
                  'Unknown'}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  String(
                    caseData.priority || ''
                  ).toLowerCase() ===
                  'high'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : String(
                        caseData.priority ||
                          ''
                      ).toLowerCase() ===
                      'medium'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                Priority:{' '}
                {caseData.priority ||
                  'Normal'}
              </span>

            </div>

          </div>
        </div>

        {/* Three Column Grid */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}

          <div className="lg:col-span-2 space-y-6">

            {/* Case Info */}

            <div
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-6 animate-fade-in-up"
              style={{
                animationDelay: '0.2s'
              }}
            >

              <h2 className="text-xl font-serif font-semibold text-violet-800 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Case Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">

                <div>
                  <p className="text-slate-500 mb-1">
                    Crime Type
                  </p>

                  <p className="font-medium text-slate-800">
                    {getCaseType()}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 mb-1">
                    Filed Date
                  </p>

                  <p className="font-medium text-slate-800 flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-slate-400" />

                    {caseData.date ||
                      caseData.createdAt ||
                      'Not specified'}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 mb-1">
                    Investigating Officer (IO)
                  </p>

                  <p className="font-medium text-slate-800 flex items-center">
                    <User className="w-4 h-4 mr-1 text-slate-400" />

                    {getOfficerName()}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 mb-1">
                    Station / Department
                  </p>

                  <p className="font-medium text-slate-800">
                    {caseData.station ||
                      caseData.department ||
                      'Central Division'}
                  </p>
                </div>

                <div className="md:col-span-2 pt-2 border-t border-slate-100 mt-2">

                  <p className="text-slate-500 mb-1">
                    Assigned Team
                  </p>

                  <div className="flex flex-wrap items-center gap-2">

                    {team.length > 0 ? (
                      team.map(
                        (
                          member,
                          index
                        ) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              index === 0
                                ? 'bg-violet-100 text-violet-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {typeof member ===
                            'object'
                              ? member?.name ||
                                member?.email ||
                                'Team Member'
                              : member}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-xs text-slate-400">
                        No team assigned
                      </span>
                    )}

                  </div>
                </div>

                {caseData.isCrossAgency ||
                caseData.crossAgency ? (
                  <div className="md:col-span-2 pt-2 border-t border-slate-100">

                    <p className="text-slate-500 mb-1">
                      Shared With (Cross-Agency)
                    </p>

                    <p className="font-medium text-slate-800 flex items-center">
                      <Shield className="w-4 h-4 mr-1 text-slate-400" />

                      {Array.isArray(
                        caseData.sharedWith
                      )
                        ? caseData.sharedWith.join(
                            ', '
                          )
                        : 'Authorized agencies'}
                    </p>

                  </div>
                ) : null}

                <div className="md:col-span-2 pt-2 border-t border-slate-100">

                  <p className="text-slate-500 mb-1">
                    Linked Cases
                  </p>

                  {Array.isArray(
                    caseData.linkedCases
                  ) &&
                  caseData.linkedCases.length >
                    0 ? (
                    <div className="flex flex-wrap gap-2">

                      {caseData.linkedCases.map(
                        (
                          linkedCase
                        ) => (
                          <span
                            key={
                              linkedCase
                            }
                            className="font-medium text-violet-600 flex items-center hover:underline cursor-pointer"
                          >
                            <LinkIcon className="w-4 h-4 mr-1" />
                            {linkedCase}
                          </span>
                        )
                      )}

                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">
                      No linked cases
                    </p>
                  )}

                </div>

              </div>
            </div>

            {/* Case Timeline */}

            <div
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-6 animate-fade-in-up"
              style={{
                animationDelay: '0.3s'
              }}
            >

              <h2 className="text-xl font-serif font-semibold text-violet-800 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Case Progression
              </h2>

              {currentTimeline.length >
              0 ? (
                <CaseTimeline
                  stages={
                    currentTimeline
                  }
                  currentStep={
                    getStatusStep()
                  }
                  totalStages={9}
                />
              ) : (
                <p className="text-center text-slate-500 py-6">
                  No timeline events recorded yet.
                </p>
              )}

            </div>

            {/* Evidence */}

            <div
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-6 animate-fade-in-up"
              style={{
                animationDelay: '0.4s'
              }}
            >

              <div className="flex justify-between items-center mb-4">

                <h2 className="text-xl font-serif font-semibold text-violet-800 flex items-center">
                  <FileCheck className="w-5 h-5 mr-2" />
                  Evidence & Documents
                </h2>

                <button
                  onClick={() =>
                    setShowUploadEvidence(
                      !showUploadEvidence
                    )
                  }
                  className="text-sm px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors flex items-center font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add New
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
                        Uploaded By
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

                    {evidenceList.map(
                      (
                        item,
                        index
                      ) => {

                        const evidenceId =
                          item.evidenceId ||
                          item.id ||
                          item._id ||
                          index;

                        const filename =
                          item.filename ||
                          item.fileName ||
                          'Evidence Document';

                        const uploadedBy =
                          item.uploadedBy?.name ||
                          item.uploadedBy?.email ||
                          item.uploadedBy ||
                          'Authorized Officer';

                        const date =
                          item.date ||
                          item.createdAt ||
                          item.uploadedAt ||
                          'N/A';

                        return (
                          <tr
                            key={
                              evidenceId
                            }
                            className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                          >

                            <td className="px-4 py-3 font-medium text-slate-800 flex items-center">
                              <FileText className="w-4 h-4 mr-2 text-violet-500" />
                              {filename}
                            </td>

                            <td className="px-4 py-3 text-slate-600">
                              <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                                {item.type ||
                                  'Document'}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-slate-600">
                              {uploadedBy}
                            </td>

                            <td className="px-4 py-3 text-slate-600">
                              {date}
                            </td>

                            <td className="px-4 py-3 text-right">

                              {item.filePath ||
                              item.url ? (
                                <a
                                  href={
                                    item.url ||
                                    item.filePath
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex p-1.5 text-violet-600 hover:bg-violet-100 rounded transition-colors"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              ) : (
                                <button
                                  disabled
                                  className="p-1.5 text-slate-300 rounded"
                                  title="File URL unavailable"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>
                </table>

                {evidenceList.length ===
                  0 && (
                  <p className="text-center text-slate-500 py-6">
                    No evidence attached yet.
                  </p>
                )}

              </div>
            </div>

            {/* Formal Case Chat */}

            <div
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-6 animate-fade-in-up"
              style={{
                animationDelay: '0.5s'
              }}
            >

              <FormalCaseChat
                caseId={caseId}
                caseName={getCaseTitle()}
                currentStage={
                  caseData.status
                }
              />

            </div>

          </div>

          {/* RIGHT COLUMN */}

          <div className="space-y-6">

            {/* Upload Evidence */}

            {showUploadEvidence && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-200 shadow-sm p-6 animate-scale-in">

                <h3 className="text-lg font-serif font-semibold text-violet-800 mb-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Evidence
                </h3>

                {!signatureVerified ? (
                  <div className="space-y-4">

                    <p className="text-sm text-slate-600 mb-2">
                      Cryptographic signature required to upload verified evidence to this case file. Please complete the signature verification prompt.
                    </p>

                  </div>
                ) : (
                  <form
                    onSubmit={
                      handleEvidenceUpload
                    }
                    className="space-y-4 animate-fade-in-up"
                  >

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start">

                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-2 shrink-0 mt-0.5" />

                      <p className="text-xs text-emerald-800">
                        Identity verified. Your digital signature will be appended to the uploaded file.
                      </p>

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Select File
                      </label>

                      <input
                        type="file"
                        onChange={(e) =>
                          setEvidenceFile(
                            e.target.files?.[0] ||
                              null
                          )
                        }
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        required
                      />

                    </div>

                    <div className="flex space-x-2 pt-2">

                      <button
                        type="submit"
                        disabled={
                          uploadingEvidence
                        }
                        className="flex-1 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium disabled:opacity-60"
                      >
                        {uploadingEvidence
                          ? 'Uploading...'
                          : 'Sign & Upload'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUploadEvidence(
                            false
                          );

                          setSignatureVerified(
                            false
                          );

                          setEvidenceFile(
                            null
                          );
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
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-6 animate-fade-in-up"
              style={{
                animationDelay: '0.3s'
              }}
            >

              <h3 className="text-lg font-serif font-semibold text-violet-800 mb-4">
                Quick Actions
              </h3>

              <div className="space-y-2">

                <button
                  onClick={() => {
                    setTimelineEvent({
                      date: '',
                      event: '',
                      description: ''
                    });

                    setTimelineSignatureVerified(
                      false
                    );

                    setShowEditTimeline(
                      true
                    );
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg border border-violet-100 hover:border-violet-300 hover:bg-violet-50 transition-colors flex items-center text-sm font-medium text-slate-700"
                >
                  <FileText className="w-4 h-4 mr-3 text-violet-600" />

                  Edit Case Plan / Timeline

                  <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded">
                    SIG
                  </span>
                </button>

                <button
                  className="w-full text-left px-4 py-3 rounded-lg border border-violet-100 hover:border-violet-300 hover:bg-violet-50 transition-colors flex items-center text-sm font-medium text-slate-700"
                >
                  <Shield className="w-4 h-4 mr-3 text-violet-600" />
                  Request Inter-Agency Access
                </button>

                <button
                  className="w-full text-left px-4 py-3 rounded-lg border border-violet-100 hover:border-violet-300 hover:bg-violet-50 transition-colors flex items-center text-sm font-medium text-slate-700"
                >
                  <Send className="w-4 h-4 mr-3 text-violet-600" />
                  Transfer Case
                </button>

                <button
                  className="w-full text-left px-4 py-3 rounded-lg border border-rose-100 hover:border-rose-300 hover:bg-rose-50 transition-colors flex items-center text-sm font-medium text-slate-700"
                >
                  <AlertTriangle className="w-4 h-4 mr-3 text-rose-500" />
                  Mark as Urgent
                </button>

              </div>
            </div>

            {/* Case Audit Log */}

            <div
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-6 animate-fade-in-up"
              style={{
                animationDelay: '0.4s'
              }}
            >

              <h3 className="text-lg font-serif font-semibold text-violet-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Case Audit Log
              </h3>

              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">

                {caseAuditLog
                  .slice(0, 5)
                  .map(
                    (
                      log,
                      index
                    ) => (
                      <div
                        key={
                          log._id ||
                          log.id ||
                          index
                        }
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                      >

                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">

                          {log.verificationStatus ===
                            'VERIFIED' ||
                          log.verified ? (
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Clock className="w-3 h-3 text-slate-400" />
                          )}

                        </div>

                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-slate-100 bg-white/50 shadow-sm text-sm">

                          <div className="flex justify-between items-start mb-1">

                            <span className="font-medium text-slate-800 text-xs">
                              {getAuditAction(
                                log
                              )}
                            </span>

                            <span className="text-[10px] text-slate-500">
                              {formatAuditTimestamp(
                                log
                              )}
                            </span>

                          </div>

                          <p className="text-xs text-slate-600">
                            {getAuditUser(
                              log
                            )}
                          </p>

                        </div>

                      </div>
                    )
                  )}

                {caseAuditLog.length ===
                  0 && (
                  <p className="text-center text-slate-500 py-6 text-sm">
                    No audit activity recorded yet.
                  </p>
                )}

              </div>

              <button
                onClick={() =>
                  setShowAuditModal(
                    true
                  )
                }
                className="w-full mt-4 text-xs font-medium text-violet-600 hover:text-violet-800 flex justify-center items-center"
              >
                View Full Logs
                <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
              </button>

            </div>

            {/* EDIT TIMELINE */}

            {showEditTimeline && (
              <div
                ref={timelineEditorRef}
                className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-200 shadow-sm p-6 animate-scale-in"
              >

                <h3 className="text-lg font-serif font-semibold text-violet-800 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Edit Case Plan / Timeline
                </h3>

                {!timelineSignatureVerified ? (
                  <div className="space-y-4">

                    <p className="text-sm text-slate-600 mb-2">
                      Cryptographic signature required to update the official case timeline. Please complete the signature verification prompt.
                    </p>

                  </div>
                ) : (
                  <form
                    onSubmit={
                      handleTimelineUpdate
                    }
                    className="space-y-4 animate-fade-in-up"
                  >

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start">

                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-2 shrink-0 mt-0.5" />

                      <p className="text-xs text-emerald-800">
                        Identity verified. Your digital signature will be appended to this timeline event.
                      </p>

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Date
                      </label>

                      <input
                        type="date"
                        value={
                          timelineEvent.date
                        }
                        onChange={(e) =>
                          setTimelineEvent({
                            ...timelineEvent,
                            date: e.target.value
                          })
                        }
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                        required
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Event Title
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. Investigation Started"
                        value={
                          timelineEvent.event
                        }
                        onChange={(e) =>
                          setTimelineEvent({
                            ...timelineEvent,
                            event: e.target.value
                          })
                        }
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                        required
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Description
                      </label>

                      <textarea
                        rows="2"
                        placeholder="Details of the event..."
                        value={
                          timelineEvent.description
                        }
                        onChange={(e) =>
                          setTimelineEvent({
                            ...timelineEvent,
                            description:
                              e.target.value
                          })
                        }
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white resize-none"
                        required
                      />

                    </div>

                    <div className="flex space-x-2 pt-2">

                      <button
                        type="submit"
                        disabled={
                          updatingTimeline
                        }
                        className="flex-1 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium disabled:opacity-60"
                      >
                        {updatingTimeline
                          ? 'Updating...'
                          : 'Sign & Add Event'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowEditTimeline(
                            false
                          );

                          setTimelineSignatureVerified(
                            false
                          );

                          setTimelineEvent({
                            date: '',
                            event: '',
                            description: ''
                          });
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

          </div>
        </div>
      </div>

      {/* Evidence Signature Modal */}

      <SignatureVerification
        isOpen={
          showUploadEvidence &&
          !signatureVerified
        }
        onClose={() => {
          setShowUploadEvidence(
            false
          );

          setSignatureVerified(
            false
          );
        }}
        onVerified={() =>
          setSignatureVerified(
            true
          )
        }
        actionDescription={`Evidence Upload for ${caseId}`}
        officerName={
          user?.name || 'Officer'
        }
      />

      {/* Timeline Signature Modal */}

      <SignatureVerification
        isOpen={
          showEditTimeline &&
          !timelineSignatureVerified
        }
        onClose={() => {
          setShowEditTimeline(
            false
          );

          setTimelineSignatureVerified(
            false
          );
        }}
        onVerified={() => {
          setTimelineSignatureVerified(
            true
          );

          setShowEditTimeline(
            true
          );

          setTimeout(() => {
            timelineEditorRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }, 300);
        }}
        actionDescription={`Timeline Update for ${caseId}`}
        officerName={
          user?.name || 'Officer'
        }
      />

      {/* Audit Trail Modal */}

      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

            <div className="flex items-center justify-between p-4 border-b border-slate-100">

              <h2 className="text-xl font-serif font-bold text-violet-900 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Complete Audit Trail
              </h2>

              <button
                onClick={() =>
                  setShowAuditModal(
                    false
                  )
                }
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <div className="p-4 overflow-y-auto flex-1">

              {caseAuditLog.length >
              0 ? (
                <div className="space-y-3">

                  {caseAuditLog.map(
                    (
                      log,
                      index
                    ) => (
                      <div
                        key={
                          log._id ||
                          log.id ||
                          index
                        }
                        className="border border-slate-100 rounded-xl p-4 bg-slate-50/50"
                      >

                        <div className="flex justify-between gap-4">

                          <div>

                            <p className="font-semibold text-slate-800 text-sm">
                              {getAuditAction(
                                log
                              )}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              Performed by:{' '}
                              {getAuditUser(
                                log
                              )}
                            </p>

                          </div>

                          <div className="text-right">

                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold ${
                                log.verificationStatus ===
                                'VERIFIED'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {log.verificationStatus ||
                                'RECORDED'}
                            </span>

                            <p className="text-[10px] text-slate-400 mt-1">
                              {formatAuditTimestamp(
                                log
                              )}
                            </p>

                          </div>

                        </div>

                        {log.description &&
                          log.description !==
                            log.action && (
                            <p className="text-xs text-slate-600 mt-3">
                              {log.description}
                            </p>
                          )}

                        {(log.oldValue ||
                          log.newValue) && (
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">

                            {log.oldValue && (
                              <div className="p-2 bg-white rounded border border-slate-100">

                                <span className="text-slate-400">
                                  Previous
                                </span>

                                <p className="text-slate-700 mt-1">
                                  {String(
                                    log.oldValue
                                  )}
                                </p>

                              </div>
                            )}

                            {log.newValue && (
                              <div className="p-2 bg-white rounded border border-slate-100">

                                <span className="text-slate-400">
                                  New
                                </span>

                                <p className="text-slate-700 mt-1">
                                  {String(
                                    log.newValue
                                  )}
                                </p>

                              </div>
                            )}

                          </div>
                        )}

                      </div>
                    )
                  )}

                </div>
              ) : (
                <p className="text-center text-slate-500 py-10 text-sm">
                  No audit activity recorded yet.
                </p>
              )}

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">

              <button
                onClick={() =>
                  setShowAuditModal(
                    false
                  )
                }
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
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