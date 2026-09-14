import React, { useEffect, useState } from 'react';

import { useLanguage } from '../../contexts/LanguageContext';

import { Link } from 'react-router-dom';

import Breadcrumb from '../../components/layout/Breadcrumb';

import StatusBadge from '../../components/shared/StatusBadge';

import CaseTimeline from '../../components/shared/CaseTimeline';

import { apiFetch } from '../../utils/api';

import {
  FileText,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  User,
  ExternalLink,
  Clock,
  ShieldAlert
} from 'lucide-react';

const ViewFIRs = () => {
  const { t } = useLanguage();

  const [firs, setFirs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // ======================================================
  // FETCH REAL FIRs FROM BACKEND
  // ======================================================

  useEffect(() => {
    const fetchFIRs = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await apiFetch('/fir/my');

        const backendFIRs =
          response?.firs ||
          response?.data?.firs ||
          response?.data ||
          [];

        setFirs(
          Array.isArray(backendFIRs)
            ? backendFIRs
            : []
        );
      } catch (err) {
        console.error(
          'Failed to fetch FIRs:',
          err
        );

        setError(
          err.message ||
            'Failed to load your FIRs.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFIRs();
  }, []);

  // ======================================================
  // HELPERS
  // ======================================================

  const toggleExpand = (id) => {
    setExpandedId((prev) =>
      prev === id ? null : id
    );
  };

  const getFIRId = (fir) => {
    return (
      fir?._id ||
      fir?.id ||
      fir?.firNumber
    );
  };

  const getStatusStep = (fir) => {
    const status = (
      fir?.status || ''
    ).toUpperCase();

    switch (status) {
      case 'SUBMITTED':
        return 1;

      case 'UNDER_REVIEW':
        return 2;

      case 'REGISTERED':
        return 3;

      case 'CLOSED':
        return 5;

      default:
        return 1;
    }
  };

  const getDisplayStatus = (status) => {
    if (!status) {
      return 'Submitted';
    }

    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatFIRDate = (date) => {
    if (!date) {
      return 'N/A';
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return 'N/A';
    }

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  };

  const formatRelative = (date) => {
    if (!date) {
      return 'N/A';
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return 'N/A';
    }

    const diff =
      Date.now() -
      parsedDate.getTime();

    const minutes = Math.floor(
      diff / 60000
    );

    const hours = Math.floor(
      diff / 3600000
    );

    const days = Math.floor(
      diff / 86400000
    );

    if (minutes < 1) {
      return 'Just now';
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    if (days < 7) {
      return `${days} day${
        days > 1 ? 's' : ''
      } ago`;
    }

    return formatFIRDate(date);
  };

  // ======================================================
  // DOWNLOAD FIR COPY
  // ======================================================

  const downloadFIR = (fir) => {
    try {
      const firNumber =
        fir?.firNumber ||
        'FIR-NOT-AVAILABLE';

      const incidentDate =
        fir?.incidentDate
          ? new Date(
              fir.incidentDate
            ).toLocaleString(
              'en-IN'
            )
          : 'N/A';

      const content = `
ANVESHAK

SECURE DIGITAL JUSTICE PLATFORM

========================================

FIRST INFORMATION REPORT

FIR NUMBER:

${firNumber}

CATEGORY:

${fir?.category || 'Other'}

STATUS:

${getDisplayStatus(
  fir?.status
)}

DATE & TIME OF INCIDENT:

${incidentDate}

LOCATION:

${fir?.incidentLocation || 'Not specified'}

COMPLAINANT:

${fir?.complainant || 'Registered Citizen'}

INCIDENT DESCRIPTION:

${
  fir?.incidentDescription ||
  'No description provided.'
}

----------------------------------------

DIGITAL RECORD INFORMATION

----------------------------------------

FIR ID:

${fir?._id || fir?.id || 'N/A'}

CREATED AT:

${
  fir?.createdAt
    ? new Date(
        fir.createdAt
      ).toLocaleString('en-IN')
    : 'N/A'
}

----------------------------------------

This document is a digitally generated copy
of the FIR submission record.

ANVESHAK

Secure • Transparent • Accountable
`;

      const blob = new Blob(
        [content],
        {
          type:
            'text/plain;charset=utf-8'
        }
      );

      const downloadUrl =
        URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement(
          'a'
        );

      anchor.href =
        downloadUrl;

      anchor.download =
        `${firNumber}.txt`;

      anchor.style.display =
        'none';

      document.body.appendChild(
        anchor
      );

      anchor.click();

      document.body.removeChild(
        anchor
      );

      setTimeout(() => {
        URL.revokeObjectURL(
          downloadUrl
        );
      }, 1000);
    } catch (error) {
      console.error(
        'FIR download failed:',
        error
      );

      alert(
        'Unable to download FIR copy.'
      );
    }
  };

  // ======================================================
  // FILTER
  // ======================================================

  const filteredFIRs =
    firs.filter((fir) => {
      const search =
        searchTerm
          .toLowerCase()
          .trim();

      const matchesSearch =
        (
          fir?.firNumber ||
          ''
        )
          .toLowerCase()
          .includes(search) ||

        (
          fir?.category ||
          ''
        )
          .toLowerCase()
          .includes(search) ||

        (
          fir?.incidentDescription ||
          ''
        )
          .toLowerCase()
          .includes(search) ||

        (
          fir?.incidentLocation ||
          ''
        )
          .toLowerCase()
          .includes(search);

      if (!matchesSearch) {
        return false;
      }

      if (
        filterStatus === 'all'
      ) {
        return true;
      }

      return (
        (
          fir?.status ||
          ''
        ).toLowerCase() ===
        filterStatus.toLowerCase()
      );
    });

  const statusFilters = [
    {
      key: 'all',
      label: 'All FIRs'
    },
    {
      key: 'SUBMITTED',
      label: 'Submitted'
    },
    {
      key: 'UNDER_REVIEW',
      label: 'Under Review'
    },
    {
      key: 'REGISTERED',
      label: 'Registered'
    },
    {
      key: 'CLOSED',
      label: 'Closed'
    }
  ];

  const crimeTypeColors = {
    theft:
      'bg-amber-100 text-amber-800',

    fraud:
      'bg-red-100 text-red-800',

    cybercrime:
      'bg-purple-100 text-purple-800',

    pmla:
      'bg-orange-100 text-orange-800',

    narcotics:
      'bg-rose-100 text-rose-800',

    assault:
      'bg-yellow-100 text-yellow-800',

    missing:
      'bg-blue-100 text-blue-800',

    domestic:
      'bg-pink-100 text-pink-800',

    accident:
      'bg-indigo-100 text-indigo-800',

    property:
      'bg-green-100 text-green-800',

    other:
      'bg-gray-100 text-gray-700'
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-cream pt-20 pb-20">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <Breadcrumb
          items={[
            {
              label:
                'Citizen Dashboard',
              path: '/citizen'
            },
            {
              label:
                'My Registered FIRs',
              path:
                '/citizen/view-firs'
            }
          ]}
        />

        {/* Header */}

        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 mb-6 gap-4">

          <div>

            <h1 className="text-3xl font-bold text-charcoal flex items-center gap-3">

              <FileText
                className="text-navy"
                size={32}
              />

              {t('myFirs') ||
                'My Registered FIRs'}

              <span className="bg-navy/10 text-navy text-sm py-1 px-3 rounded-full border border-navy/20 font-semibold">
                {
                  filteredFIRs.length
                }
              </span>

            </h1>

            <p className="text-gray-500 mt-1.5 text-sm">
              Track the progress and
              status of your First
              Information Reports
            </p>

          </div>

          <div className="relative w-full md:w-72">

            <input
              type="text"
              placeholder="Search by FIR number, category, or description…"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy/30 focus:border-navy outline-none bg-white shadow-sm text-sm"
            />

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

          </div>

        </div>

        {/* Status filters */}

        <div className="flex flex-wrap gap-2 mb-6">

          {statusFilters.map(
            (filter) => (
              <button
                key={filter.key}
                onClick={() =>
                  setFilterStatus(
                    filter.key
                  )
                }
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filterStatus ===
                  filter.key
                    ? 'bg-navy text-white border-navy shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-navy/30 hover:text-navy'
                }`}
              >
                {filter.label}
              </button>
            )
          )}

        </div>

        {/* Loading */}

        {isLoading && (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">

            <div className="w-10 h-10 border-4 border-gray-200 border-t-navy rounded-full animate-spin mx-auto mb-4" />

            <p className="text-gray-500">
              Loading your FIRs...
            </p>

          </div>
        )}

        {/* Error */}

        {!isLoading &&
          error && (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center border border-red-100">

              <ShieldAlert
                size={48}
                className="mx-auto text-alert mb-4"
              />

              <h3 className="text-xl font-bold text-charcoal mb-2">
                Unable to load FIRs
              </h3>

              <p className="text-gray-500 text-sm mb-5">
                {error}
              </p>

              <button
                onClick={() =>
                  window.location.reload()
                }
                className="px-5 py-2.5 bg-navy text-white rounded-lg font-semibold"
              >
                Try Again
              </button>

            </div>
          )}

        {/* FIR Cards */}

        {!isLoading &&
          !error && (
            <div className="space-y-5">

              {filteredFIRs.length >
              0 ? (
                filteredFIRs.map(
                  (fir) => {
                    const firId =
                      getFIRId(fir);

                    const currentStep =
                      getStatusStep(
                        fir
                      );

                    const isExpanded =
                      expandedId ===
                      firId;

                    const crimeType =
                      (
                        fir.category ||
                        'other'
                      ).toLowerCase();

                    const crimeColor =
                      crimeTypeColors[
                        crimeType
                      ] ||
                      'bg-gray-100 text-gray-700';

                    return (
                      <div
                        key={firId}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                      >

                        {/* Card Header */}

                        <div className="p-6">

                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">

                            <div className="flex-1">

                              <div className="flex flex-wrap items-center gap-2 mb-2">

                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${crimeColor}`}
                                >
                                  {fir.category ||
                                    'Other'}
                                </span>

                                <StatusBadge
                                  status={
                                    fir.status ||
                                    'SUBMITTED'
                                  }
                                />

                              </div>

                              <h2 className="text-xl font-bold text-charcoal capitalize">
                                {fir.category ||
                                  'FIR Report'}
                              </h2>

                              <p className="text-sm font-mono text-navy mt-1.5 flex items-center gap-1.5">

                                <ShieldAlert
                                  size={13}
                                  className="text-saffron"
                                />

                                FIR Number:&nbsp;

                                <span className="bg-navy/5 px-2 py-0.5 rounded border border-navy/10">
                                  {fir.firNumber ||
                                    'N/A'}
                                </span>

                              </p>

                            </div>

                            <div className="flex flex-wrap gap-4 text-xs text-gray-500 shrink-0">

                              <span className="flex items-center gap-1">

                                <Calendar size={12} />

                                Filed:{' '}

                                {formatFIRDate(
                                  fir.createdAt
                                )}

                              </span>

                              <span className="flex items-center gap-1">

                                <Clock size={12} />

                                Updated:{' '}

                                {formatRelative(
                                  fir.updatedAt ||
                                    fir.createdAt
                                )}

                              </span>

                              {fir.incidentLocation && (
                                <span className="flex items-center gap-1">

                                  <MapPin size={12} />

                                  {
                                    fir.incidentLocation
                                  }

                                </span>
                              )}

                            </div>

                          </div>

                          <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">
                            {fir.incidentDescription ||
                              'No description provided.'}
                          </p>

                          {/* Complainant */}

                          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-5 pb-5 border-b border-gray-100">

                            <span className="flex items-center gap-1">

                              <User
                                size={12}
                                className="text-navy"
                              />

                              Complainant:{' '}

                              <strong className="text-navy ml-1">
                                {fir.complainant ||
                                  'Registered Citizen'}
                              </strong>

                            </span>

                          </div>

                          {/* Progress */}

                          <div>

                            <div className="flex justify-between text-[10px] text-gray-400 mb-1.5 font-medium">
                              <span>
                                Submitted
                              </span>

                              <span>
                                Under Review
                              </span>

                              <span>
                                Closed
                              </span>
                            </div>

                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">

                              <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-navy to-navy/70 rounded-full transition-all duration-700"
                                style={{
                                  width: `${Math.min(
                                    (currentStep /
                                      5) *
                                      100,
                                    100
                                  )}%`
                                }}
                              />

                            </div>

                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">

                              {[
                                'Submitted',
                                'Review',
                                'Registered',
                                'Investigation',
                                'Closed'
                              ].map(
                                (
                                  label,
                                  index
                                ) => (
                                  <span
                                    key={
                                      index
                                    }
                                    className={
                                      index +
                                        1 <=
                                      currentStep
                                        ? 'text-navy font-semibold'
                                        : ''
                                    }
                                  >
                                    {index +
                                      1 <=
                                    currentStep
                                      ? '✓'
                                      : '○'}
                                  </span>
                                )
                              )}

                            </div>

                          </div>

                        </div>

                        {/* Actions */}

                        <div className="bg-gray-50/80 px-6 py-3.5 flex flex-wrap items-center justify-between border-t border-gray-100 gap-3">

                          <button
                            onClick={() =>
                              toggleExpand(
                                firId
                              )
                            }
                            className="text-navy font-semibold text-sm flex items-center gap-1.5 hover:text-saffron transition-colors"
                            aria-expanded={
                              isExpanded
                            }
                          >

                            {isExpanded ? (
                              <>
                                <ChevronUp
                                  size={
                                    16
                                  }
                                />

                                Collapse Timeline
                              </>
                            ) : (
                              <>
                                <ChevronDown
                                  size={
                                    16
                                  }
                                />

                                View Full Timeline
                              </>
                            )}

                          </button>

                          <div className="flex items-center gap-2">

                            <Link
                              to={`/citizen/fir/${firId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-semibold text-navy border border-navy/20 bg-white px-3 py-1.5 rounded-lg hover:bg-navy/5 transition-all shadow-sm"
                              title="View complete FIR details"
                            >
                              <ExternalLink
                                size={
                                  13
                                }
                              />

                              View Full FIR Details
                            </Link>

                            <button
                              onClick={() =>
                                downloadFIR(
                                  fir
                                )
                              }
                              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all shadow-sm"
                            >
                              <Download
                                size={
                                  13
                                }
                              />

                              Download Copy
                            </button>

                          </div>

                        </div>

                        {/* Timeline */}

                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50/30 p-4 lg:p-6">

                            <CaseTimeline
                              stages={[]}
                              currentStep={
                                currentStep -
                                1
                              }
                              totalStages={
                                5
                              }
                            />

                          </div>
                        )}

                      </div>
                    );
                  }
                )
              ) : (
                <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">

                  <Search
                    size={48}
                    className="mx-auto text-gray-200 mb-4"
                  />

                  <h3 className="text-xl font-bold text-charcoal mb-2">
                    No FIRs Found
                  </h3>

                  <p className="text-gray-400 text-sm">
                    {firs.length ===
                    0
                      ? 'You have not registered any FIR yet.'
                      : 'No records match your search criteria.'}
                  </p>

                </div>
              )}

            </div>
          )}

      </div>
    </div>
  );
};

export default ViewFIRs;