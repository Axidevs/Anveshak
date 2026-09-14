import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Breadcrumb from '../../components/layout/Breadcrumb';
import StatusBadge from '../../components/shared/StatusBadge';
import { getTimeRemaining } from '../../utils/helpers';
import { ShieldCheck, Share2, Clock, CheckCircle } from 'lucide-react';
import { apiFetch } from '../../utils/api';

export default function DataSharing() {
  const { t } = useLanguage();

  const [toastMessage, setToastMessage] = useState('');
  const [cases, setCases] = useState([]);
  const [sharedAccess, setSharedAccess] = useState([]);

  const agencies = ['CBI', 'ED', 'Customs', 'State Police'];
  const durations = ['24h', '48h', '7 days', '30 days'];

  const breadcrumbs = [
    { label: t('Home') || 'Home', path: '/' },
    {
      label: t('Data Sharing') || 'Data Sharing',
      path: '/officer/sharing'
    }
  ];

  useEffect(() => {
    const loadCases = async () => {
      try {
        const response = await apiFetch('/case');

        const rawCases = Array.isArray(response)
          ? response
          : response?.cases ||
            response?.data?.cases ||
            response?.data ||
            [];

        setCases(rawCases);
      } catch (error) {
        console.error('Data Sharing cases load failed:', error);
        setCases([]);
      }
    };

    loadCases();
  }, []);

  const handleRequest = (e) => {
    e.preventDefault();

    setToastMessage('Access request submitted successfully.');

    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs} />

      {toastMessage && (
        <div className="bg-forest text-white px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Request Cross-Agency Access */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-navy/10 rounded-lg text-navy">
              <Share2 className="w-5 h-5" />
            </div>

            <h2 className="text-lg font-semibold text-charcoal">
              {t('Request Cross-Agency Access') ||
                'Request Cross-Agency Access'}
            </h2>
          </div>

          <form onSubmit={handleRequest} className="space-y-4">

            {/* Target Agency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Agency
              </label>

              <select
                className="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-navy focus:border-navy"
                defaultValue=""
              >
                <option value="">Select Agency</option>

                {agencies.map((agency) => (
                  <option key={agency} value={agency}>
                    {agency}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Case */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Case
              </label>

              <select
                className="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-navy focus:border-navy"
                defaultValue=""
              >
                <option value="">Select Case</option>

                {cases.map((caseItem) => (
                  <option
                    key={caseItem.caseId}
                    value={caseItem.caseId}
                  >
                    {caseItem.caseId} -{' '}
                    {caseItem.title || 'Case Record'}
                  </option>
                ))}
              </select>
            </div>

            {/* Requested Documents */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requested Documents
              </label>

              <div className="space-y-2">

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded text-navy focus:ring-navy border-gray-300"
                  />
                  <span className="text-sm text-gray-600">
                    FIR & Initial Reports
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded text-navy focus:ring-navy border-gray-300"
                  />
                  <span className="text-sm text-gray-600">
                    Evidence Vault
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded text-navy focus:ring-navy border-gray-300"
                  />
                  <span className="text-sm text-gray-600">
                    Case Logs
                  </span>
                </label>

              </div>
            </div>

            {/* Expiry Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Duration
              </label>

              <select
                className="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-navy focus:border-navy"
                defaultValue="24h"
              >
                {durations.map((duration) => (
                  <option
                    key={duration}
                    value={duration}
                  >
                    {duration}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-navy text-white font-medium py-2 px-4 rounded-lg hover:bg-navy/90 transition-colors"
            >
              Submit Request
            </button>

          </form>
        </div>

        {/* Shared With Me */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-forest/10 rounded-lg text-forest">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <h2 className="text-lg font-semibold text-charcoal">
              {t('Shared With Me') || 'Shared With Me'}
            </h2>
          </div>

          <div className="space-y-4">

            {sharedAccess.length === 0 ? (
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500">
                No active access shared with you.
              </div>
            ) : (
              sharedAccess.map((access) => {

                const timeRemaining = getTimeRemaining(
                  access.expiresAt
                );

                const isExpired =
                  timeRemaining === 'Expired' ||
                  timeRemaining === null;

                return (
                  <div
                    key={access.id}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >

                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-navy">
                          {access.caseId}
                        </h3>

                        <p className="text-xs text-gray-500">
                          Shared by: {access.sharedBy}
                        </p>
                      </div>

                      <StatusBadge status={access.status} />
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      <p>
                        <strong>Documents:</strong>{' '}
                        {access.documents?.join(', ') || 'N/A'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">

                      <div className="flex items-center gap-1 text-sm font-medium text-gray-600">
                        <Clock className="w-4 h-4" />

                        {isExpired ? (
                          <span className="text-alert">
                            Expired
                          </span>
                        ) : (
                          <span>
                            {timeRemaining}
                          </span>
                        )}
                      </div>

                      {!isExpired && (
                        <button className="text-sm font-medium text-navy hover:underline">
                          View Access
                        </button>
                      )}

                    </div>

                  </div>
                );
              })
            )}

          </div>
        </div>

      </div>
    </div>
  );
}