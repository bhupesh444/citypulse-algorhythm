import React from "react";

export type NotificationItem = {
  id: string;
  type: "CRITICAL" | "ANOMALY" | "SOURCE" | "AI" | "INFO";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
};

interface NotificationDrawerProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onClearAll,
  onSelectNotification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="notification-drawer-wrapper floating-panel">
      <div className="drawer-header">
        <div>
          <span className="eyebrow">COMMAND DISPATCH LOG</span>
          <h3>NOTIFICATIONS ({notifications.filter((n) => !n.isRead).length} UNREAD)</h3>
        </div>
        <div className="drawer-header-actions">
          <button className="text-action-btn" onClick={onClearAll}>
            Clear
          </button>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close notification panel">
            ×
          </button>
        </div>
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="empty-notifications">No operational notifications.</div>
        ) : (
          notifications.map((n) => {
            const tone =
              n.type === "CRITICAL"
                ? "tone-crit"
                : n.type === "ANOMALY"
                ? "tone-warn"
                : n.type === "AI"
                ? "tone-ai"
                : "tone-norm";

            return (
              <div
                key={n.id}
                className={`notification-card ${tone} ${n.isRead ? "is-read" : ""}`}
                onClick={() => {
                  onMarkAsRead(n.id);
                  if (onSelectNotification) onSelectNotification(n);
                }}
              >
                <div className="notif-top">
                  <span className={`notif-type-badge ${tone}`}>{n.type}</span>
                  <time>{new Date(n.timestamp).toLocaleTimeString()}</time>
                </div>
                <strong>{n.title}</strong>
                <p>{n.description}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
