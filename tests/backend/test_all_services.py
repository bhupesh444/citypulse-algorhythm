from backend.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_weather_endpoints():
    res = client.get("/api/weather/current")
    assert res.status_code == 200
    data = res.json()
    assert "temperature" in data
    assert "humidity" in data
    assert "weather_condition" in data


def test_air_quality_endpoint():
    res = client.get("/api/air-quality/current")
    assert res.status_code == 200
    data = res.json()
    assert "aqi" in data
    assert "pm2_5" in data


def test_traffic_endpoints():
    res = client.get("/api/traffic/flow")
    assert res.status_code == 200
    data = res.json()
    assert "current_speed" in data
    assert "congestion_ratio" in data


def test_transit_endpoints():
    res = client.get("/api/transit/routes")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_incidents_and_alerts():
    res = client.get("/api/incidents")
    assert res.status_code == 200
    incidents = res.json()
    assert isinstance(incidents, list)

    res_alt = client.get("/api/alerts")
    assert res_alt.status_code == 200
    alerts = res_alt.json()
    assert isinstance(alerts, list)


def test_zones_endpoint():
    res = client.get("/api/zones")
    assert res.status_code == 200
    zones = res.json()
    assert len(zones) >= 5


def test_analytics_endpoint():
    res = client.get("/api/analytics?time_range=24H")
    assert res.status_code == 200
    data = res.json()
    assert "traffic_congestion" in data
    assert "risk_score" in data
    assert "timestamps" in data


def test_ai_ask_endpoint():
    res = client.post("/api/ai/ask", json={"question": "Why is traffic increasing in Central?"})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert len(data["observed_changes"]) > 0
    assert "confidence" in data


def test_sources_status():
    res = client.get("/api/sources/status")
    assert res.status_code == 200
    sources = res.json()
    assert len(sources) >= 5


def test_geocoding_search():
    res = client.get("/api/geocoding/search?q=Central")
    assert res.status_code == 200
    results = res.json()
    assert isinstance(results, list)
