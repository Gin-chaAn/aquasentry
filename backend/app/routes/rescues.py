import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel

from app.models.rescue_request import RescueRequest, RescueCreate

router = APIRouter(prefix="/rescues", tags=["Rescues"])

# In-memory store for rescue requests
_RESCUE_STORE: List[RescueRequest] = []

DEPTH_WEIGHTS = {
    "above_head": 50.0,
    "chest_deep": 40.0,
    "waist_deep": 25.0,
    "knee_deep": 15.0,
    "ankle_deep": 5.0,
}

def calculate_priority(depth_level: str, vulnerable: bool, people_count: int) -> float:
    """
    Priority score between 0.0 and 100.0:
    - Water depth: up to 50 pts
    - Vulnerability (elderly, infants, medical): 30 pts
    - People count: up to 20 pts (5 pts per person, capped at 20)
    """
    depth_pts = DEPTH_WEIGHTS.get(str(depth_level).lower(), 15.0)
    vuln_pts = 30.0 if vulnerable else 0.0
    people_pts = min(20.0, float(people_count) * 5.0)
    return round(depth_pts + vuln_pts + people_pts, 1)

class StatusUpdate(BaseModel):
    status: str

@router.post("", response_model=RescueRequest, status_code=201)
async def create_rescue_request(rescue_in: RescueCreate) -> RescueRequest:
    """
    Submit an emergency citizen rescue request.
    Calculates priority score based on water depth, vulnerability, and people count.
    """
    if rescue_in.lat is None or rescue_in.lon is None:
        raise HTTPException(status_code=400, detail="Latitude and Longitude are required")

    score = calculate_priority(
        rescue_in.water_depth_level,
        rescue_in.vulnerable_people,
        rescue_in.people_count
    )

    rescue_obj = RescueRequest(
        id=f"res-{uuid.uuid4().hex[:8]}",
        citizen_name=rescue_in.citizen_name,
        contact=rescue_in.contact,
        lat=rescue_in.lat,
        lon=rescue_in.lon,
        people_count=rescue_in.people_count,
        vulnerable_people=rescue_in.vulnerable_people,
        water_depth_level=rescue_in.water_depth_level,
        priority_score=score,
        status="pending",
        notes=rescue_in.notes or "",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )

    _RESCUE_STORE.append(rescue_obj)
    return rescue_obj

@router.get("", response_model=List[RescueRequest])
async def list_rescues(status: Optional[str] = Query(None, description="Filter by status: pending, assigned, rescued")) -> List[RescueRequest]:
    """
    Lists rescue requests, strictly sorted in descending order of calculated priority score.
    """
    filtered = _RESCUE_STORE
    if status:
        filtered = [r for r in filtered if r.status.lower() == status.lower()]

    # Sort descending by priority_score
    return sorted(filtered, key=lambda x: x.priority_score, reverse=True)

@router.patch("/{rescue_id}/status", response_model=RescueRequest)
async def update_rescue_status(rescue_id: str, update: StatusUpdate) -> RescueRequest:
    """
    Updates the operational status of a rescue (e.g. pending -> assigned -> rescued).
    """
    valid_statuses = ["pending", "assigned", "rescued"]
    new_status = update.status.lower()
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    for r in _RESCUE_STORE:
        if r.id == rescue_id:
            r.status = new_status
            return r

    raise HTTPException(status_code=404, detail=f"Rescue request {rescue_id} not found")
