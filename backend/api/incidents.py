from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from ..services.incident_service import incident_service

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])


class StatusUpdateRequest(BaseModel):
    status: str  # OPEN, INVESTIGATING, RESOLVED


@router.get("")
async def list_incidents(
    zone: str = Query(default=""),
    status: str = Query(default=""),
):
    return incident_service.get_incidents(zone=zone or None, status=status or None)


@router.get("/{incident_id}")
async def get_incident(incident_id: str):
    inc = incident_service.get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc


@router.patch("/{incident_id}/status")
async def update_status(incident_id: str, req: StatusUpdateRequest):
    updated = incident_service.update_incident_status(incident_id, req.status.upper())
    if not updated:
        raise HTTPException(status_code=404, detail="Incident not found")
    return updated
