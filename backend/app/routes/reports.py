import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from typing import List

from app.models.report import Report, ReportCreate
from app.services.report_density import shared_report_density_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("", response_model=Report, status_code=201)
async def create_report(report_in: ReportCreate) -> Report:
    """
    Submit a citizen flood report.
    Automatically assigns severity based on water depth if not provided:
    - >= 60 cm: high
    - >= 30 cm: medium
    - < 30 cm: low
    Immediately feeds into the live risk scoring density engine.
    """
    if report_in.lat is None or report_in.lon is None:
        raise HTTPException(status_code=400, detail="Latitude and Longitude are required")

    # Determine severity
    if report_in.severity:
        severity = report_in.severity.lower()
    else:
        if report_in.water_level_cm >= 60:
            severity = "high"
        elif report_in.water_level_cm >= 30:
            severity = "medium"
        else:
            severity = "low"

    report_obj = Report(
        id=f"rep-{uuid.uuid4().hex[:8]}",
        lat=report_in.lat,
        lon=report_in.lon,
        water_level_cm=report_in.water_level_cm,
        description=report_in.description or "",
        severity=severity,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )

    shared_report_density_service.add_report(report_obj.model_dump())
    return report_obj

@router.get("", response_model=List[Report])
async def list_reports() -> List[Report]:
    """
    Lists all crowdsourced citizen flood reports, sorted with most recent first.
    """
    raw_reports = shared_report_density_service.get_all_reports()
    return [Report(**r) for r in raw_reports]
