import React, { useEffect } from "react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: "Esc", desc: "Close location inspection, modals, tour, or demo mode" },
    { key: "1 - 7", desc: "Direct navigation: Dashboard, Alerts, Insights, Zones, Analytics, Replay, Settings" },
    { key: "/", desc: "Focus location search bar in topbar" },
    { key: "+ / -", desc: "Zoom map in / out" },
    { key: "Space", desc: "Play / Pause automated demo mode" },
    { key: "← / →", desc: "Previous / Next step during Guided Tour or Demo" },
    { key: "?", desc: "Open Help & Guided Tour menu" },
  ];

  return (
    <div className="onboarding-modal-backdrop" onClick={onClose}>
      <div
        className="shortcuts-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="shortcuts-modal-header">
          <div>
            <span className="page-eyebrow">COMMAND CONTROLS</span>
            <h3 id="shortcuts-title" className="shortcuts-title">Keyboard Shortcuts</h3>
          </div>
          <button
            type="button"
            className="onboarding-close-btn"
            onClick={onClose}
            aria-label="Close shortcuts"
          >
            ✕
          </button>
        </div>

        <div className="shortcuts-list">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="shortcut-row">
              <kbd className="shortcut-kbd">{s.key}</kbd>
              <span className="shortcut-desc">{s.desc}</span>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <button type="button" className="onboarding-btn btn-primary" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
