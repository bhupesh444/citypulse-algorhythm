from fastapi import APIRouter, HTTPException
from ..services.incident_service import incident_service

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("")
async def get_alerts():
    return incident_service.get_alerts()


@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    inc_id = alert_id.replace("ALT-", "")
    updated = incident_service.update_incident_status(inc_id, "INVESTIGATING")
    return {"status": "acknowledged", "alert_id": alert_id, "incident": updated}


@router.post("/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    inc_id = alert_id.replace("ALT-", "")
    updated = incident_service.update_incident_status(inc_id, "RESOLVED")
    return {"status": "resolved", "alert_id": alert_id, "incident": updated}
