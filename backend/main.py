import asyncio
import os
from datetime import datetime, timezone
from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

try:
    from .core.models import CitySnapshot, RiskSnapshot
    from .core.config import settings
    from .simulation.scenario_engine import build_snapshot
    from .services.incident_service import incident_service
    from .services.risk_engine import risk_engine
    from .api.weather import router as weather_router
    from .api.air_quality import router as aq_router
    from .api.traffic import router as traffic_router
    from .api.transit import router as transit_router
    from .api.incidents import router as incidents_router
    from .api.alerts import router as alerts_router
    from .api.zones import router as zones_router
    from .api.analytics import router as analytics_router
    from .api.ai import router as ai_router
    from .api.sources import router as sources_router
    from .api.geocoding import router as geocoding_router
except ImportError:
    from core.models import CitySnapshot, RiskSnapshot
    from core.config import settings
    from simulation.scenario_engine import build_snapshot
    from services.incident_service import incident_service
    from services.risk_engine import risk_engine
    from api.weather import router as weather_router
    from api.air_quality import router as aq_router
    from api.traffic import router as traffic_router
    from api.transit import router as transit_router
    from api.incidents import router as incidents_router
    from api.alerts import router as alerts_router
    from api.zones import router as zones_router
    from api.analytics import router as analytics_router
    from api.ai import router as ai_router
    from api.sources import router as sources_router
    from api.geocoding import router as geocoding_router

app = FastAPI(
    title="CityPulse Command Center API",
    version=settings.VERSION,
    description="Civic intelligence operations platform REST & streaming API",
)

raw_origins = getattr(settings, "ALLOWED_ORIGINS", os.getenv("ALLOWED_ORIGINS", "*"))
cors_origins = [o.strip() for o in raw_origins.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register new feature routers
app.include_router(weather_router)
app.include_router(aq_router)
app.include_router(traffic_router)
app.include_router(transit_router)
app.include_router(incidents_router)
app.include_router(alerts_router)
app.include_router(zones_router)
app.include_router(analytics_router)
app.include_router(ai_router)
app.include_router(sources_router)
app.include_router(geocoding_router)


@app.get("/")
def root():
    return {
        "service": "CityPulse Command Center API",
        "status": "online",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health")
@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "CityPulse",
        "version": settings.VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data_mode": settings.DATA_MODE,
    }


@app.get("/api/risk", response_model=RiskSnapshot)
def risk(step: int = 0) -> RiskSnapshot:
    return build_snapshot(step).risk


@app.get("/api/risk/forecast")
def risk_forecast(step: int = 0):
    snap = build_snapshot(step)
    return {
        "score": snap.risk.score,
        "level": snap.risk.level,
        "breakdown": snap.risk.breakdown,
        "forecast": snap.risk.forecast,
        "why_score": snap.risk.why_score,
    }


@app.get("/api/snapshot")
def snapshot(step: int = 0) -> CitySnapshot:
    return build_snapshot(step)


# Backwards compatible endpoints
@app.get("/api/weather-legacy")
def weather_legacy(step: int = 0):
    return build_snapshot(step).weather


@app.get("/api/traffic-legacy")
def traffic_legacy(step: int = 0):
    return build_snapshot(step).traffic


@app.get("/api/transit-legacy")
def transit_legacy(step: int = 0):
    return build_snapshot(step).transit


@app.get("/api/anomalies")
def anomalies(step: int = 0):
    return build_snapshot(step).anomalies


@app.get("/api/correlations")
def correlations(step: int = 0):
    return build_snapshot(step).correlations


# Real-time WebSocket feed
@app.websocket("/ws/citypulse")
async def citypulse_feed(websocket: WebSocket):
    await websocket.accept()
    step = 0
    try:
        while True:
            snap = build_snapshot(step)
            await websocket.send_text(snap.model_dump_json())
            step = (step + 1) % 12
            await asyncio.sleep(2.5)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
