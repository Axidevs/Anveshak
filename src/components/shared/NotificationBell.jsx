import { useState, useRef, useEffect } from 'react';
import { Bell, FileText, Briefcase, UserCheck, UploadCloud, CheckCircle, Clock, Scale, Info, X } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

// --- Helper Functions ---

// Maps notification types to relevant Lucide icons matching site colors
const getTypeIcon = (type) => {
  switch (type) {
    case 'FIR_SUBMITTED': return <FileText className="w-4 h-4 text-navy" />;
    case 'CASE_CREATED': return <Briefcase className="w-4 h-4 text-emerald-600" />;
    case 'CASE_ASSIGNED': return <UserCheck className="w-4 h-4 text-saffron-600" />;
    case 'EVIDENCE_UPLOADED': return <UploadCloud className="w-4 h-4 text-blue-600" />;
    case 'EVIDENCE_VERIFIED': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    case 'STATUS_CHANGED': return <Clock className="w-4 h-4 text-orange-500" />;
    case 'COURT_UPDATE': return <Scale className="w-4 h-4 text-purple-600" />;
    default: return <Info className="w-4 h-4 text-gray-500" />;
  }
};

// Generates relative time like "2m ago" or "5d ago"
const getRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const diffMins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
};

// --- Main Component ---

export default function NotificationBell({ scrolled, isLandingPage }) {
  const { notifications, unreadCount, markAsRead, latestToast, clearToast } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const panelRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manage Toast alert lifecycle
  useEffect(() => {
    if (latestToast && !isOpen) {
      setShowToast(true);
      // Auto-dismiss toast after 4 seconds
      const timer = setTimeout(() => setShowToast(false), 4000);
      // Give exit animation time to finish before clearing data
      const cleanupTimer = setTimeout(() => clearToast(), 4300);
      return () => {
        clearTimeout(timer);
        clearTimeout(cleanupTimer);
      };
    } else if (latestToast && isOpen) {
      // If user is already looking at panel, dismiss toast silently
      clearToast();
    }
  }, [latestToast, isOpen, clearToast]);

  const handleNotificationClick = (id) => {
    markAsRead(id);
    setIsOpen(false);
  };

  const badgeText = unreadCount > 9 ? '9+' : unreadCount;

  return (
    <>
      {/* 1. Bell Icon & Dropdown Container */}
      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-2 rounded-full transition-all duration-200 ${
            scrolled || !isLandingPage
              ? 'text-navy hover:bg-navy/5'
              : 'text-white hover:bg-white/10'
          }`}
          aria-label="Notifications"
          aria-expanded={isOpen}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
              {badgeText}
            </span>
          )}
        </button>

        {/* 2. Notification Panel (Dropdown) */}
        {isOpen && (
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#FAF8F5] rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden flex flex-col max-h-[28rem]">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
              <h3 className="text-sm font-semibold text-charcoal">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-navy/10 text-navy px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif._id)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
                      notif.isRead 
                        ? 'bg-[#FAF8F5] hover:bg-gray-100/50' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {/* Dynamic Icon */}
                    <div className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.isRead ? 'bg-gray-100 opacity-60' : 'bg-[#FAF8F5] shadow-sm'
                    }`}>
                      {getTypeIcon(notif.type)}
                    </div>
                    
                    {/* Content & Time */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] leading-snug ${
                        notif.isRead ? 'text-charcoal/70' : 'text-charcoal font-semibold'
                      }`}>
                        {notif.message}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1 font-medium">
                        {getRelativeTime(notif.createdAt)}
                      </p>
                    </div>

                    {/* Unread Indicator Dot */}
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-navy flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Lightweight Toast/Pop-in Alert */}
      <div 
        className={`fixed bottom-6 right-6 z-[100] transition-all duration-300 transform ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        }`}
      >
        {latestToast && (
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 border-l-4 border-l-navy p-4 flex items-start gap-3 w-72 sm:w-80">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
              {getTypeIcon(latestToast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-navy/70 uppercase tracking-wider mb-1">New Update</p>
              <p className="text-sm text-charcoal font-medium leading-snug line-clamp-2">
                {latestToast.message}
              </p>
            </div>
            <button 
              onClick={() => {
                setShowToast(false);
                setTimeout(clearToast, 300);
              }}
              className="text-gray-400 hover:text-charcoal transition-colors p-1"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
