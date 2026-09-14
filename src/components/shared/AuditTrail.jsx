import { useEffect, useState } from 'react';
import { Clock, User, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiFetch } from '../../utils/api';

export default function AuditTrail({ caseFilter = null, limit = 10 }) {
  const { t } = useLanguage();

  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const actionColors = {
    'Viewed Case': 'text-navy bg-navy-50',
    'Uploaded Evidence': 'text-forest bg-forest-50',
    'Cross-Agency Access': 'text-saffron-700 bg-saffron-50',
    'Auto-Backup': 'text-charcoal-muted bg-gray-50',
    'Updated Status': 'text-navy bg-navy-50',
    'Filed Chargesheet': 'text-forest bg-forest-50',
    'Case Registered': 'text-forest bg-forest-50',
    'Data Share Request': 'text-saffron-700 bg-saffron-50',
    'Security Scan': 'text-forest bg-forest-50',
    'Viewed FIR': 'text-navy bg-navy-50',
    'Case Assigned': 'text-saffron-700 bg-saffron-50',
  };

  const formatAction = (action) => {
    const actionMap = {
      CASE_CREATED: 'Case Registered',
      CASE_ASSIGNED: 'Case Assigned',
      CASE_STATUS_CHANGED: 'Updated Status',
      CASE_STATUS_UPDATED: 'Updated Status',
      FIR_CREATED: 'FIR Registered',
      FIR_SUBMITTED: 'FIR Submitted',
      EVIDENCE_UPLOADED: 'Uploaded Evidence',
      EVIDENCE_VERIFIED: 'Evidence Verified',
      DATA_SHARED: 'Data Share Request',
      CROSS_AGENCY_ACCESS: 'Cross-Agency Access',
      CHARGESHEET_FILED: 'Filed Chargesheet',
    };

    return actionMap[action] || action || 'Platform Activity';
  };

  const formatDetails = (log) => {
    if (log.description) {
      return log.description;
    }

    if (log.oldValue || log.newValue) {
      return `Changed from "${log.oldValue || '-'}" to "${log.newValue || '-'}"`;
    }

    return 'Platform activity recorded';
  };

  const normalizeAuditLog = (log) => {
    return {
      id: log._id || log.id,
      timestamp: log.createdAt || log.timestamp,
      user:
        log.userId?.name ||
        log.user?.name ||
        log.userId?.email ||
        log.user ||
        'System',
      action: formatAction(log.action),
      target: log.caseId || log.target || 'All Cases',
      details: formatDetails(log),
    };
  };

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        setLoading(true);
        setError('');

        // Case-specific audit trail
        if (caseFilter) {
          const response = await apiFetch(`/case/${caseFilter}/audit`);

          const auditData =
  response?.auditLogs ||
  response?.audit ||
  response?.logs ||
  response?.data ||
  response ||
  [];

          const normalizedLogs = Array.isArray(auditData)
            ? auditData.map(normalizeAuditLog)
            : [];

          setLogs(normalizedLogs);
          return;
        }

        // Global audit trail:
        // First get cases visible to the logged-in officer,
        // then load audit logs for each case.
        const casesResponse = await apiFetch('/case/assigned-to-me');

        const casesData =
          casesResponse?.cases ||
          casesResponse?.data ||
          casesResponse ||
          [];

        const cases = Array.isArray(casesData) ? casesData : [];

        if (cases.length === 0) {
          setLogs([]);
          return;
        }

        const auditResponses = await Promise.allSettled(
          cases
            .filter((caseItem) => caseItem?.caseId)
            .map((caseItem) =>
              apiFetch(`/case/${caseItem.caseId}/audit`)
            )
        );

        const allLogs = [];

        auditResponses.forEach((result) => {
          if (result.status !== 'fulfilled') return;

          const response = result.value;

          const auditData =
  response?.auditLogs ||
  response?.audit ||
  response?.logs ||
  response?.data ||
  response ||
  [];

          if (Array.isArray(auditData)) {
            auditData.forEach((log) => {
              allLogs.push(normalizeAuditLog(log));
            });
          }
        });

        // Remove duplicates
        const uniqueLogs = Array.from(
          new Map(
            allLogs.map((log) => [log.id, log])
          ).values()
        );

        // Latest activity first
        uniqueLogs.sort(
          (a, b) =>
            new Date(b.timestamp || 0) -
            new Date(a.timestamp || 0)
        );

        setLogs(uniqueLogs);
      } catch (err) {
        console.error('Audit log loading failed:', err);
        setError(err.message || 'Unable to load audit logs.');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadAuditLogs();
  }, [caseFilter]);

  const displayLogs = expanded
    ? logs
    : logs.slice(0, limit);

  return (
    <div className="gov-card overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-navy-50 flex items-center justify-between bg-cream/50">
        <div className="flex items-center gap-2">
          <FileText className="w-4.5 h-4.5 text-navy" />
          <h3 className="text-sm font-semibold text-charcoal">
            {t('common.auditTrail')}
          </h3>
        </div>

        <span className="text-xs text-charcoal-muted">
          {loading ? 'Loading...' : `${logs.length} entries`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="bg-navy-50/50">
              <th className="text-left px-4 sm:px-6 py-2.5 text-xs font-semibold text-navy uppercase tracking-wider">
                Timestamp
              </th>

              <th className="text-left px-4 sm:px-6 py-2.5 text-xs font-semibold text-navy uppercase tracking-wider">
                User
              </th>

              <th className="text-left px-4 sm:px-6 py-2.5 text-xs font-semibold text-navy uppercase tracking-wider">
                Action
              </th>

              <th className="text-left px-4 sm:px-6 py-2.5 text-xs font-semibold text-navy uppercase tracking-wider hidden md:table-cell">
                Target
              </th>

              <th className="text-left px-4 sm:px-6 py-2.5 text-xs font-semibold text-navy uppercase tracking-wider hidden lg:table-cell">
                Details
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-navy-50/50">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-sm text-charcoal-muted"
                >
                  Loading audit records...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-sm text-red-600"
                >
                  {error}
                </td>
              </tr>
            ) : displayLogs.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-sm text-charcoal-muted"
                >
                  No audit records found.
                </td>
              </tr>
            ) : (
              displayLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-navy-50/20 transition-colors"
                >
                  <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-charcoal-muted">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">
                        {formatDateTime(log.timestamp)}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 sm:px-6 py-3">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-navy" />

                      <span className="text-xs font-medium text-charcoal">
                        {log.user}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 sm:px-6 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        actionColors[log.action] ||
                        'text-charcoal-muted bg-gray-50'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="px-4 sm:px-6 py-3 hidden md:table-cell">
                    <span className="text-xs text-navy font-mono">
                      {log.target}
                    </span>
                  </td>

                  <td className="px-4 sm:px-6 py-3 hidden lg:table-cell">
                    <span className="text-xs text-charcoal-muted">
                      {log.details}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {logs.length > limit && (
        <div className="px-6 py-3 border-t border-navy-50 bg-cream/30">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-medium text-navy hover:text-saffron transition-colors mx-auto"
          >
            {expanded ? (
              <>
                Show Less
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Show All ({logs.length})
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}