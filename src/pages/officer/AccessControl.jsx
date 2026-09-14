import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { mockAccessMatrix } from '../../data/mockData';
import { CheckCircle2, XCircle, Info, ShieldAlert, Lock } from 'lucide-react';

/**
 * AccessControl — Post-Based Access Control matrix.
 * Permissions are keyed by camelCase properties on mockAccessMatrix entries.
 * In production this page also supports role-level override requests and audit trails.
 */
export default function AccessControl() {
  const { t } = useLanguage();

  const breadcrumbs = [
    { label: t('Home') || 'Home', path: '/' },
    { label: 'Access Control', path: '/officer/access' }
  ];

  // Columns: display label + the camelCase key in mockAccessMatrix
  const columns = [
    { label: 'Own Cases',       key: 'ownCases' },
    { label: 'Station Cases',   key: 'stationCases' },
    { label: 'District Cases',  key: 'districtCases' },
    { label: 'Cross-Agency',    key: 'crossAgency' },
    { label: 'Evidence Upload', key: 'evidenceUpload' },
    { label: 'Evidence View',   key: 'evidenceView' },
    { label: 'Audit Log',       key: 'auditLog' },
    { label: 'Chat',            key: 'chat' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* PBAC info banner */}
        <div className="flex items-start gap-4 p-4 mb-6 bg-navy/5 border border-navy/20 rounded-xl">
          <Info className="w-6 h-6 text-navy flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-navy">Post-Based Access Control System (PBAC)</h3>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
              Anveshak employs a strict Post-Based Access Control mechanism. All permissions are
              derived from your current designation and jurisdictional posting — not personal identity.
              Upon transfer or reassignment, access is automatically revoked from the previous
              jurisdiction and provisioned for the new posting within 24 hours.
            </p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-alert" />
          Role Permissions Matrix
        </h2>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-600 font-semibold">
                <th className="p-4 border-b border-gray-200 border-r border-gray-200 whitespace-nowrap">
                  Role / Rank
                </th>
                {columns.map(col => (
                  <th key={col.key} className="p-3 border-b border-gray-200 border-r border-gray-200 text-center whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockAccessMatrix.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    idx % 2 === 0 ? '' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="p-4 font-semibold text-charcoal text-sm border-r border-gray-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-navy/50" />
                      {row.role}
                    </div>
                  </td>
                  {columns.map(col => (
                    <td key={col.key} className="p-4 text-center border-r border-gray-100">
                      {row[col.key] ? (
                        <CheckCircle2 className="w-5 h-5 text-forest mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-alert/40 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          * Cross-agency access requires a formal data-sharing request approved by the Nodal Officer.
          All access provisioning events are logged in the Tamper-Proof Audit Trail.
        </p>
      </div>
    </div>
  );
}
