import { useEffect, useState } from 'react';

import { FileText, Download, Filter } from 'lucide-react';

import AuditTrail from '../../components/shared/AuditTrail';

import { useLanguage } from '../../contexts/LanguageContext';

import { apiFetch } from '../../utils/api';

export default function AuditLog() {

  const { t } = useLanguage();

  const [filterUser, setFilterUser] = useState('');

  const [filterAction, setFilterAction] = useState('');

  const [auditLogs, setAuditLogs] = useState([]);

  const [uniqueUsers, setUniqueUsers] = useState([]);

  const [uniqueActions, setUniqueActions] = useState([]);

  useEffect(() => {

    const loadFilterData = async () => {

      try {

        const casesResponse = await apiFetch('/case/assigned-to-me');

        const cases =
          casesResponse?.cases ||
          casesResponse?.data ||
          casesResponse ||
          [];

        if (!Array.isArray(cases) || cases.length === 0) {
          setAuditLogs([]);
          setUniqueUsers([]);
          setUniqueActions([]);
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

          const logs =
            response?.auditLogs ||
            response?.audit ||
            response?.logs ||
            response?.data ||
            response ||
            [];

          if (Array.isArray(logs)) {
            allLogs.push(...logs);
          }

        });

        const uniqueLogs = Array.from(
          new Map(
            allLogs.map((log) => [
              log._id || log.id,
              log
            ])
          ).values()
        );

        setAuditLogs(uniqueLogs);

        const users = [
          ...new Set(
            uniqueLogs
              .map(
                (log) =>
                  log.userId?.name ||
                  log.user?.name ||
                  log.userId?.email ||
                  log.user
              )
              .filter(Boolean)
          )
        ];

        const actions = [
          ...new Set(
            uniqueLogs
              .map((log) => {

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

                return actionMap[log.action] || log.action;

              })
              .filter(Boolean)
          )
        ];

        setUniqueUsers(users);
        setUniqueActions(actions);

      } catch (error) {

        console.error(
          'Failed to load audit filter data:',
          error
        );

        setAuditLogs([]);
        setUniqueUsers([]);
        setUniqueActions([]);

      }

    };

    loadFilterData();

  }, []);

  const filteredLogs = auditLogs.filter((log) => {

    const user =
      log.userId?.name ||
      log.user?.name ||
      log.userId?.email ||
      log.user ||
      '';

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

    const action =
      actionMap[log.action] ||
      log.action ||
      '';

    const userMatches =
      !filterUser ||
      user === filterUser;

    const actionMatches =
      !filterAction ||
      action === filterAction;

    return userMatches && actionMatches;

  });

  return (

    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-charcoal">
            {t('officer.auditLog')}
          </h1>

          <p className="text-sm text-charcoal-muted mt-1">
            Complete record of all platform activity
          </p>

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

            <span className="text-sm font-medium text-charcoal">
              Filters:
            </span>

          </div>

          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-3 py-2 rounded-lg border border-navy-100 text-sm bg-white text-charcoal focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none"
            aria-label="Filter by user"
          >

            <option value="">
              All Users
            </option>

            {uniqueUsers.map((u) => (

              <option key={u} value={u}>
                {u}
              </option>

            ))}

          </select>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 rounded-lg border border-navy-100 text-sm bg-white text-charcoal focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none"
            aria-label="Filter by action"
          >

            <option value="">
              All Actions
            </option>

            {uniqueActions.map((a) => (

              <option key={a} value={a}>
                {a}
              </option>

            ))}

          </select>

        </div>

      </div>

      {/* Audit Trail Table */}

      <AuditTrail
        limit={50}
        logsOverride={filteredLogs}
      />

      {/* Info footer */}

      <div className="bg-navy-50 rounded-xl p-4 flex items-start gap-3">

        <FileText className="w-5 h-5 text-navy mt-0.5 flex-shrink-0" />

        <div>

          <p className="text-sm font-medium text-navy">
            Tamper-Proof Audit Trail
          </p>

          <p className="text-xs text-charcoal-muted mt-1">

            All audit records are cryptographically signed and stored in an append-only ledger.
            Records cannot be modified or deleted. This ensures complete transparency and accountability.

          </p>

        </div>

      </div>

    </div>

  );

}