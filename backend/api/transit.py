from fastapi import APIRouter, Query
from ..providers.transit.gtfs import GTFSTransitProvider

router = APIRouter(prefix="/api/transit", tags=["Transit"])
transit_provider = GTFSTransitProvider()


@router.get("/routes")
async def get_transit_routes(zone: str = Query(default="")):
    return await transit_provider.get_routes(zone)


@router.get("/vehicles")
async def get_active_vehicles():
    return await transit_provider.get_active_vehicles()


@router.get("/alerts")
async def get_transit_alerts():
    return await transit_provider.get_alerts()


@router.get("/delays")
async def get_delays_summary():
    return await transit_provider.get_delays_summary()
