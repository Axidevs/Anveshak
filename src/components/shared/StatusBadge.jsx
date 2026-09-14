import { getStatusColor } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';

export default function StatusBadge({ status, size = 'sm', showDot = true }) {
  const { t } = useLanguage();
  const colors = getStatusColor(status);
  const statusKey = `status.${status}`;
  const label = t(statusKey) !== statusKey ? t(statusKey) : status;

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${colors.bg} ${colors.text} ${sizeClasses[size]}`}
      role="status"
      aria-label={`Status: ${label}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${status === 'active' || status === 'urgent' ? 'status-glow' : ''}`} />
      )}
      <span className="capitalize">{label}</span>
    </span>
  );
}
