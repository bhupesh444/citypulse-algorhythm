// Primary Jaipur Operational Center (Amity HQ)
export const JAIPUR_HQ = {
  lat: 27.1769338,
  lng: 75.9596886,
  name: "Amity University Jaipur HQ",
};

// 5 Core Operational Civic Zones with exact Jaipur coordinates
export const JAIPUR_ZONES = [
  {
    id: "central",
    name: "Central",
    fullName: "Central Jaipur / MI Road & Pink City",
    lat: 27.1769,
    lng: 75.9597,
    baseCongestion: 72,
    baseRisk: 78,
    type: "Civic Core & Government District",
  },
  {
    id: "north",
    name: "North",
    fullName: "North Tech Corridor (Amity / Sitapura)",
    lat: 27.245,
    lng: 75.892,
    baseCongestion: 48,
    baseRisk: 42,
    type: "Technology & Education Hub",
  },
  {
    id: "south",
    name: "South",
    fullName: "South Logistics (Industrial Corridor)",
    lat: 27.112,
    lng: 75.923,
    baseCongestion: 85,
    baseRisk: 88,
    type: "Freight & Heavy Transport Hub",
  },
  {
    id: "east",
    name: "East",
    fullName: "East Commercial Corridor",
    lat: 27.185,
    lng: 76.035,
    baseCongestion: 56,
    baseRisk: 52,
    type: "Financial & Commercial Market",
  },
  {
    id: "west",
    name: "West",
    fullName: "West Residential Sector (Mansarovar)",
    lat: 27.162,
    lng: 75.882,
    baseCongestion: 38,
    baseRisk: 34,
    type: "High-Density Residential Sector",
  },
];

export const JAIPUR_INFRASTRUCTURE = [
  {
    id: "infra-power-1",
    name: "Jaipur Smart Grid Substation A",
    category: "Power Grid",
    zone: "Central",
    lat: 27.182,
    lng: 75.945,
    status: "NORMAL",
    risk: 18,
  },
  {
    id: "infra-water-1",
    name: "Durgapura Water Distribution Facility",
    category: "Water Supply",
    zone: "South",
    lat: 27.125,
    lng: 75.918,
    status: "WARNING",
    risk: 62,
  },
  {
    id: "infra-signal-1",
    name: "Adaptive Signal Hub 04",
    category: "Traffic Automation",
    zone: "North",
    lat: 27.238,
    lng: 75.901,
    status: "NORMAL",
    risk: 24,
  },
];
