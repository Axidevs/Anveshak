import { useState } from 'react';
import { Clock, User, FileText, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { mockAuditLog } from '../../data/mockData';
import { formatDateTime } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AuditTrail({ caseFilter = null, limit = 10 }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  let logs = caseFilter
    ? mockAuditLog.filter(log => log.target.includes(caseFilter))
    : mockAuditLog;

  const displayLogs = expanded ? logs : logs.slice(0, limit);

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
  };

  return (
    <div className="gov-card overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-navy-50 flex items-center justify-between bg-cream/50">
        <div className="flex items-center gap-2">
          <FileText className="w-4.5 h-4.5 text-navy" />
          <h3 className="text-sm font-semibold text-charcoal">{t('common.auditTrail')}</h3>
        </div>
        <span className="text-xs text-charcoal-muted">{logs.length} entries</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="bg-navy-50/50">
              <th className="text-left px-4 sm:px-6 py-2.5 text-xs font-semibold text-navy uppercase tracking-wider">Timestamp</th>
              <th className="text-left px-4 sm:px-6 py-2.5 text-xs font-semibold text-navy uppercase tracking-wider">User</th>
              <th className="text-left px-4 sm:px-6 py-2.5 text-xs font-semibold text-navy uppercase tracking-wider">Action</th>
              <th className="text-left px-4 sm:px-6 py-2.5 text-xs font-semibold text-navy uppercase tracking-wider hidden md:table-cell">Target</th>
              <th className="text-left px-4 sm:px-6 py-2.5 text-xs font-semibold text-navy uppercase tracking-wider hidden lg:table-cell">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50/50">
            {displayLogs.map((log) => (
              <tr key={log.id} className="hover:bg-navy-50/20 transition-colors">
                <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-charcoal-muted">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{formatDateTime(log.timestamp)}</span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-navy" />
                    <span className="text-xs font-medium text-charcoal">{log.user}</span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${actionColors[log.action] || 'text-charcoal-muted bg-gray-50'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 hidden md:table-cell">
                  <span className="text-xs text-navy font-mono">{log.target}</span>
                </td>
                <td className="px-4 sm:px-6 py-3 hidden lg:table-cell">
                  <span className="text-xs text-charcoal-muted">{log.details}</span>
                </td>
              </tr>
            ))}
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
              <>Show Less <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>Show All ({logs.length}) <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
