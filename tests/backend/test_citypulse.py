from backend.main import app
from backend.simulation.scenario_engine import build_snapshot
from fastapi.testclient import TestClient


def test_heavy_rain_scenario_is_coherent() -> None:
    snapshot = build_snapshot(8)
    assert snapshot.weather.weather_condition == "Heavy rain"
    assert snapshot.traffic[0].congestion > 75
    assert snapshot.transit[0].delay_minutes > 0
    assert snapshot.incidents
    assert snapshot.correlations
    assert snapshot.risk.score > 60


def test_health_endpoint() -> None:
    response = TestClient(app).get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"