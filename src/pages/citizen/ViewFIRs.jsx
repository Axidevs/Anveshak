import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/layout/Breadcrumb';
import StatusBadge from '../../components/shared/StatusBadge';
import CaseTimeline from '../../components/shared/CaseTimeline';
import { mockFIRs, additionalFIRs } from '../../data/mockData';
import { formatDate, formatRelativeTime } from '../../utils/helpers';
import {
  FileText, Search, Download, ChevronDown, ChevronUp,
  Calendar, MapPin, User, ExternalLink, Clock, ShieldAlert
} from 'lucide-react';

/**
 * ViewFIRs — Citizen's registered FIR listing.
 * "View Full FIR Details" opens in a new tab per platform design spec.
 * Shows enriched CaseTimeline when a card is expanded.
 */
const ViewFIRs = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Merge base and additional FIRs for a full demo list
  const allFIRs = [...mockFIRs, ...(additionalFIRs || [])];

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getStatusStep = (fir) => {
    // Use statusStep from data if available, else derive from status string
    if (fir.statusStep != null) return fir.statusStep;
    const s = (fir.status || '').toLowerCase();
    if (s === 'filed') return 1;
    if (s === 'underinvestigation' || s === 'under investigation') return 2;
    if (s === 'chargesheet') return 3;
    if (s === 'courtregistered' || s === 'court registered') return 4;
    if (s === 'disposed' || s === 'resolved') return 5;
    return 1;
  };

  const filteredFIRs = allFIRs.filter(fir => {
    const matchesSearch =
      (fir.trackingId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (fir.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (fir.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'all') return true;
    return (fir.status || '').toLowerCase().includes(filterStatus.toLowerCase());
  });

  const statusFilters = [
    { key: 'all', label: 'All FIRs' },
    { key: 'filed', label: 'Filed' },
    { key: 'underInvestigation', label: 'Under Investigation' },
    { key: 'chargesheet', label: 'Chargesheet Filed' },
    { key: 'courtRegistered', label: 'Court Registered' },
    { key: 'resolved', label: 'Resolved' },
  ];

  const crimeTypeColors = {
    theft: 'bg-amber-100 text-amber-800',
    fraud: 'bg-red-100 text-red-800',
    cybercrime: 'bg-purple-100 text-purple-800',
    pmla: 'bg-orange-100 text-orange-800',
    narcotics: 'bg-rose-100 text-rose-800',
    assault: 'bg-yellow-100 text-yellow-800',
    missing: 'bg-blue-100 text-blue-800',
    domestic: 'bg-pink-100 text-pink-800',
  };

  return (
    <div className="min-h-screen bg-cream pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { label: 'Citizen Dashboard', path: '/citizen' },
          { label: 'My Registered FIRs', path: '/citizen/view-firs' }
        ]} />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-charcoal flex items-center gap-3">
              <FileText className="text-navy" size={32} />
              {t('myFirs') || 'My Registered FIRs'}
              <span className="bg-navy/10 text-navy text-sm py-1 px-3 rounded-full border border-navy/20 font-semibold">
                {filteredFIRs.length}
              </span>
            </h1>
            <p className="text-gray-500 mt-1.5 text-sm">
              Track the progress and status of your First Information Reports
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search by ID, title, or description…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy/30 focus:border-navy outline-none bg-white shadow-sm text-sm"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterStatus === f.key
                  ? 'bg-navy text-white border-navy shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-navy/30 hover:text-navy'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* FIR Cards */}
        <div className="space-y-5">
          {filteredFIRs.length > 0 ? (
            filteredFIRs.map(fir => {
              const currentStep = getStatusStep(fir);
              const isExpanded = expandedId === fir.id;
              const crimeColor = crimeTypeColors[fir.type] || 'bg-gray-100 text-gray-700';

              return (
                <div
                  key={fir.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${crimeColor}`}>
                            {fir.type}
                          </span>
                          <StatusBadge status={fir.status} />
                        </div>
                        <h2 className="text-xl font-bold text-charcoal">{fir.title}</h2>
                        <p className="text-sm font-mono text-navy mt-1.5 flex items-center gap-1.5">
                          <ShieldAlert size={13} className="text-saffron" />
                          Tracking ID:&nbsp;
                          <span className="bg-navy/5 px-2 py-0.5 rounded border border-navy/10">{fir.trackingId || fir.id}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 shrink-0">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Filed: {formatDate(fir.filedDate || fir.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Updated: {formatRelativeTime(fir.lastUpdated || fir.filedDate)}
                        </span>
                        {fir.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {fir.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">{fir.description}</p>

                    {/* Officer + Station */}
                    {fir.officer && (
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-5 pb-5 border-b border-gray-100">
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-navy" />
                          IO: <strong className="text-navy ml-1">{fir.officer}</strong>
                        </span>
                        {fir.station && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-saffron" />
                            {fir.station}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Compact 5-stage progress bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1.5 font-medium">
                        <span>FIR Filed</span>
                        <span>Chargesheet</span>
                        <span>Disposed</span>
                      </div>
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-navy to-navy/70 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min((currentStep / 5) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        {['Filed', 'Investigation', 'Chargesheet', 'Court', 'Disposed'].map((label, i) => (
                          <span
                            key={i}
                            className={i + 1 <= currentStep ? 'text-navy font-semibold' : ''}
                          >
                            {i + 1 <= currentStep ? '✓' : '○'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="bg-gray-50/80 px-6 py-3.5 flex flex-wrap items-center justify-between border-t border-gray-100 gap-3">
                    <button
                      onClick={() => toggleExpand(fir.id)}
                      className="text-navy font-semibold text-sm flex items-center gap-1.5 hover:text-saffron transition-colors"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded
                        ? <><ChevronUp size={16} /> Collapse Timeline</>
                        : <><ChevronDown size={16} /> View Full Timeline</>
                      }
                    </button>

                    <div className="flex items-center gap-2">
                      {/* "View Full FIR Details" opens proper FIR detail page */}
                      <Link
                        to={`/citizen/fir/${fir.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold text-navy border border-navy/20 bg-white px-3 py-1.5 rounded-lg hover:bg-navy/5 transition-all shadow-sm"
                        title="View complete FIR details"
                      >
                        <ExternalLink size={13} />
                        View Full FIR Details
                      </Link>
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all shadow-sm">
                        <Download size={13} />
                        Download Copy
                      </button>
                    </div>
                  </div>

                  {/* Expanded CaseTimeline */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/30 p-4 lg:p-6">
                      <CaseTimeline
                        stages={fir.timeline || []}
                        currentStep={currentStep - 1}
                        totalStages={fir.timeline?.length || 5}
                      />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">
              <Search size={48} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-charcoal mb-2">No FIRs Found</h3>
              <p className="text-gray-400 text-sm">
                No records match your search criteria. Try a different keyword or clear your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewFIRs;
