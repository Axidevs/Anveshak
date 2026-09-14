import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

import Breadcrumb from '../../components/layout/Breadcrumb';
import StatusBadge from '../../components/shared/StatusBadge';
import SignatureVerification from '../../components/shared/SignatureVerification';

import { getPriorityColor, formatDate } from '../../utils/helpers';
import { apiFetch } from '../../utils/api';

import {
  FileText,
  Shield,
  Users,
  Network,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  UploadCloud,
  Share2,
  PenTool,
  CheckCircle,
} from 'lucide-react';

export default function MyCases() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('All');
  const [expandedCase, setExpandedCase] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sigModal, setSigModal] = useState({
    open: false,
    action: '',
    caseId: '',
  });

  const [auditLog, setAuditLog] = useState([]);
  const [toast, setToast] = useState('');

  const tabs = ['All', 'active', 'court', 'resolved'];

  const tabLabels = {
    All: 'All Cases',
    active: 'Active',
    court: 'Court',
    resolved: 'Resolved',
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'My Cases', path: '/officer/cases' },
  ];

  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);

        let assignedCases = [];

        // First: dedicated assigned-cases endpoint
        try {
          const response = await apiFetch('/case/assigned-to-me');

          assignedCases =
            response?.cases ||
            response?.data ||
            response?.assignedCases ||
            response ||
            [];

          if (!Array.isArray(assignedCases)) {
            assignedCases = [];
          }
        } catch (error) {
          console.warn(
            'Assigned cases endpoint failed, trying general case endpoint:',
            error
          );
        }

        // Fallback: general case endpoint
        if (assignedCases.length === 0) {
          try {
            const response = await apiFetch('/case');

            const allCases =
              response?.cases ||
              response?.data ||
              response ||
              [];

            if (Array.isArray(allCases)) {
              assignedCases = allCases.filter((caseItem) => {
                const assignedOfficer = caseItem?.assignedOfficer;

                if (!assignedOfficer) {
                  return false;
                }

                // Populated officer object
                if (typeof assignedOfficer === 'object') {
                  const officerId =
                    assignedOfficer?._id ||
                    assignedOfficer?.id;

                  return (
                    !user?._id ||
                    !officerId ||
                    String(officerId) === String(user._id)
                  );
                }

                // ObjectId/string
                return (
                  !user?._id ||
                  String(assignedOfficer) === String(user._id)
                );
              });
            }
          } catch (error) {
            console.error(
              'Failed to load officer cases:',
              error
            );
          }
        }

        setCases(
          Array.isArray(assignedCases)
            ? assignedCases
            : []
        );
      } catch (error) {
        console.error(
          'Failed to load officer cases:',
          error
        );
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, [user]);

  const normalizeStatus = (status) => {
    const value = String(status || '').toUpperCase();

    if (
      value === 'RESOLVED' ||
      value === 'CLOSED'
    ) {
      return 'resolved';
    }

    if (
      value === 'COURT_PROCEEDINGS' ||
      value === 'CHARGE_SHEET'
    ) {
      return 'court';
    }

    return 'active';
  };

  const filteredCases = cases.filter((c) => {
    if (activeTab === 'All') {
      return true;
    }

    return normalizeStatus(c.status) === activeTab;
  });

  const getCaseId = (c) => {
    return c?.caseId || c?.id || c?._id;
  };

  const getCaseTitle = (c) => {
    return (
      c?.title ||
      c?.caseTitle ||
      c?.incidentDescription ||
      `Case ${getCaseId(c)}`
    );
  };

  const getCaseType = (c) => {
    return (
      c?.type ||
      c?.category ||
      c?.classification ||
      c?.aiAnalysis?.classification ||
      'Investigation'
    );
  };

  const getAssignedOfficer = (c) => {
    if (
      c?.assignedOfficer &&
      typeof c.assignedOfficer === 'object'
    ) {
      return (
        c.assignedOfficer?.name ||
        c.assignedOfficer?.email ||
        'Assigned Officer'
      );
    }

    return c?.assignedTo || 'You';
  };

  const getTeam = (c) => {
    if (
      Array.isArray(c?.team) &&
      c.team.length > 0
    ) {
      return c.team;
    }

    return [getAssignedOfficer(c)];
  };

  const getLastUpdated = (c) => {
    return (
      c?.updatedAt ||
      c?.lastUpdated ||
      c?.createdAt ||
      new Date().toISOString()
    );
  };

  const getDocumentsCount = (c) => {
    return (
      c?.documentsCount ??
      c?.documents?.length ??
      0
    );
  };

  const getEvidenceCount = (c) => {
    return (
      c?.evidenceCount ??
      c?.evidence?.length ??
      0
    );
  };

  const openSigModal = (action, caseId, e) => {
    e.stopPropagation();

    setSigModal({
      open: true,
      action,
      caseId,
    });
  };

  const handleSignatureVerified = (sigData) => {
    const entry = {
      id: `audit-${Date.now()}`,
      action: sigModal.action,
      caseId: sigModal.caseId,
      officer:
        sigData.officerName ||
        user?.name ||
        'Officer',
      method: sigData.method,
      timestamp: sigData.timestamp,
      tag: 'Digitally Verified',
    };

    setAuditLog((prev) => [
      entry,
      ...prev,
    ]);

    const ts = new Date(
      sigData.timestamp
    ).toLocaleTimeString('en-IN');

    setToast(
      `Action verified and logged — ${entry.officer}, ${ts}`
    );

    setTimeout(() => {
      setToast('');
    }, 4000);

    setSigModal({
      open: false,
      action: '',
      caseId: '',
    });
  };

  return (
    <div className="space-y-6">

      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-forest text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium animate-fade-in">
          <CheckCircle size={16} />
          {toast}
        </div>
      )}

      <Breadcrumb items={breadcrumbs} />

      {auditLog.length > 0 && (
        <div className="bg-forest/5 border border-forest/20 rounded-xl p-4">
          <h3 className="text-sm font-bold text-forest mb-2 flex items-center gap-2">
            <CheckCircle size={14} />
            Digitally Verified Actions (This Session)
          </h3>

          <div className="space-y-1.5">
            {auditLog.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 text-xs text-gray-600 bg-white border border-forest/10 rounded-lg px-3 py-2"
              >
                <span className="px-2 py-0.5 rounded-full bg-forest/10 text-forest font-semibold">
                  ✓ {e.tag}
                </span>

                <span className="font-medium text-charcoal">
                  {e.action}
                </span>

                <span className="text-gray-400">
                  on {e.caseId}
                </span>

                <span className="ml-auto text-gray-400">
                  {new Date(
                    e.timestamp
                  ).toLocaleTimeString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-navy text-navy bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}

        <span className="ml-auto self-center text-xs text-gray-400 pr-2">
          {loading
            ? 'Loading...'
            : `${filteredCases.length} case${
                filteredCases.length !== 1
                  ? 's'
                  : ''
              }`}
        </span>
      </div>

      <div className="space-y-4">

        {loading ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
            <FileText
              size={40}
              className="mx-auto mb-3 opacity-30"
            />

            <p className="text-base font-medium">
              Loading your cases...
            </p>
          </div>
        ) : (
          filteredCases.map((c) => {
            const caseId = getCaseId(c);
            const status =
              c?.status || 'UNDER_REVIEW';

            const team = getTeam(c);

            const documentsCount =
              getDocumentsCount(c);

            const evidenceCount =
              getEvidenceCount(c);

            return (
              <div
                key={caseId}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
              >

                <div
                  className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  onClick={() =>
                    setExpandedCase(
                      expandedCase === caseId
                        ? null
                        : caseId
                    )
                  }
                >

                  <div className="flex-1 min-w-0">

                    <div className="flex flex-wrap items-center gap-2 mb-2">

                      <span className="font-bold text-navy font-mono text-sm">
                        {caseId}
                      </span>

                      <StatusBadge status={status} />

                      {c?.priority && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                            getPriorityColor(
                              c.priority
                            ).bg || ''
                          }`}
                        >
                          {String(c.priority)
                            .charAt(0)
                            .toUpperCase() +
                            String(c.priority).slice(1)}{' '}
                          Priority
                        </span>
                      )}

                      {c?.crossAgency && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium border border-purple-200">
                          <Network size={11} />
                          Cross-Agency
                        </span>
                      )}

                    </div>

                    <h3 className="text-lg font-semibold text-charcoal">
                      {getCaseTitle(c)}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {getCaseType(c)} &bull; IO:{' '}
                      {getAssignedOfficer(c)} &bull; Last
                      updated:{' '}
                      {formatDate(
                        getLastUpdated(c)
                      )}
                    </p>

                  </div>

                  <div className="flex items-center gap-5 text-sm text-gray-500 shrink-0">

                    <div className="flex items-center gap-1.5">
                      <Users
                        size={15}
                        className="text-gray-400"
                      />
                      <span>
                        {team.length} Member
                        {team.length !== 1
                          ? 's'
                          : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <FileText
                        size={15}
                        className="text-gray-400"
                      />
                      <span>
                        {documentsCount} Docs
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Shield
                        size={15}
                        className="text-gray-400"
                      />
                      <span>
                        {evidenceCount} Evidence
                      </span>
                    </div>

                    {expandedCase === caseId ? (
                      <ChevronUp
                        size={18}
                        className="text-navy"
                      />
                    ) : (
                      <ChevronDown
                        size={18}
                        className="text-gray-400"
                      />
                    )}

                  </div>

                </div>

                {expandedCase === caseId && (
                  <div className="p-6 bg-gray-50/70 border-t border-gray-100">

                    <div className="flex flex-col sm:flex-row gap-4 items-start justify-between mb-4">

                      <div>

                        <h4 className="text-sm font-semibold text-charcoal mb-1">
                          Investigating Team
                        </h4>

                        <div className="flex flex-wrap gap-2">
                          {team.map(
                            (member, i) => (
                              <span
                                key={i}
                                className="text-xs bg-navy/5 border border-navy/10 text-navy px-2 py-1 rounded-full font-medium"
                              >
                                {typeof member ===
                                'object'
                                  ? member?.name ||
                                    member?.email ||
                                    'Team Member'
                                  : member}
                              </span>
                            )
                          )}
                        </div>

                        {Array.isArray(
                          c?.sharedWith
                        ) &&
                          c.sharedWith.length >
                            0 && (
                            <p className="text-xs text-gray-500 mt-2">
                              Shared with:{' '}
                              {c.sharedWith.join(
                                ', '
                              )}
                            </p>
                          )}

                      </div>

                      {Array.isArray(
                        c?.linkedCases
                      ) &&
                        c.linkedCases.length >
                          0 && (
                          <div>

                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Linked Cases
                            </h4>

                            {c.linkedCases.map(
                              (lc) => (
                                <span
                                  key={lc}
                                  className="text-xs font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded mr-1 border border-purple-100"
                                >
                                  {lc}
                                </span>
                              )
                            )}

                          </div>
                        )}

                    </div>

                    <h4 className="text-sm font-semibold text-charcoal mb-3 mt-2">
                      Actions
                    </h4>

                    <div className="flex flex-wrap gap-3">

                      <Link
                        to={`/officer/cases/${caseId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-charcoal hover:border-navy hover:text-navy transition-all shadow-sm"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <ExternalLink size={14} />
                        View Full Details ↗
                      </Link>

                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-saffron/40 rounded-lg text-sm font-medium text-saffron hover:bg-saffron/5 hover:border-saffron transition-all shadow-sm"
                        onClick={(e) =>
                          openSigModal(
                            'Edit Case Diary',
                            caseId,
                            e
                          )
                        }
                        title="Requires digital signature verification"
                      >
                        <PenTool size={14} />
                        Edit Case Diary
                        <span className="text-[10px] bg-saffron/10 text-saffron px-1.5 rounded font-bold">
                          SIG
                        </span>
                      </button>

                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-navy/30 rounded-lg text-sm font-medium text-navy hover:bg-navy/5 transition-all shadow-sm"
                        onClick={(e) =>
                          openSigModal(
                            'Upload Evidence Document',
                            caseId,
                            e
                          )
                        }
                        title="Requires digital signature verification"
                      >
                        <UploadCloud size={14} />
                        Upload Evidence
                        <span className="text-[10px] bg-navy/10 text-navy px-1.5 rounded font-bold">
                          SIG
                        </span>
                      </button>

                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-charcoal hover:border-navy hover:text-navy transition-all shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Share2 size={14} />
                        Request Access
                      </button>

                    </div>

                    <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
                      <Shield
                        size={10}
                        className="text-saffron"
                      />
                      Actions marked{' '}
                      <strong>SIG</strong> require
                      digital signature verification
                      before committing.
                    </p>

                  </div>
                )}

              </div>
            );
          })
        )}

        {!loading &&
          filteredCases.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
              <FileText
                size={40}
                className="mx-auto mb-3 opacity-30"
              />

              <p className="text-base font-medium">
                No cases found in this category
              </p>
            </div>
          )}

      </div>

      <SignatureVerification
        isOpen={sigModal.open}
        onClose={() =>
          setSigModal({
            open: false,
            action: '',
            caseId: '',
          })
        }
        onVerified={handleSignatureVerified}
        officerName={
          user?.name ||
          'Inspector Priya Sharma'
        }
        actionDescription={`${sigModal.action} for ${sigModal.caseId}`}
      />

    </div>
  );
}