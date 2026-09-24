import asyncio
import time
from typing import Any
import httpx

from ...core.config import settings


class GeocodingProvider:
    def __init__(self):
        self.mapbox_token = settings.MAPBOX_ACCESS_TOKEN
        self._cache: dict[str, tuple[float, list[dict[str, Any]]]] = {}
        self._cache_ttl = 86400  # 24 hour cache for geocodes
        self._last_nominatim_time = 0.0

    async def search(self, query: str) -> list[dict[str, Any]]:
        query_clean = query.strip().lower()
        if not query_clean:
            return []

        now = time.time()
        if query_clean in self._cache:
            ts, results = self._cache[query_clean]
            if now - ts < self._cache_ttl:
                return results

        # 1. Prefer Mapbox if token configured
        if self.mapbox_token:
            url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{httpx.URL(query).raw_path.decode('utf-8')}.json"
            params = {
                "access_token": self.mapbox_token,
                "limit": 5,
                "proximity": f"{settings.DEFAULT_LONGITUDE},{settings.DEFAULT_LATITUDE}",
            }
            try:
                async with httpx.AsyncClient(timeout=3.5) as client:
                    resp = await client.get(url, params=params)
                    if resp.status_code == 200:
                        features = resp.json().get("features", [])
                        results = []
                        for f in features:
                            center = f.get("center", [settings.DEFAULT_LONGITUDE, settings.DEFAULT_LATITUDE])
                            results.append({
                                "name": f.get("text", query),
                                "display_name": f.get("place_name", query),
                                "latitude": center[1],
                                "longitude": center[0],
                                "source": "Mapbox Geocoding",
                            })
                        if results:
                            self._cache[query_clean] = (now, results)
                            return results
            except Exception:
                pass

        # 2. Strict Rate-Limited OpenStreetMap Geocoder (Max 1 req/sec, specific User-Agent)
        time_since_last = time.time() - self._last_nominatim_time
        if time_since_last < 1.1:
            await asyncio.sleep(1.1 - time_since_last)
        self._last_nominatim_time = time.time()

        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": query,
            "format": "jsonv2",
            "limit": 5,
            "viewbox": "75.50,27.30,76.20,26.60",  # Jaipur bounded focus
        }
        headers = {"User-Agent": "CityPulse-CommandCenter/1.0 (civic.intelligence@citypulse.local)"}

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    raw_list = resp.json()
                    results = []
                    for item in raw_list:
                        results.append({
                            "name": item.get("name") or query,
                            "display_name": item.get("display_name", query),
                            "latitude": float(item.get("lat", settings.DEFAULT_LATITUDE)),
                            "longitude": float(item.get("lon", settings.DEFAULT_LONGITUDE)),
                            "source": "OpenStreetMap Nominatim (Cached & Throttled)",
                        })
                    if results:
                        self._cache[query_clean] = (time.time(), results)
                        return results
        except Exception:
            pass

        # 3. Known Local Landmarks fallback
        known_landmarks = {
            "mi road": {"name": "MI Road", "display_name": "Mirza Ismail Road, Central Jaipur", "latitude": 26.9184, "longitude": 75.8015},
            "central": {"name": "Central Zone", "display_name": "Central Civic District, Jaipur", "latitude": 26.9124, "longitude": 75.7873},
            "amity": {"name": "Amity University Jaipur", "display_name": "Amity University Rajasthan, Kant Kalwar, Jaipur", "latitude": 27.1769338, "longitude": 75.9596886},
            "hawa mahal": {"name": "Hawa Mahal", "display_name": "Hawa Mahal, Badi Chaupar, Old City, Jaipur", "latitude": 26.9239, "longitude": 75.8267},
            "malviya nagar": {"name": "Malviya Nagar", "display_name": "Malviya Nagar Institutional Area, Jaipur", "latitude": 26.8530, "longitude": 75.8190},
            "vaishali nagar": {"name": "Vaishali Nagar", "display_name": "Vaishali Nagar Commercial Hub, Jaipur", "latitude": 26.9070, "longitude": 75.7420},
            "jagatpura": {"name": "Jagatpura", "display_name": "Jagatpura Growth Zone, Jaipur", "latitude": 26.8150, "longitude": 75.8500},
            "amber": {"name": "Amber Fort", "display_name": "Amer / Amber Fort Heritage Sector, Jaipur", "latitude": 26.9855, "longitude": 75.8513},
        }
        for k, v in known_landmarks.items():
            if k in query_clean:
                res = [{**v, "source": "CityPulse Geo Directory"}]
                return res

        return []
