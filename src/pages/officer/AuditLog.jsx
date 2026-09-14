import { useState } from 'react';
import { FileText, Download, Filter, Calendar, User, Search } from 'lucide-react';
import AuditTrail from '../../components/shared/AuditTrail';
import { useLanguage } from '../../contexts/LanguageContext';
import { mockAuditLog } from '../../data/mockData';
import { formatDateTime } from '../../utils/helpers';

export default function AuditLog() {
  const { t } = useLanguage();
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const uniqueUsers = [...new Set(mockAuditLog.map(l => l.user))];
  const uniqueActions = [...new Set(mockAuditLog.map(l => l.action))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">{t('officer.auditLog')}</h1>
          <p className="text-sm text-charcoal-muted mt-1">Complete record of all platform activity</p>
        </div>
        <button className="pill-btn bg-navy text-white hover:bg-navy-700 text-sm">
          <Download className="w-4 h-4" />
          Export Log
        </button>
      </div>

      {/* Filters */}
      <div className="gov-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-navy" />
            <span className="text-sm font-medium text-charcoal">Filters:</span>
          </div>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-3 py-2 rounded-lg border border-navy-100 text-sm bg-white text-charcoal focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none"
            aria-label="Filter by user"
          >
            <option value="">All Users</option>
            {uniqueUsers.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 rounded-lg border border-navy-100 text-sm bg-white text-charcoal focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none"
            aria-label="Filter by action"
          >
            <option value="">All Actions</option>
            {uniqueActions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Trail Table */}
      <AuditTrail limit={50} />

      {/* Info footer */}
      <div className="bg-navy-50 rounded-xl p-4 flex items-start gap-3">
        <FileText className="w-5 h-5 text-navy mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-navy">Tamper-Proof Audit Trail</p>
          <p className="text-xs text-charcoal-muted mt-1">
            All audit records are cryptographically signed and stored in an append-only ledger.
            Records cannot be modified or deleted. This ensures complete transparency and accountability.
          </p>
        </div>
      </div>
    </div>
  );
}
