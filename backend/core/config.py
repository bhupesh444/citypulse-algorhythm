import os
from pathlib import Path


def load_env_file():
    """Load simple key=value pairs from .env or .env.local if present."""
    base_dir = Path(__file__).resolve().parent.parent.parent
    for fname in [".env.local", ".env"]:
        env_path = base_dir / fname
        if env_path.is_file():
            try:
                for line in env_path.read_text(encoding="utf-8").splitlines():
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, val = line.split("=", 1)
                        key = key.strip()
                        val = val.strip().strip("'\"")
                        if key and key not in os.environ:
                            os.environ[key] = val
            except Exception:
                pass


load_env_file()


class Settings:
    PROJECT_NAME: str = "CityPulse Command Center"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # API Keys (Server-side only)
    TOMTOM_API_KEY: str = os.getenv("TOMTOM_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAQ_API_KEY: str = os.getenv("OPENAQ_API_KEY", "")
    MAPBOX_ACCESS_TOKEN: str = os.getenv("MAPBOX_ACCESS_TOKEN", "")
    MAPTILER_API_KEY: str = os.getenv("MAPTILER_API_KEY", "")
    CESIUM_ION_TOKEN: str = os.getenv("CESIUM_ION_TOKEN", "")

    # Default Geo Location
    DEFAULT_CITY: str = os.getenv("DEFAULT_CITY", "Jaipur")
    DEFAULT_LATITUDE: float = float(os.getenv("DEFAULT_LATITUDE", "26.9124"))
    DEFAULT_LONGITUDE: float = float(os.getenv("DEFAULT_LONGITUDE", "75.7873"))
    DEFAULT_TIMEZONE: str = os.getenv("DEFAULT_TIMEZONE", "Asia/Kolkata")

    # CityPulse Center (Amity University Jaipur / Operations Center)
    AMITY_LATITUDE: float = 27.1769338
    AMITY_LONGITUDE: float = 75.9596886

    # Operational Mode: "LIVE", "DEMO", or "MIXED"
    DATA_MODE: str = os.getenv("DATA_MODE", "MIXED")

    # CORS Allowed Origins (comma-separated or * for development)
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "*")


settings = Settings()
