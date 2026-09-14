import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { Link } from 'react-router-dom';
import {
  Scale,
  FileText,
  Calendar,
  Bell,
  ChevronRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

const CourtDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // LOAD COURT CASES
  // ======================================================

  useEffect(() => {
    const loadCourtCases = async () => {
      try {
        setLoading(true);

        const response = await apiFetch('/case');

        const caseList = Array.isArray(response)
          ? response
          : response?.cases ||
            response?.data?.cases ||
            response?.data ||
            [];

        setCases(Array.isArray(caseList) ? caseList : []);
      } catch (error) {
        console.error('Failed to load court cases:', error);
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourtCases();
  }, []);

  // ======================================================
  // HELPERS
  // ======================================================

  const formatDate = (date) => {
    if (!date) return 'N/A';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return 'N/A';
    }

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCaseId = (caseItem) => {
    return (
      caseItem?.caseId ||
      caseItem?.id ||
      caseItem?._id ||
      'N/A'
    );
  };

  const getCaseTitle = (caseItem) => {
    return (
      caseItem?.title ||
      caseItem?.caseTitle ||
      caseItem?.firId?.firNumber ||
      caseItem?.firNumber ||
      'Case Record'
    );
  };

  const getCaseType = (caseItem) => {
    return (
      caseItem?.type ||
      caseItem?.category ||
      caseItem?.firId?.category ||
      caseItem?.aiAnalysis?.classification ||
      'General'
    );
  };

  const getCaseStatus = (caseItem) => {
    return caseItem?.status || 'UNDER_REVIEW';
  };

  const isActiveCase = (caseItem) => {
    return getCaseStatus(caseItem) !== 'RESOLVED';
  };

  // ======================================================
  // COURT CASE FILTER
  // ======================================================

  const courtCases = cases.filter((caseItem) => {
    const status = getCaseStatus(caseItem);

    return (
      status === 'COURT_PROCEEDINGS' ||
      caseItem?.court ||
      caseItem?.courtDetails
    );
  });

  // If no case has reached court stage yet,
  // show available cases so the dashboard is not empty.
  const displayedCases =
    courtCases.length > 0
      ? courtCases
      : cases;

  const activeCases = displayedCases.filter(isActiveCase);

  // ======================================================
  // UPCOMING HEARINGS
  // ======================================================

  const upcomingHearings = displayedCases
    .slice(0, 3)
    .map((caseItem) => ({
      ...caseItem,

      hearingDate:
        caseItem?.hearingDate ||
        caseItem?.nextHearingDate ||
        caseItem?.updatedAt ||
        caseItem?.createdAt,

      time:
        caseItem?.hearingTime ||
        caseItem?.nextHearingTime ||
        null
    }));

  const nextHearing = upcomingHearings[0];

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="space-y-6">

      <Breadcrumb
        items={[
          {
            label:
              t('courtDashboard') ||
              'Court Dashboard',
            path: '/court'
          }
        ]}
      />

      {/* Header */}

      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">

        <div>

          <h1 className="text-2xl font-bold text-navy mb-1">
            Welcome back, Honorable{' '}
            {user?.name || 'Judge'}
          </h1>

          <p className="text-charcoal/70">
            {t('overviewText') ||
              'Here is the overview of your court docket today.'}
          </p>

        </div>

        <div className="hidden sm:block text-right">

          <p className="text-sm text-charcoal/60">
            Current Date
          </p>

          <p className="font-semibold text-charcoal">
            {formatDate(new Date())}
          </p>

        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Cases on Docket */}

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-navy hover:-translate-y-1 transition-all duration-300">

          <div className="flex justify-between items-start">

            <div>

              <p className="text-sm font-medium text-charcoal/60">
                Cases on Docket
              </p>

              <h3 className="text-2xl font-bold text-navy mt-1">
                {loading ? '—' : displayedCases.length}
              </h3>

            </div>

            <div className="bg-navy-50 p-2 rounded-lg text-navy">
              <Scale size={20} />
            </div>

          </div>

        </div>

        {/* Next Hearing */}

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-saffron hover:-translate-y-1 transition-all duration-300">

          <div className="flex justify-between items-start">

            <div>

              <p className="text-sm font-medium text-charcoal/60">
                Next Hearing
              </p>

              <h3 className="text-xl font-bold text-saffron mt-1">

                {loading
                  ? '—'
                  : nextHearing?.hearingDate
                    ? formatDate(
                        nextHearing.hearingDate
                      )
                    : 'Not Scheduled'}

              </h3>

            </div>

            <div className="bg-saffron-50 p-2 rounded-lg text-saffron">
              <Calendar size={20} />
            </div>

          </div>

        </div>

        {/* Pending Orders */}

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-alert hover:-translate-y-1 transition-all duration-300">

          <div className="flex justify-between items-start">

            <div>

              <p className="text-sm font-medium text-charcoal/60">
                Pending Orders
              </p>

              <h3 className="text-2xl font-bold text-alert mt-1">
                —
              </h3>

            </div>

            <div className="bg-red-50 p-2 rounded-lg text-alert">
              <AlertCircle size={20} />
            </div>

          </div>

        </div>

        {/* Active Cases */}

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-forest hover:-translate-y-1 transition-all duration-300">

          <div className="flex justify-between items-start">

            <div>

              <p className="text-sm font-medium text-charcoal/60">
                Active Cases
              </p>

              <h3 className="text-2xl font-bold text-forest mt-1">
                {loading ? '—' : activeCases.length}
              </h3>

            </div>

            <div className="bg-green-50 p-2 rounded-lg text-forest">
              <FileText size={20} />
            </div>

          </div>

        </div>

      </div>

      {/* Upcoming Hearings */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-lg font-bold text-navy">
              Upcoming Hearings
            </h2>

            <Link
              to="/court/proceedings"
              className="text-sm font-medium text-navy hover:text-navy-700 flex items-center"
            >
              View Calendar
              <ChevronRight size={16} />
            </Link>

          </div>

          <div className="space-y-4">

            {loading ? (

              <div className="py-8 text-center text-charcoal/60">
                Loading court cases...
              </div>

            ) : upcomingHearings.length === 0 ? (

              <div className="py-8 text-center text-charcoal/60">
                No cases available.
              </div>

            ) : (

              upcomingHearings.map((hearing, idx) => {

                const hearingDate =
                  hearing.hearingDate
                    ? new Date(hearing.hearingDate)
                    : null;

                const month =
                  hearingDate &&
                  !Number.isNaN(
                    hearingDate.getTime()
                  )
                    ? hearingDate.toLocaleDateString(
                        'en-IN',
                        {
                          month: 'short'
                        }
                      )
                    : '—';

                const day =
                  hearingDate &&
                  !Number.isNaN(
                    hearingDate.getTime()
                  )
                    ? hearingDate.getDate()
                    : '—';

                return (

                  <div
                    key={
                      getCaseId(hearing) ||
                      idx
                    }
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-cream rounded-lg border border-gray-100 hover:border-gray-300 transition-colors"
                  >

                    <div className="flex items-start gap-4">

                      <div className="bg-white border border-gray-200 p-2 rounded-lg flex flex-col items-center justify-center min-w-[70px]">

                        <span className="text-xs text-charcoal/60 font-semibold">
                          {month}
                        </span>

                        <span className="text-lg font-bold text-navy">
                          {day}
                        </span>

                      </div>

                      <div>

                        <h4 className="font-semibold text-charcoal">
                          {getCaseTitle(hearing)}
                        </h4>

                        <p className="text-sm text-charcoal/70 flex items-center gap-1 mt-1">

                          <Clock size={14} />

                          {hearing.time ||
                            'Time not scheduled'}

                          {' • '}

                          {getCaseType(hearing)}

                        </p>

                      </div>

                    </div>

                    <div className="mt-3 sm:mt-0 flex items-center gap-3">

                      <span className="inline-block px-3 py-1 bg-navy-50 text-navy text-xs font-medium rounded-full">
                        {getCaseId(hearing)}
                      </span>

                      <Link
                        to={`/court/cases/${getCaseId(
                          hearing
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-navy hover:text-navy-700 bg-white border border-navy-100 px-3 py-1.5 rounded-lg hover:bg-navy-50 transition-colors"
                      >
                        View Details
                      </Link>

                    </div>

                  </div>

                );

              })

            )}

          </div>

        </div>

        {/* Quick Links */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

          <h2 className="text-lg font-bold text-navy mb-6">
            Quick Links
          </h2>

          <div className="space-y-3">

            <Link
              to="/court/documents"
              className="flex items-center gap-3 p-4 rounded-lg bg-cream hover:bg-navy-50 text-charcoal hover:text-navy transition-colors group"
            >

              <div className="bg-white p-2 rounded-md shadow-sm group-hover:bg-navy group-hover:text-white transition-colors">
                <FileText size={18} />
              </div>

              <span className="font-medium">
                View Documents
              </span>

            </Link>

            <Link
              to="/court/proceedings"
              className="flex items-center gap-3 p-4 rounded-lg bg-cream hover:bg-navy-50 text-charcoal hover:text-navy transition-colors group"
            >

              <div className="bg-white p-2 rounded-md shadow-sm group-hover:bg-navy group-hover:text-white transition-colors">
                <Calendar size={18} />
              </div>

              <span className="font-medium">
                Proceedings & Calendar
              </span>

            </Link>

            <Link
              to="/court/alerts"
              className="flex items-center gap-3 p-4 rounded-lg bg-cream hover:bg-navy-50 text-charcoal hover:text-navy transition-colors group"
            >

              <div className="bg-white p-2 rounded-md shadow-sm group-hover:bg-navy group-hover:text-white transition-colors">
                <Bell size={18} />
              </div>

              <span className="font-medium">
                Alert Settings
              </span>

            </Link>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CourtDashboard;