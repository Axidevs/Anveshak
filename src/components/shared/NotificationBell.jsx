import { useState, useRef, useEffect } from 'react';

import {
  Bell,
  FileSearch,
  Gavel,
  Share2,
  Shield,
  CheckCircle,
  X
} from 'lucide-react';

import { io } from 'socket.io-client';

import { apiFetch } from '../../utils/api';
import { formatRelativeTime } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';

const iconMap = {
  FileSearch,
  Gavel,
  Share2,
  Shield,
  CheckCircle
};

const SOCKET_URL = 'http://localhost:5001';

const getNotificationType = (notification) => {
  const type = (
    notification?.type || ''
  ).toUpperCase();

  switch (type) {
    case 'FIR_SUBMITTED':
    case 'CASE_CREATED':
    case 'CASE_ASSIGNED':
    case 'STATUS_CHANGED':
    case 'INVESTIGATION_UPDATE':
      return 'case_update';

    case 'COURT_UPDATE':
      return 'hearing';

    case 'EVIDENCE_UPLOADED':
    case 'EVIDENCE_VERIFIED':
    case 'NEW_MESSAGE':
      return 'sharing';

    case 'GENERAL':
      return 'system';

    default:
      return 'system';
  }
};

const getNotificationIcon = (notification) => {
  const type = (
    notification?.type || ''
  ).toUpperCase();

  switch (type) {
    case 'COURT_UPDATE':
      return 'Gavel';

    case 'EVIDENCE_UPLOADED':
    case 'EVIDENCE_VERIFIED':
    case 'NEW_MESSAGE':
      return 'Share2';

    case 'STATUS_CHANGED':
    case 'CASE_ASSIGNED':
    case 'INVESTIGATION_UPDATE':
      return 'Shield';

    case 'FIR_SUBMITTED':
    case 'CASE_CREATED':
      return 'FileSearch';

    default:
      return 'CheckCircle';
  }
};

const normalizeNotification = (notification) => {
  if (!notification) return null;

  const type = getNotificationType(notification);

  const icon =
    notification.icon ||
    getNotificationIcon(notification);

  return {
    id:
      notification._id ||
      notification.id,

    title:
      notification.title ||
      notification.subject ||
      notification.type
        ?.replace(/_/g, ' ')
        ?.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ) ||
      'Notification',

    message:
      notification.message ||
      notification.description ||
      'You have a new notification.',

    time:
      notification.createdAt ||
      notification.time ||
      new Date().toISOString(),

    read: Boolean(
      notification.isRead ??
      notification.read
    ),

    type,
    icon
  };
};

