# CityPulse API Providers & Integration Guide

This document details the external data providers, purpose, credentials, rate limits, caching, and failover behavior implemented in the CityPulse Smart City Operations platform.

---

## 1. Providers Directory

| Provider | Purpose | Required Key | Endpoint / Protocol | Rate Limits | Data Freshness | Fallback Strategy | Attribution |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Open-Meteo Weather** | Real-time weather, precipitation, wind & multi-day forecast | None (Free open API) | `https://api.open-meteo.com/v1/forecast` | ~10,000 calls/day | Hourly ECMWF / GFS blend | In-memory 5-min cache + calibrated fallback | Weather data by Open-Meteo.com |
| **Open-Meteo Air Quality** | PM2.5, PM10, CO, NO2, SO2, O3, US & European AQI | None (Free open API) | `https://air-quality-api.open-meteo.com/v1/air-quality` | ~10,000 calls/day | Hourly Copernicus CAMS | In-memory 10-min cache + standard baseline | CAMS / Open-Meteo.com |
| **OpenAQ** | Ground monitoring sensor stations | `OPENAQ_API_KEY` (Optional) | `https://api.openaq.org/v2/latest` | Per key tier | Real-time ground telemetry | Automatic fallback to Open-Meteo Air Quality | OpenAQ Open Data Platform |
| **TomTom Traffic** | Real-time traffic flow speed, congestion ratio, delays & incidents | `TOMTOM_API_KEY` (Server-side) | `https://api.tomtom.com/traffic/services/` | 2,500 non-commercial calls/day | 1-min interval | Calibrated deterministic urban flow model | © 2026 TomTom Traffic Services |
| **GTFS & GTFS-RT** | Subway & bus fleet telematics, delays, schedules | Optional GTFS feed URL | Protocol Buffers / REST | Local polling | Sub-minute schedule deviation | Realistic simulated urban transit network | Jaipur City Transport Spec |
| **OpenAI API** | Natural language civic summaries & "Ask CityPulse" NLP agent | `OPENAI_API_KEY` (Server-side) | `https://api.openai.com/v1/chat/completions` (GPT-4o-mini) | Standard tier limits | Real-time prompt inference | Rule-calibrated neural domain engine | OpenAI GPT-4o-mini |
| **MapLibre GL JS** | Hardware-accelerated vector map engine & geo-layers | None (WebGL client) | Vector tiles / MapTiler Dataviz Dark | Client-side GPU | Instant 60 FPS | Tile raster fallback | © MapLibre, © MapTiler & OpenStreetMap |
| **Mapbox Geocoding** | Place, neighborhood, landmark & road search | `MAPBOX_ACCESS_TOKEN` | `https://api.mapbox.com/geocoding/v5/` | 100,000 calls/month | Real-time spatial index | Rate-limited Nominatim (max 1 req/s, cached) | © Mapbox |

---

## 2. Server-Side Security Model
- **Zero Frontend Key Leakage**: API tokens (`TOMTOM_API_KEY`, `OPENAI_API_KEY`, `OPENAQ_API_KEY`, `MAPBOX_ACCESS_TOKEN`, `CESIUM_ION_TOKEN`) are strictly consumed inside `backend/` and never shipped in the client bundle.
- **Client Access**: The frontend communicates exclusively with `/api/*` and `/ws/*` reverse-proxied routes.

---

## 3. Data Integrity & Transparent Labelling
As required by civic operations standards:
- **`LIVE`**: Verified telemetry received from an external active physical or API provider.
- **`DEMO`**: Calibrated deterministic simulated scenario telemetry.
- **`MIXED`**: Live weather/air quality paired with simulated transit or traffic where physical sensors are absent.
- **`UNAVAILABLE`**: Explicitly rendered when a feed fails; never silently replaced with unlabelled synthetic numbers.
