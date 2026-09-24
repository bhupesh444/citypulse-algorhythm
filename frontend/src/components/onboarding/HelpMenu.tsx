import React, { useRef, useEffect } from "react";

interface HelpMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  onStartDemo: () => void;
  onOpenShortcuts: () => void;
  onOpenAbout: () => void;
}

export const HelpMenu: React.FC<HelpMenuProps> = ({
  isOpen,
  onClose,
  onStartTour,
  onStartDemo,
  onOpenShortcuts,
  onOpenAbout,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={menuRef} className="help-dropdown-menu" role="menu" aria-label="Help and Guided Tour Menu">
      <div className="help-menu-header">
        <span className="help-menu-title">HELP & DEMONSTRATION</span>
      </div>

      <div className="help-menu-items">
        <button
          type="button"
          className="help-menu-item highlight"
          onClick={() => {
            onClose();
            onStartTour();
          }}
          role="menuitem"
        >
          <span className="help-item-icon">✦</span>
          <div className="help-item-text">
            <strong>Start Tour</strong>
            <small>Step-by-step interactive walkthrough</small>
          </div>
        </button>

        <button
          type="button"
          className="help-menu-item"
          onClick={() => {
            onClose();
            onStartDemo();
          }}
          role="menuitem"
        >
          <span className="help-item-icon">▶</span>
          <div className="help-item-text">
            <strong>Run Automated Demo</strong>
            <small>Hands-off 8-scene scenario presentation</small>
          </div>
        </button>

        <div className="help-menu-divider" />

        <button
          type="button"
          className="help-menu-item"
          onClick={() => {
            onClose();
            onOpenShortcuts();
          }}
          role="menuitem"
        >
          <span className="help-item-icon">⌨</span>
          <div className="help-item-text">
            <strong>Keyboard Shortcuts</strong>
            <small>Quick command navigation keys</small>
          </div>
        </button>

        <button
          type="button"
          className="help-menu-item"
          onClick={() => {
            onClose();
            onOpenAbout();
          }}
          role="menuitem"
        >
          <span className="help-item-icon">ⓘ</span>
          <div className="help-item-text">
            <strong>About CityPulse</strong>
            <small>Platform architecture & providers</small>
          </div>
        </button>
      </div>
    </div>
  );
};
