import React, { useEffect, useState } from 'react';

import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

import Breadcrumb from '../../components/layout/Breadcrumb';
import IndiaMap from '../../components/shared/IndiaMap';

import {
  FileText,
  ShieldAlert,
  Clock,
  Share2,
  Search,
  UploadCloud,
  Key,
} from 'lucide-react';

import { apiFetch } from '../../utils/api';
console.log("🔥 OFFICER DASHBOARD FILE LOADED");
export default function OfficerDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
  const response = await apiFetch('/case/assigned-to-me');

  console.log('DASHBOARD CASE RESPONSE:', response);

  const assignedCases =
    response?.cases ||
    response?.data ||
    response ||
    [];

  const validCases = Array.isArray(assignedCases)
    ? assignedCases
    : [];

  console.log('DASHBOARD VALID CASES:', validCases);

  setCases(validCases);

  setStats({
    totalCases: validCases.length,

    activeCases: validCases.filter(
      (c) =>
        !['RESOLVED', 'CLOSED'].includes(
          String(c.status || '').toUpperCase()
        )
    ).length,

    pendingReview: validCases.filter(
      (c) =>
        String(c.status || '').toUpperCase() === 'UNDER_REVIEW'
    ).length,

    sharedAccess: 0,
  });
      } catch (error) {
        console.error('Officer dashboard loading failed:', error);

        setCases([]);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalCases =
    stats?.totalCases ??
    cases.length;

  const activeCases =
    stats?.activeCases ??
    cases.filter(
      (c) =>
        !['RESOLVED', 'CLOSED'].includes(
          String(c.status || '').toUpperCase()
        )
    ).length;

  const pendingReview =
    stats?.pendingReview ??
    cases.filter(
      (c) =>
        String(c.status || '').toUpperCase() === 'UNDER_REVIEW'
    ).length;

  const sharedAccess =
    stats?.sharedAccess ??
    0;

  const breadcrumbs = [
    {
      label: t('Home') || 'Home',
      path: '/',
    },
    {
      label: t('Officer Dashboard') || 'Officer Dashboard',
      path: '/officer/dashboard',
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-charcoal">
          {t('Welcome back') || 'Welcome back'},{' '}
          {user?.name || 'Officer'}
        </h1>

        <p className="text-gray-500 mt-1">
          {t('Here is an overview of your current workload.') ||
            'Here is an overview of your current workload.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-navy hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                {t('Total Cases') || 'Total Cases'}
              </p>

              <h3 className="text-2xl font-bold text-charcoal mt-1">
                {loading ? '—' : totalCases}
              </h3>
            </div>

            <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-navy">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-alert hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                {t('Active Cases') || 'Active Cases'}
              </p>

              <h3 className="text-2xl font-bold text-charcoal mt-1">
                {loading ? '—' : activeCases}
              </h3>
            </div>

            <div className="w-10 h-10 rounded-full bg-alert/10 flex items-center justify-center text-alert">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-saffron hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                {t('Pending Review') || 'Pending Review'}
              </p>

              <h3 className="text-2xl font-bold text-charcoal mt-1">
                {loading ? '—' : pendingReview}
              </h3>
            </div>

            <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center text-saffron">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-forest hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                {t('Shared Access') || 'Shared Access'}
              </p>

              <h3 className="text-2xl font-bold text-charcoal mt-1">
                {loading ? '—' : sharedAccess}
              </h3>
            </div>

            <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center text-forest">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-charcoal">
              {t('My Active Cases') || 'My Active Cases'}
            </h2>

            <Link
              to="/officer/cases"
              className="text-sm text-navy hover:underline font-medium"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-6 text-sm text-gray-500">
                Loading cases...
              </div>
            ) : cases.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">
                No cases assigned to you yet.
              </div>
            ) : (
              cases.slice(0, 4).map((c) => {
                const caseId = c.caseId || c.id || c._id;
                const status = c.status || 'UNDER_REVIEW';

                return (
                  <div
                    key={caseId}
                    className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-charcoal">
                        {caseId}
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        {caseId} • {status}
                      </p>
                    </div>

                    <Link
                      to={`/officer/cases/${caseId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-charcoal hover:border-navy hover:text-navy transition-all shadow-sm"
                    >
                      View Details
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-charcoal">
              {t('Quick Actions') || 'Quick Actions'}
            </h2>
          </div>

          <div className="p-4 flex flex-col gap-3">
            <Link
              to="/officer/search"
              className="flex items-center gap-3 w-full p-3 rounded-lg border border-gray-200 hover:border-navy hover:bg-navy/5 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-navy group-hover:scale-110 transition-transform">
                <Search className="w-4 h-4" />
              </div>

              <span className="font-medium text-charcoal">
                {t('Smart Search') || 'Smart Search'}
              </span>
            </Link>

            <Link
              to="/officer/upload"
              className="flex items-center gap-3 w-full p-3 rounded-lg border border-gray-200 hover:border-navy hover:bg-navy/5 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center text-forest group-hover:scale-110 transition-transform">
                <UploadCloud className="w-4 h-4" />
              </div>

              <span className="font-medium text-charcoal">
                {t('Upload Resource') || 'Upload Resource'}
              </span>
            </Link>

            <Link
              to="/officer/access"
              className="flex items-center gap-3 w-full p-3 rounded-lg border border-gray-200 hover:border-navy hover:bg-navy/5 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-full bg-saffron/10 flex items-center justify-center text-saffron group-hover:scale-110 transition-transform">
                <Key className="w-4 h-4" />
              </div>

              <span className="font-medium text-charcoal">
                {t('Request Access') || 'Request Access'}
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-charcoal">
              Crime Analytics — Hotspot Map
            </h2>

            <p className="text-xs text-gray-500 mt-0.5">
              Real-time nationwide crime density visualisation
            </p>
          </div>

          <span className="px-3 py-1 bg-forest/10 text-forest text-xs font-semibold rounded-full">
            Live
          </span>
        </div>

        <IndiaMap />
      </div>
    </div>
  );
}