import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { mockOfficerCases, additionalFIRs } from '../../data/mockData';
import Breadcrumb from '../../components/layout/Breadcrumb';
import StatusBadge from '../../components/shared/StatusBadge';
import SignatureVerification from '../../components/shared/SignatureVerification';
import { getPriorityColor, formatDate } from '../../utils/helpers';
import {
  FileText, Shield, Users, Network, ChevronDown, ChevronUp,
  ExternalLink, Edit3, UploadCloud, Share2, PenTool, CheckCircle
} from 'lucide-react';

/**
 * MyCases — Officer's case list with signature-verified actions.
 * Editing case details, adding case-diary entries, or uploading documents
 * requires identity re-verification via SignatureVerification modal.
 *
 * In production:
 * - Case data is fetched from the CCTNS/ICJS backend API
 * - Signed actions create an immutable audit log entry
 */
export default function MyCases() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [expandedCase, setExpandedCase] = useState(null);

  // Signature modal state
  const [sigModal, setSigModal] = useState({ open: false, action: '', caseId: '' });
  const [auditLog, setAuditLog] = useState([]);
  const [toast, setToast] = useState('');

  const tabs = ['All', 'active', 'court', 'resolved'];
  const tabLabels = { All: 'All Cases', active: 'Active', court: 'Court', resolved: 'Resolved' };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'My Cases', path: '/officer/cases' }
  ];

  const filteredCases = mockOfficerCases.filter(c =>
    activeTab === 'All' ? true : (c.status || '').toLowerCase() === activeTab
  );

  const openSigModal = (action, caseId, e) => {
    e.stopPropagation();
    setSigModal({ open: true, action, caseId });
  };

  const handleSignatureVerified = (sigData) => {
    const entry = {
      id: `audit-${Date.now()}`,
      action: sigModal.action,
      caseId: sigModal.caseId,
      officer: sigData.officerName || user?.name || 'Officer',
      method: sigData.method,
      timestamp: sigData.timestamp,
      tag: 'Digitally Verified',
    };
    setAuditLog(prev => [entry, ...prev]);

    // Show success toast
    const ts = new Date(sigData.timestamp).toLocaleTimeString('en-IN');
    setToast(`Action verified and logged — ${entry.officer}, ${ts}`);
    setTimeout(() => setToast(''), 4000);

    setSigModal({ open: false, action: '', caseId: '' });
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-forest text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium animate-fade-in">
          <CheckCircle size={16} />
          {toast}
        </div>
      )}

      <Breadcrumb items={breadcrumbs} />

      {/* Audit log — shows signed actions this session */}
      {auditLog.length > 0 && (
        <div className="bg-forest/5 border border-forest/20 rounded-xl p-4">
          <h3 className="text-sm font-bold text-forest mb-2 flex items-center gap-2">
            <CheckCircle size={14} /> Digitally Verified Actions (This Session)
          </h3>
          <div className="space-y-1.5">
            {auditLog.map(e => (
              <div key={e.id} className="flex items-center gap-3 text-xs text-gray-600 bg-white border border-forest/10 rounded-lg px-3 py-2">
                <span className="px-2 py-0.5 rounded-full bg-forest/10 text-forest font-semibold">✓ {e.tag}</span>
                <span className="font-medium text-charcoal">{e.action}</span>
                <span className="text-gray-400">on {e.caseId}</span>
                <span className="ml-auto text-gray-400">{new Date(e.timestamp).toLocaleTimeString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 border-b border-gray-200">
        {tabs.map(tab => (
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
          {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Case Cards */}
      <div className="space-y-4">
        {filteredCases.map(c => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">

            {/* Card Header (clickable) */}
            <div
              className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-bold text-navy font-mono text-sm">{c.id}</span>
                  <StatusBadge status={c.status} />
                  {c.priority && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${getPriorityColor(c.priority).bg || ''}`}>
                      {c.priority.charAt(0).toUpperCase() + c.priority.slice(1)} Priority
                    </span>
                  )}
                  {c.crossAgency && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium border border-purple-200">
                      <Network size={11} />
                      Cross-Agency
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-charcoal">{c.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {c.type} &bull; IO: {c.assignedTo} &bull; Last updated: {formatDate(c.lastUpdated)}
                </p>
              </div>

              <div className="flex items-center gap-5 text-sm text-gray-500 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Users size={15} className="text-gray-400" />
                  <span>{(c.team || [c.assignedTo]).length} Member{(c.team || []).length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText size={15} className="text-gray-400" />
                  <span>{c.documentsCount || 0} Docs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={15} className="text-gray-400" />
                  <span>{c.evidenceCount || 0} Evidence</span>
                </div>
                {expandedCase === c.id
                  ? <ChevronUp size={18} className="text-navy" />
                  : <ChevronDown size={18} className="text-gray-400" />
                }
              </div>
            </div>

            {/* Expanded panel */}
            {expandedCase === c.id && (
              <div className="p-6 bg-gray-50/70 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row gap-4 items-start justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal mb-1">Investigating Team</h4>
                    <div className="flex flex-wrap gap-2">
                      {(c.team || [c.assignedTo]).map((member, i) => (
                        <span key={i} className="text-xs bg-navy/5 border border-navy/10 text-navy px-2 py-1 rounded-full font-medium">
                          {member}
                        </span>
                      ))}
                    </div>
                    {c.sharedWith && c.sharedWith.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Shared with: {c.sharedWith.join(', ')}
                      </p>
                    )}
                  </div>
                  {c.linkedCases && c.linkedCases.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Linked Cases</h4>
                      {c.linkedCases.map(lc => (
                        <span key={lc} className="text-xs font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded mr-1 border border-purple-100">
                          {lc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons — signature-gated */}
                <h4 className="text-sm font-semibold text-charcoal mb-3 mt-2">Actions</h4>
                <div className="flex flex-wrap gap-3">
                  {/* View Details — navigates to full case detail page */}
                  <Link
                    to={`/officer/cases/${c.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-charcoal hover:border-navy hover:text-navy transition-all shadow-sm"
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink size={14} />
                    View Full Details ↗
                  </Link>

                  {/* Edit Case Diary — SIGNATURE REQUIRED */}
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-saffron/40 rounded-lg text-sm font-medium text-saffron hover:bg-saffron/5 hover:border-saffron transition-all shadow-sm"
                    onClick={e => openSigModal('Edit Case Diary', c.id, e)}
                    title="Requires digital signature verification"
                  >
                    <PenTool size={14} />
                    Edit Case Diary
                    <span className="text-[10px] bg-saffron/10 text-saffron px-1.5 rounded font-bold">SIG</span>
                  </button>

                  {/* Upload Evidence — SIGNATURE REQUIRED */}
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-navy/30 rounded-lg text-sm font-medium text-navy hover:bg-navy/5 transition-all shadow-sm"
                    onClick={e => openSigModal('Upload Evidence Document', c.id, e)}
                    title="Requires digital signature verification"
                  >
                    <UploadCloud size={14} />
                    Upload Evidence
                    <span className="text-[10px] bg-navy/10 text-navy px-1.5 rounded font-bold">SIG</span>
                  </button>

                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-charcoal hover:border-navy hover:text-navy transition-all shadow-sm"
                    onClick={e => { e.stopPropagation(); }}
                  >
                    <Share2 size={14} />
                    Request Access
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
                  <Shield size={10} className="text-saffron" />
                  Actions marked <strong>SIG</strong> require digital signature verification before committing.
                </p>
              </div>
            )}
          </div>
        ))}

        {filteredCases.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium">No cases found in this category</p>
          </div>
        )}
      </div>

      {/* Signature Verification Modal */}
      <SignatureVerification
        isOpen={sigModal.open}
        onClose={() => setSigModal({ open: false, action: '', caseId: '' })}
        onVerified={handleSignatureVerified}
        officerName={user?.name || 'Inspector Priya Sharma'}
        actionDescription={`${sigModal.action} for ${sigModal.caseId}`}
      />
    </div>
  );
}
