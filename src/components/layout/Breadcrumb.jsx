import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels = {
  citizen: 'Citizen Dashboard',
  officer: 'Officer Dashboard',
  court: 'Court Dashboard',
  login: 'Login',
  register: 'Register',
  'log-fir': 'File FIR',
  'view-firs': 'My FIRs',
  search: 'Smart Search',
  cases: 'My Cases',
  upload: 'Resource Upload',
  sharing: 'Data Sharing',
  access: 'Access Control',
  chat: 'Department Chat',
  audit: 'Audit Log',
  security: 'Security Panel',
  documents: 'View Documents',
  alerts: 'Alert Settings',
  proceedings: 'Legal Proceedings',
};

export default function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length <= 1) return null;

  const crumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === pathSegments.length - 1;

    return { path, label, isLast };
  });

  return (
    <nav
      className="flex items-center gap-1.5 text-sm text-charcoal-muted py-3 px-1 overflow-x-auto"
      aria-label="Breadcrumb"
    >
      <Link
        to="/"
        className="flex items-center gap-1 text-navy hover:text-saffron transition-colors flex-shrink-0"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map(({ path, label, isLast }) => (
        <span key={path} className="flex items-center gap-1.5 flex-shrink-0">
          <ChevronRight className="w-3.5 h-3.5 text-charcoal-muted/50" />
          {isLast ? (
            <span className="font-medium text-charcoal" aria-current="page">{label}</span>
          ) : (
            <Link to={path} className="text-navy hover:text-saffron transition-colors">
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
