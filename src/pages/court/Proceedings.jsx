import React, { useEffect, useMemo, useState } from 'react';

import Breadcrumb from '../../components/layout/Breadcrumb';
import StatusBadge from '../../components/shared/StatusBadge';

import {
  Calendar as CalendarIcon,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle,
  Scale
} from 'lucide-react';

import { apiFetch } from '../../utils/api';

const Proceedings = () => {
  const [expandedTimeline, setExpandedTimeline] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(
    new Date()
  );

  const toggleTimeline = (id) => {
    if (expandedTimeline === id) {
      setExpandedTimeline(null);
    } else {
      setExpandedTimeline(id);
    }
  };

  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);

        const response = await apiFetch('/case');

        const caseList = Array.isArray(response)
          ? response
          : response?.cases ||
            response?.data ||
            [];

        setCases(caseList);
      } catch (error) {
        console.error(
          'Failed to load court proceedings:',
          error
        );

        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  const getCaseId = (caseItem) =>
    caseItem?.caseId ||
    caseItem?.id ||
    caseItem?._id ||
    'N/A';

  const getCaseTitle = (caseItem) =>
    caseItem?.title ||
    caseItem?.caseTitle ||
    caseItem?.firNumber ||
    'Case Record';

  const getSection = (caseItem) =>
    caseItem?.section ||
    caseItem?.legalSection ||
    caseItem?.category ||
    'N/A';

  const getStatus = (caseItem) =>
    caseItem?.status || 'UNDER_REVIEW';

  const getHearingDate = (caseItem) => {
    return (
      caseItem?.nextHearingDate ||
      caseItem?.hearingDate ||
      caseItem?.courtDetails?.nextHearingDate ||
      caseItem?.court?.nextHearingDate ||
      null
    );
  };

  const formatDate = (date) => {
    if (!date) return 'Not scheduled';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return 'Not scheduled';
    }

    return parsed.toLocaleDateString(
      'en-IN',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    );
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString(
      'en-IN',
      {
        month: 'long',
        year: 'numeric'
      }
    );
  };

  const calendarData = useMemo(() => {
    const year =
      currentDate.getFullYear();

    const month =
      currentDate.getMonth();

    const daysInMonth =
      new Date(
        year,
        month + 1,
        0
      ).getDate();

    const firstDay =
      new Date(
        year,
        month,
        1
      ).getDay();

    const days = [];

    for (
      let i = 0;
      i < firstDay;
      i++
    ) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      days.push(day);
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return {
      days,
      year,
      month
    };
  }, [currentDate]);

  const hearingDays = useMemo(() => {
    return cases
      .map((caseItem) => {
        const date =
          getHearingDate(caseItem);

        if (!date) return null;

        const parsed =
          new Date(date);

        if (
          Number.isNaN(
            parsed.getTime()
          )
        ) {
          return null;
        }

        return {
          day: parsed.getDate(),
          month: parsed.getMonth(),
          year: parsed.getFullYear()
        };
      })
      .filter(Boolean);
  }, [cases]);

  const isToday = (day) => {
    if (!day) return false;

    const today = new Date();

    return (
      today.getDate() === day &&
      today.getMonth() ===
        calendarData.month &&
      today.getFullYear() ===
        calendarData.year
    );
  };

  const hasHearing = (day) => {
    if (!day) return false;

    return hearingDays.some(
      (hearing) =>
        hearing.day === day &&
        hearing.month ===
          calendarData.month &&
        hearing.year ===
          calendarData.year
    );
  };

  const changeMonth = (offset) => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() +
          offset,
        1
      )
    );
  };

  const getTimeline = (caseItem) => {
    const timeline =
      caseItem?.timeline ||
      caseItem?.caseTimeline ||
      [];

    return Array.isArray(timeline)
      ? timeline
      : [];
  };

  const getAuditHistory = (caseItem) => {
    const history =
      caseItem?.proceedings ||
      caseItem?.hearingHistory ||
      caseItem?.orders ||
      [];

    return Array.isArray(history)
      ? history
      : [];
  };

  const formatTimelineStatus = (
    item
  ) =>
    item?.status ||
    item?.action ||
    'Case Update';

  const formatTimelineDescription = (
    item
  ) =>
    item?.description ||
    item?.details ||
    'Case activity recorded.';

  const getTimelineDate = (item) => {
    return formatDate(
      item?.createdAt ||
        item?.date ||
        item?.timestamp
    );
  };

  return (
    <div className="space-y-6">

      <Breadcrumb
        items={[
          {
            label: 'Court Dashboard',
            path: '/court'
          },
          {
            label:
              'Proceedings & Calendar',
            path: '/court/proceedings'
          }
        ]}
      />

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

        <h1 className="text-2xl font-bold text-navy mb-1">
          Legal Proceedings
        </h1>

        <p className="text-charcoal/70">
          View calendar and track case progression timelines.
        </p>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-1 space-y-6">

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

            <div className="flex justify-between items-center mb-4">

              <h2 className="font-bold text-navy flex items-center gap-2">
                <CalendarIcon size={18} />
                {formatMonthYear(
                  currentDate
                )}
              </h2>

              <div className="flex gap-2">

                <button
                  onClick={() =>
                    changeMonth(-1)
                  }
                  className="text-charcoal/40 hover:text-navy"
                  aria-label="Previous month"
                >
                  &lt;
                </button>

                <button
                  onClick={() =>
                    changeMonth(1)
                  }
                  className="text-charcoal/40 hover:text-navy"
                  aria-label="Next month"
                >
                  &gt;
                </button>

              </div>

            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">

              {[
                'S',
                'M',
                'T',
                'W',
                'T',
                'F',
                'S'
              ].map((day, index) => (
                <div
                  key={`${day}-${index}`}
                  className="text-xs font-semibold text-charcoal/50 py-1"
                >
                  {day}
                </div>
              ))}

            </div>

            <div className="grid grid-cols-7 gap-1 text-center">

              {calendarData.days.map(
                (day, index) => {

                  const today =
                    isToday(day);

                  const hearing =
                    hasHearing(day);

                  return (
                    <div
                      key={index}
                      className={`
                        p-2 text-sm rounded-md transition-colors
                        ${
                          !day
                            ? ''
                            : 'hover:bg-cream cursor-pointer'
                        }
                        ${
                          hearing
                            ? 'bg-navy-50 text-navy font-bold border border-navy/20'
                            : 'text-charcoal'
                        }
                        ${
                          today
                            ? 'bg-saffron text-white font-bold hover:bg-saffron-600'
                            : ''
                        }
                      `}
                    >
                      {day || ''}
                    </div>
                  );
                }
              )}

            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-xs text-charcoal/60">

              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-saffron" />
                Today
              </div>

              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-navy-50 border border-navy/20" />
                Hearing
              </div>

            </div>

          </div>

          <div className="bg-navy rounded-xl shadow-sm p-6 text-white relative overflow-hidden">

            <Scale className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32" />

            <h3 className="font-bold text-lg mb-2 relative z-10">
              Proceeding Rules
            </h3>

            <ul className="space-y-2 text-sm text-white/80 relative z-10 list-disc pl-4">

              <li>
                Upload orders within 48 hours of hearing.
              </li>

              <li>
                Status changes trigger auto-SMS to citizens.
              </li>

              <li>
                Check Next Hearing dates before adjourning.
              </li>

            </ul>

          </div>

        </div>

        <div className="lg:col-span-2">

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

            <h2 className="text-lg font-bold text-navy mb-6">
              Case Timelines
            </h2>

            {loading ? (

              <div className="text-center py-10 text-charcoal/60">
                Loading case proceedings...
              </div>

            ) : cases.length === 0 ? (

              <div className="text-center py-10 text-charcoal/60">
                No case proceedings available.
              </div>

            ) : (

              <div className="space-y-4">

                {cases.map(
                  (courtCase) => {

                    const caseId =
                      getCaseId(
                        courtCase
                      );

                    const timeline =
                      getTimeline(
                        courtCase
                      );

                    const history =
                      getAuditHistory(
                        courtCase
                      );

                    const hearingDate =
                      getHearingDate(
                        courtCase
                      );

                    return (
                      <div
                        key={caseId}
                        className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300"
                      >

                        <div
                          className="p-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer hover:bg-cream"
                          onClick={() =>
                            toggleTimeline(
                              caseId
                            )
                          }
                        >

                          <div>

                            <div className="flex items-center gap-3 mb-1">

                              <span className="font-bold text-navy">
                                {caseId}
                              </span>

                              <StatusBadge
                                status={getStatus(
                                  courtCase
                                )}
                              />

                            </div>

                            <h4 className="font-semibold text-charcoal">
                              {getCaseTitle(
                                courtCase
                              )}
                            </h4>

                            <p className="text-xs text-charcoal/60 mt-1">
                              Section:{' '}
                              {getSection(
                                courtCase
                              )}
                            </p>

                          </div>

                          <div className="mt-3 sm:mt-0 flex items-center gap-4">

                            <div className="text-right">

                              <p className="text-xs text-charcoal/60">
                                Next Hearing
                              </p>

                              <p className="font-semibold text-charcoal flex items-center justify-end gap-1">

                                <Clock
                                  size={12}
                                  className="text-saffron"
                                />

                                {formatDate(
                                  hearingDate
                                )}

                              </p>

                            </div>

                            <div className="text-navy">

                              {expandedTimeline ===
                              caseId ? (
                                <ChevronUp
                                  size={20}
                                />
                              ) : (
                                <ChevronDown
                                  size={20}
                                />
                              )}

                            </div>

                          </div>

                        </div>

                        {expandedTimeline ===
                          caseId && (
                          <div className="p-5 bg-white border-t border-gray-200">

                            <h5 className="font-bold text-charcoal text-sm mb-4">
                              Hearing & Order History
                            </h5>

                            {timeline.length === 0 &&
                            history.length === 0 ? (

                              <div className="text-sm text-charcoal/60 italic">
                                No proceeding history recorded for this case yet.
                              </div>

                            ) : (

                              <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">

                                {timeline.map(
                                  (
                                    item,
                                    index
                                  ) => (

                                    <div
                                      key={
                                        item?._id ||
                                        item?.id ||
                                        index
                                      }
                                      className="relative pl-6"
                                    >

                                      <div className="absolute w-4 h-4 rounded-full bg-navy border-4 border-white -left-[9px] top-1" />

                                      <p className="text-xs font-bold text-navy">
                                        {getTimelineDate(
                                          item
                                        )}
                                      </p>

                                      <h6 className="font-semibold text-charcoal mt-1">
                                        {formatTimelineStatus(
                                          item
                                        )}
                                      </h6>

                                      <p className="text-sm text-charcoal/70">
                                        {formatTimelineDescription(
                                          item
                                        )}
                                      </p>

                                    </div>

                                  )
                                )}

                                {history.map(
                                  (
                                    item,
                                    index
                                  ) => (

                                    <div
                                      key={
                                        item?._id ||
                                        item?.id ||
                                        `history-${index}`
                                      }
                                      className="relative pl-6"
                                    >

                                      <div className="absolute w-4 h-4 rounded-full bg-forest border-4 border-white -left-[9px] top-1" />

                                      <p className="text-xs font-bold text-charcoal/50">
                                        {getTimelineDate(
                                          item
                                        )}
                                      </p>

                                      <h6 className="font-semibold text-charcoal mt-1 flex items-center gap-2">

                                        {item?.title ||
                                          item?.action ||
                                          'Proceeding Update'}

                                        <CheckCircle
                                          size={14}
                                          className="text-forest"
                                        />

                                      </h6>

                                      <div className="mt-2 p-3 bg-cream rounded-lg border border-gray-100 flex items-start gap-3">

                                        <FileText
                                          size={16}
                                          className="text-navy mt-0.5"
                                        />

                                        <div>

                                          <p className="text-sm font-medium text-charcoal">
                                            {item?.orderTitle ||
                                              item?.title ||
                                              'Court Order / Proceeding'}
                                          </p>

                                          <p className="text-xs text-charcoal/60 mt-0.5">
                                            {item?.description ||
                                              item?.details ||
                                              'Proceeding record available.'}
                                          </p>

                                        </div>

                                      </div>

                                    </div>

                                  )
                                )}

                              </div>
                            )}

                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Proceedings;