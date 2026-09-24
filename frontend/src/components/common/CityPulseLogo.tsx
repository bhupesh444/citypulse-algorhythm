import React from "react";

interface CityPulseLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export const CityPulseLogo: React.FC<CityPulseLogoProps> = ({
  size = 32,
  className = "",
  animated = true,
}) => {
  return (
    <div
      className={`citypulse-logo-mark ${className}`}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
      }}
      aria-label="CityPulse Logo"
      role="img"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          {/* Subtle Outer Card Gradient */}
          <linearGradient id="cpLogoBgGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0d233a" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#081726" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#040d18" stopOpacity="1" />
          </linearGradient>

          {/* Border Gradient */}
          <linearGradient id="cpLogoBorderGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
          </linearGradient>

          {/* Building Fill Gradient */}
          <linearGradient id="cpBuildingGrad" x1="0" y1="0" x2="0" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0e3352" stopOpacity="0.75" />
          </linearGradient>

          {/* Central Spire Gradient */}
          <linearGradient id="cpCenterTowerGrad" x1="0" y1="0" x2="0" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#082338" stopOpacity="0.85" />
          </linearGradient>

          {/* Vivid Pulse Line Gradient */}
          <linearGradient id="cpPulseLineGrad" x1="4" y1="18" x2="32" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="35%" stopColor="#2dd4bf" />
            <stop offset="70%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>

          {/* Glow Filter for the Pulse Line */}
          <filter id="cpPulseGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Shield / Emblem Container */}
        <rect
          x="1"
          y="1"
          width="34"
          height="34"
          rx="8"
          fill="url(#cpLogoBgGrad)"
          stroke="url(#cpLogoBorderGrad)"
          strokeWidth="1.2"
        />

        {/* Subtle Ambient City Glow */}
        <ellipse cx="18" cy="22" rx="11" ry="6" fill="#06b6d4" fillOpacity="0.12" />

        {/* City Skyline Silhouette */}
        {/* Left Sector Building */}
        <rect x="6.5" y="16.5" width="4.5" height="11" rx="0.8" fill="url(#cpBuildingGrad)" />
        {/* Left-Mid Stepped Tower */}
        <rect x="11.5" y="11.5" width="4" height="16" rx="0.8" fill="url(#cpBuildingGrad)" />
        {/* Center Main Intelligence Spire */}
        <rect x="16" y="8" width="5.5" height="19.5" rx="1" fill="url(#cpCenterTowerGrad)" />
        {/* Spire Antenna */}
        <line x1="18.75" y1="5" x2="18.75" y2="8" stroke="#2dd4bf" strokeWidth="1" strokeLinecap="round" />
        {/* Right-Mid Commercial Tower */}
        <rect x="22" y="13.5" width="4.5" height="14" rx="0.8" fill="url(#cpBuildingGrad)" />
        {/* Far Right Low-Rise */}
        <rect x="27" y="18" width="3.5" height="9.5" rx="0.8" fill="url(#cpBuildingGrad)" />

        {/* Smart City Sensor / Telemetry Window Dots */}
        <circle cx="18.75" cy="11" r="0.65" fill="#f0fdfa" />
        <circle cx="18.75" cy="14" r="0.65" fill="#5eead4" />
        <circle cx="13.5" cy="14" r="0.6" fill="#38bdf8" />
        <circle cx="24.25" cy="16" r="0.6" fill="#38bdf8" />

        {/* Pulse / Heartbeat Wave Foreground Line */}
        <path
          d="M 4 23 L 9.5 23 L 13 14 L 16.5 26.5 L 20 17 L 23 23 L 32 23"
          stroke="url(#cpPulseLineGrad)"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#cpPulseGlow)"
          className={animated ? "cp-pulse-track" : ""}
        />

        {/* Telemetry Peak Node (Apex of the Pulse) */}
        <circle
          cx="13"
          cy="14"
          r="1.6"
          fill="#ffffff"
          stroke="#2dd4bf"
          strokeWidth="0.8"
          className={animated ? "cp-pulse-node" : ""}
        />

        {/* Secondary Echo Node */}
        <circle
          cx="20"
          cy="17"
          r="1.2"
          fill="#5eead4"
          stroke="#06b6d4"
          strokeWidth="0.6"
        />

        {/* Spire Apex Beacon */}
        <circle
          cx="18.75"
          cy="5"
          r="1"
          fill="#2dd4bf"
          className={animated ? "cp-spire-beacon" : ""}
        />
      </svg>
    </div>
  );
};