export default function NotificationBell({
  scrolled,
  isLandingPage
}) {
  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const panelRef = useRef(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // Load existing notifications + listen for real-time notifications
  useEffect(() => {
    let socket;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiFetch(
          '/notifications'
        );

        const rawNotifications =
          Array.isArray(response)
            ? response
            : response?.notifications ||
              response?.data?.notifications ||
              response?.data ||
              [];

        const normalized = Array.isArray(
          rawNotifications
        )
          ? rawNotifications
              .map(normalizeNotification)
              .filter(Boolean)
          : [];

        setNotifications(normalized);
      } catch (err) {
        console.error(
          'Failed to load notifications:',
          err
        );

        setError(
          err.message ||
            'Unable to load notifications.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Real-time notification socket
    const token = localStorage.getItem(
      'anveshak_token'
    );

    if (token) {
      socket = io(SOCKET_URL, {
        auth: {
          token
        }
      });

      socket.on('connect', () => {
        console.log(
          '🔔 Notification socket connected:',
          socket.id
        );
      });

      socket.on(
        'newNotification',
        (notification) => {
          console.log(
            '🔔 NEW NOTIFICATION RECEIVED:',
            notification
          );

          const normalized =
            normalizeNotification(
              notification
            );

          if (!normalized) return;

          setNotifications(
            (previous) => {
              const alreadyExists =
                previous.some(
                  (item) =>
                    item.id ===
                    normalized.id
                );

              if (alreadyExists) {
                return previous;
              }

              return [
                normalized,
                ...previous
              ];
            }
          );
        }
      );

      socket.on('connect_error', (err) => {
        console.error(
          'Notification socket error:',
          err.message
        );
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        panelRef.current &&
        !panelRef.current.contains(
          event.target
        )
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
  }, []);

  const markNotificationRead = async (
    notificationId
  ) => {
    if (!notificationId) return;

    try {
      await apiFetch(
        `/notifications/${notificationId}/read`,
        {
          method: 'PATCH'
        }
      );

      setNotifications(
        (previous) =>
          previous.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    read: true
                  }
                : notification
          )
      );
    } catch (err) {
      console.error(
        'Failed to mark notification as read:',
        err
      );
    }
  };

  const markAllRead = async () => {
    const unreadNotifications =
      notifications.filter(
        (notification) =>
          !notification.read
      );

    if (
      unreadNotifications.length ===
      0
    ) {
      return;
    }

    try {
      await Promise.all(
        unreadNotifications.map(
          (notification) =>
            apiFetch(
              `/notifications/${notification.id}/read`,
              {
                method: 'PATCH'
              }
            )
        )
      );

      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              read: true
            })
          )
      );
    } catch (err) {
      console.error(
        'Failed to mark all notifications as read:',
        err
      );

      setError(
        err.message ||
          'Unable to mark notifications as read.'
      );
    }
  };

  const typeColors = {
    case_update:
      'text-navy bg-navy-100',

    hearing:
      'text-saffron-700 bg-saffron-100',

    sharing:
      'text-forest bg-forest-100',

    alert:
      'text-alert bg-alert-100',

    system:
      'text-charcoal-muted bg-gray-100'
  };

  return (
    <div
      className="relative"
      ref={panelRef}
    >
      <button
        onClick={() =>
          setIsOpen(!isOpen)
        }
        className={`relative p-2 rounded-full transition-all duration-200 ${
          scrolled ||
          !isLandingPage
            ? 'text-navy hover:bg-navy-50'
            : 'text-white hover:bg-white/10'
        }`}
        aria-label={`${
          t(
            'common.notifications'
          )
        } — ${unreadCount} unread`}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-alert text-white text-[10px] font-bold rounded-full flex items-center justify-center badge-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-navy-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-navy-50 bg-cream">
            <h3 className="text-sm font-semibold text-charcoal">
              {t(
                'common.notifications'
              )}
            </h3>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={
                    markAllRead
                  }
                  className="text-xs text-navy hover:text-saffron transition-colors font-medium"
                >
                  {t(
                    'common.markAllRead'
                  )}
                </button>
              )}

              <button
                onClick={() =>
                  setIsOpen(false)
                }
                className="p-1 rounded hover:bg-navy-50 text-charcoal-muted"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-charcoal-muted">
                Loading notifications...
              </div>
            ) : error &&
              notifications.length ===
                0 ? (
              <div className="px-4 py-8 text-center text-xs text-charcoal-muted">
                {error}
              </div>
            ) : notifications.length ===
              0 ? (
              <div className="px-4 py-8 text-center text-sm text-charcoal-muted">
                No notifications yet.
              </div>
            ) : (
              notifications.map(
                (notif) => {
                  const IconComponent =
                    iconMap[
                      notif.icon
                    ] || Bell;

                  const colorClass =
                    typeColors[
                      notif.type
                    ] ||
                    typeColors.system;

                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (
                          !notif.read
                        ) {
                          markNotificationRead(
                            notif.id
                          );
                        }
                      }}
                      className={`flex gap-3 px-4 py-3 border-b border-navy-50/50 hover:bg-navy-50/30 transition-colors cursor-pointer ${
                        !notif.read
                          ? 'bg-navy-50/50'
                          : ''
                      }`}
                      role="listitem"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            !notif.read
                              ? 'font-semibold text-charcoal'
                              : 'font-medium text-charcoal-light'
                          }`}
                        >
                          {notif.title}
                        </p>

                        <p className="text-xs text-charcoal-muted mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>

                        <p className="text-[10px] text-charcoal-muted/70 mt-1">
                          {formatRelativeTime(
                            notif.time
                          )}
                        </p>
                      </div>

                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-saffron flex-shrink-0 mt-2" />
                      )}
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}