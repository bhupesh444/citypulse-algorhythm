from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Optional
from ..core.models import AskCityPulseRequest, AskCityPulseResponse
from ..services.ai_service import ai_service

router = APIRouter(prefix="/api/ai", tags=["AI Civic Intelligence"])


class AISummaryRequest(BaseModel):
    city_context: Optional[dict[str, Any]] = None


class IncidentAnalysisRequest(BaseModel):
    incident_id: str
    incident_details: Optional[dict[str, Any]] = None


@router.post("/summary")
async def get_ai_summary(req: AISummaryRequest):
    return await ai_service.generate_city_summary(req.city_context or {})


@router.post("/incident-analysis")
async def analyze_incident(req: IncidentAnalysisRequest):
    return {
        "incident_id": req.incident_id,
        "root_cause_analysis": "Traffic telemetry and historical road profile indicate structural choke at convergence point. Inclement weather further reduced operational capacity.",
        "dispatch_recommendation": "Deploy mobile traffic wardens to manual override signaling at upstream intersection.",
        "estimated_clearance_minutes": 25,
        "confidence": 92,
        "is_simulated": True,
    }


@router.get("/risk-analysis")
async def get_risk_analysis():
    return {
        "analysis": "Composite civic risk index is primarily dominated by Central Zone congestion and feeder line transit delays. Environmental and infrastructure factors remain within safe baseline envelopes.",
        "priority_focus": "Corridor traffic mitigation and drainage readiness.",
        "confidence": 94,
    }


@router.post("/ask", response_model=AskCityPulseResponse)
async def ask_citypulse(req: AskCityPulseRequest):
    return await ai_service.ask_citypulse(req.question, req.context)
