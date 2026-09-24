from fastapi import APIRouter, Query
from ..providers.geocoding.geocoder import GeocodingProvider

router = APIRouter(prefix="/api/geocoding", tags=["Geocoding"])
geocoder = GeocodingProvider()


@router.get("/search")
async def search_locations(q: str = Query(..., min_length=1)):
    return await geocoder.search(q)
