/**
 * NOAA Solar Calculation Utility for CityPulse Geographic Solar Shading
 * Determines exact solar elevation, twilight, day/night phases, and solar time
 * based on current UTC timestamp, latitude, and longitude.
 */

export interface SolarConditions {
  solarElevation: number; // degrees (-90 to +90)
  solarZenith: number;    // degrees (0 to 180)
  phase: "day" | "twilight" | "night";
  phaseLabel: string;     // e.g. "DAYLIGHT", "SUNSET / DUSK", "SUNRISE / DAWN", "NIGHT"
  icon: string;           // "☀️", "🌗", "🌙"
  localSolarTime: string; // HH:MM true solar time
  tintColor: string;      // subtle map overlay tint
  roadTone: "day" | "twilight" | "night";
  majorRoadColor: string;
  secondaryRoadColor: string;
  minorRoadColor: string;
}

export function computeSolarConditions(
  lat: number,
  lng: number,
  date: Date = new Date()
): SolarConditions {
  // Day of year calculation
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear =
    Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Fractional year in radians
  const gamma =
    ((2 * Math.PI) / 365) *
    (dayOfYear - 1 + (date.getUTCHours() - 12) / 24);

  // Equation of time in minutes (accounts for Earth's orbital eccentricity and axial tilt)
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Solar declination angle in radians
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  // Time offset in minutes from UTC for given longitude
  const timeOffset = eqtime + 4 * lng;

  // True solar time in minutes
  const utcMinutes =
    date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  let trueSolarTimeMinutes = (utcMinutes + timeOffset) % 1440;
  if (trueSolarTimeMinutes < 0) trueSolarTimeMinutes += 1440;

  // Solar hour angle in degrees
  let ha = trueSolarTimeMinutes / 4 - 180;
  if (ha < -180) ha += 360;
  const haRad = (ha * Math.PI) / 180;

  const latRad = (lat * Math.PI) / 180;

  // Solar zenith angle cosine
  const cosZenith =
    Math.sin(latRad) * Math.sin(decl) +
    Math.cos(latRad) * Math.cos(decl) * Math.cos(haRad);
  const zenithRad = Math.acos(Math.max(-1, Math.min(1, cosZenith)));
  const zenithDeg = (zenithRad * 180) / Math.PI;
  const elevationDeg = 90 - zenithDeg;

  // Format true local solar time HH:MM
  const sh = Math.floor(trueSolarTimeMinutes / 60);
  const sm = Math.floor(trueSolarTimeMinutes % 60);
  const localSolarTime = `${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}`;

  // Atmospheric twilight classification:
  // > 6°: Full daylight
  // -6° to 6°: Civil twilight (dawn / dusk)
  // < -6°: Nighttime
  let phase: "day" | "twilight" | "night" = "day";
  let phaseLabel = "DAYLIGHT";
  let icon = "☀️";
  let tintColor = "rgba(0, 0, 0, 0)";
  let roadTone: "day" | "twilight" | "night" = "day";
  let majorRoadColor = "#6B8492";
  let secondaryRoadColor = "#607786";
  let minorRoadColor = "#526A77";

  if (elevationDeg > 6) {
    phase = "day";
    phaseLabel = "DAYLIGHT";
    icon = "☀️";
    tintColor = "rgba(0, 0, 0, 0)";
    roadTone = "day";
    majorRoadColor = "#6B8492";
    secondaryRoadColor = "#607786";
    minorRoadColor = "#526A77";
  } else if (elevationDeg >= -6) {
    phase = "twilight";
    const isMorning = trueSolarTimeMinutes < 720;
    phaseLabel = isMorning ? "SUNRISE / DAWN" : "SUNSET / DUSK";
    icon = "🌗";
    tintColor = "rgba(22, 14, 20, 0.22)"; // subtle warm dusk tint
    roadTone = "twilight";
    majorRoadColor = "#687E8C";
    secondaryRoadColor = "#5B707F";
    minorRoadColor = "#4E616E";
  } else {
    phase = "night";
    phaseLabel = "NIGHTTIME";
    icon = "🌙";
    // Subtle midnight charcoal/navy tint that maintains road contrast
    tintColor = "rgba(4, 12, 18, 0.38)";
    roadTone = "night";
    majorRoadColor = "#5D7685";
    secondaryRoadColor = "#526A78";
    minorRoadColor = "#445967";
  }

  return {
    solarElevation: Math.round(elevationDeg * 10) / 10,
    solarZenith: Math.round(zenithDeg * 10) / 10,
    phase,
    phaseLabel,
    icon,
    localSolarTime,
    tintColor,
    roadTone,
    majorRoadColor,
    secondaryRoadColor,
    minorRoadColor,
  };
}
