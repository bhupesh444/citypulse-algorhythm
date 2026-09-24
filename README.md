# CityPulse — Civic Intelligence Command Center

CityPulse is an enterprise-grade Civic Intelligence and Smart City Operations Platform designed for municipal operators, transport directors, and emergency dispatch centers.

It fuses multi-modal real-time signals into a unified operational command surface:
- **Traffic Flow & Congestion**: Real-time speed, travel time, and incident telemetry (TomTom Traffic API / Calibrated Flow Model)
- **Meteorological Conditions**: Live temperature, precipitation, wind, humidity, and forecasts (Open-Meteo API)
- **Air Quality & Atmospheric Chemistry**: Live PM2.5, PM10, CO, NO2, SO2, O3, and AQI (Open-Meteo Air Quality & OpenAQ)
- **Public Transport Fleet Health**: Route tracking, schedule delays, and vehicle positions (GTFS / GTFS-RT compliant)
- **Municipal Incidents & Alerts**: High-density dispatch alerts across traffic, waterlogging, power, and infrastructure
- **Civic Risk Engine**: Explainable weighted risk indices with transparent methodology and a 60-minute predictive forecast
- **AI Civic Intelligence ("Ask CityPulse")**: OpenAI GPT-4o-mini powered natural language query assistant for operators
- **Interactive Cartography**: Hardware-accelerated MapLibre GL JS vector maps with 10 togglable geospatial layers and Earth 3D modes
- **Longitudinal Analytics**: Interactive multi-range timeseries (1H, 6H, 24H, 7D, 30D) with baseline deltas
- **Deterministic Historical Replay**: Timeline scrubber with variable speed playback (1x, 2x, 5x)

---

## Architecture

```
cityplus/
├── backend/
│   ├── api/             # Modular REST routers (traffic, weather, air quality, transit, incidents, zones, analytics, ai)
│   ├── core/            # Config, settings, and Pydantic models
│   ├── providers/       # Data provider abstraction (TomTom, Open-Meteo, OpenAQ, GTFS, Geocoding)
│   ├── services/        # Risk engine, incident service, analytics engine, AI service
│   ├── simulation/      # Calibrated scenario generator & deterministic replay
│   └── main.py          # FastAPI application & WebSocket server
├── frontend/
│   ├── src/
│   │   ├── components/  # MapLibre map, layer controls, alert modals, analytics, AI panel, zones, replay, settings
│   │   ├── services/    # Typed REST & WebSocket client
│   │   ├── types/       # TypeScript schema definitions matching backend
│   │   ├── App.tsx      # Main command center layout & navigation
│   │   └── styles.css   # Dark futuristic enterprise theme
│   └── package.json
├── docs/
│   └── API_PROVIDERS.md # Detailed data provider specs & rate limits
├── tests/               # Backend Pytest test suites (unit & integration)
├── .env.example         # Template for environment keys
└── README.md
```

---

## Quickstart

### 1. Backend (Python 3.11+)

```powershell
cd backend
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend (Node 20+)

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Surface

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | GET | System status, service version, and data mode |
| `/api/snapshot?step=0` | GET | Full city snapshot at simulation step |
| `/api/weather/current` | GET | Current live meteorological telemetry (Open-Meteo) |
| `/api/weather/forecast` | GET | Multi-day atmospheric forecast |
| `/api/air-quality/current` | GET | Live PM2.5, PM10, ozone, and AQI |
| `/api/traffic/flow` | GET | Corridor speed, free-flow speed, congestion ratio |
| `/api/traffic/incidents` | GET | Active traffic accidents & obstructions |
| `/api/transit/routes` | GET | Transit lines, delays, and vehicle counts |
| `/api/transit/vehicles` | GET | Active vehicle GPS coordinates and status |
| `/api/incidents` | GET / PATCH | Unified civic incident lifecycle (OPEN, INVESTIGATING, RESOLVED) |
| `/api/alerts` | GET / POST | Actionable alerts with acknowledge/resolve flows |
| `/api/zones` | GET | District-level operational matrix |
| `/api/analytics?time_range=24H` | GET | Historical timeseries (1H, 6H, 24H, 7D, 30D) |
| `/api/ai/summary` | POST | AI executive operations summary |
| `/api/ai/ask` | POST | "Ask CityPulse" natural language operator assistant |
| `/api/sources/status` | GET | Live latency, sync timestamps, and health of all providers |
| `/api/geocoding/search?q=...` | GET | Location and landmark geocoder |
| `/ws/citypulse` | WS | Real-time streaming WebSocket telemetry |

Interactive Swagger documentation is available at `http://localhost:8000/docs`.

---

## Transparent Data Labelling Rule
CityPulse adheres strictly to civic truthfulness standards:
- Every metric badge explicitly identifies its origin (**LIVE**, **DEMO**, or **MIXED**).
- Simulated data is never presented as verified live data.
- Missing live feeds display **DATA UNAVAILABLE** rather than silently fabricating numbers.

For external API keys, rate limits, and fallback documentation, see [`docs/API_PROVIDERS.md`](file:///c:/Users/bhupe/Desktop/cityplus/docs/API_PROVIDERS.md).

---

## MapTiler API Setup

CityPulse utilizes MapTiler vector tiles with hardware-accelerated MapLibre GL JS for city cartography.

1. Create a free account at [MapTiler Cloud](https://cloud.maptiler.com/).
2. Generate an API key under **Account > Keys**.
3. Open the frontend `.env` file (`frontend/.env`).
4. Add your API key:
   ```env
   VITE_MAPTILER_API_KEY=your_actual_key
   ```
5. Restart the Vite development server (`npm run dev`).

> **Security Note**: Never commit `.env` or any real API keys to GitHub. `.env` and `.env.local` are automatically ignored by `.gitignore`. In production, restrict your key's allowed HTTP referrers in the MapTiler dashboard.

