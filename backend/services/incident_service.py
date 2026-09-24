from datetime import datetime, timezone, timedelta
from typing import Optional
from ..core.models import AlertDetail, Incident, IncidentStatus, IncidentType, Severity, SourceStatus


class IncidentService:
    def __init__(self):
        now = datetime.now(timezone.utc)
        self._incidents: list[Incident] = [
            Incident(
                id="INC-2026-001",
                title="Traffic Congestion & Stalled Vehicle",
                type=IncidentType.TRAFFIC.value,
                severity=Severity.HIGH,
                zone="Central",
                latitude=26.9184,
                longitude=75.7925,
                description="Severe arterial congestion near MI Road intersection due to disabled heavy carrier.",
                timestamp=now - timedelta(minutes=6),
                status=IncidentStatus.OPEN.value,
                source="TomTom / City Traffic Sensors",
                confidence=0.92,
                affected_area="MI Road, Central Junction (1.2 km radius)",
                source_status=SourceStatus.LIVE,
            ),
            Incident(
                id="INC-2026-002",
                title="Air Quality Deterioration Warning",
                type=IncidentType.ENVIRONMENTAL.value,
                severity=Severity.MEDIUM,
                zone="North",
                latitude=26.9530,
                longitude=75.8200,
                description="Elevated PM2.5 concentration crossing seasonal baseline in North industrial fringe.",
                timestamp=now - timedelta(minutes=14),
                status=IncidentStatus.INVESTIGATING.value,
                source="Open-Meteo Air Quality Feed",
                confidence=0.88,
                affected_area="Vidyadhar Nagar & Amber Peripheral",
                source_status=SourceStatus.LIVE,
            ),
            Incident(
                id="INC-2026-003",
                title="Waterlogging & Drainage Surcharge",
                type=IncidentType.WATER.value,
                severity=Severity.MEDIUM,
                zone="Central",
                latitude=26.9150,
                longitude=75.7980,
                description="Surface runoff accumulation near central sub-surface transit underpass.",
                timestamp=now - timedelta(minutes=22),
                status=IncidentStatus.INVESTIGATING.value,
                source="Municipal Civic Dispatch",
                confidence=0.85,
                affected_area="Government Hostel Underpass",
                source_status=SourceStatus.SIMULATED,
            ),
            Incident(
                id="INC-2026-004",
                title="Substation Feeder Maintenance",
                type=IncidentType.ELECTRICITY.value,
                severity=Severity.LOW,
                zone="East",
                latitude=26.8400,
                longitude=75.8300,
                description="Scheduled feeder stabilization work at Jagatpura power distribution node.",
                timestamp=now - timedelta(hours=1, minutes=10),
                status=IncidentStatus.RESOLVED.value,
                source="Grid Operations Control",
                confidence=0.98,
                affected_area="Jagatpura Sector 7",
                source_status=SourceStatus.SIMULATED,
            ),
            Incident(
                id="INC-2026-005",
                title="Feeder Transit Delay Notification",
                type=IncidentType.TRANSIT.value,
                severity=Severity.LOW,
                zone="South",
                latitude=26.8350,
                longitude=75.8050,
                description="Route R22 running 6 minutes behind scheduled departure window.",
                timestamp=now - timedelta(minutes=35),
                status=IncidentStatus.OPEN.value,
                source="GTFS-RT Telematics",
                confidence=0.94,
                affected_area="Airport Link Corridor",
                source_status=SourceStatus.SIMULATED,
            ),
        ]

    def get_incidents(self, zone: Optional[str] = None, status: Optional[str] = None) -> list[Incident]:
        res = self._incidents
        if zone:
            res = [i for i in res if i.zone.lower() == zone.lower()]
        if status:
            res = [i for i in res if i.status.upper() == status.upper()]
        return res

    def get_incident_by_id(self, incident_id: str) -> Optional[Incident]:
        for inc in self._incidents:
            if inc.id == incident_id:
                return inc
        return None

    def update_incident_status(self, incident_id: str, new_status: str) -> Optional[Incident]:
        for inc in self._incidents:
            if inc.id == incident_id:
                inc.status = new_status
                return inc
        return None

    def create_incident(self, incident: Incident) -> Incident:
        self._incidents.insert(0, incident)
        return incident

    def get_alerts(self) -> list[AlertDetail]:
        alerts = []
        for inc in self._incidents:
            if inc.status != IncidentStatus.RESOLVED.value:
                # Build rich alert details
                alerts.append(AlertDetail(
                    id=f"ALT-{inc.id}",
                    title=inc.title or inc.description,
                    severity=inc.severity,
                    location=f"{inc.zone} Corridor ({inc.latitude:.3f}°N, {inc.longitude:.3f}°E)",
                    zone=inc.zone,
                    timestamp=inc.timestamp,
                    source=inc.source,
                    current_measurement=f"Active Severity: {inc.severity.value.upper()}",
                    previous_measurement="Baseline: Nominal",
                    change="+32% elevated signal impact",
                    possible_causes=[
                        "Peak commuter demand convergence",
                        "Weather or localized road surface event",
                        "Corridor throughput constriction",
                    ],
                    affected_area=inc.affected_area or f"{inc.zone} municipal zone",
                    ai_analysis="Machine intelligence suggests deploying secondary traffic officers to divert northbound vehicles onto bypass feeder.",
                    confidence=inc.confidence,
                    recommended_action="Dispatch field operations to verify clearance and update dynamic traffic signage.",
                    status="ACTIVE" if inc.status == "OPEN" else "INVESTIGATING",
                    acknowledged=False,
                    source_status=inc.source_status,
                ))
        return alerts


incident_service = IncidentService()
