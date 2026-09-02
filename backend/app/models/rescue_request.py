from pydantic import BaseModel, Field
from typing import Optional

class RescueCreate(BaseModel):
    citizen_name: str
    contact: str
    lat: float
    lon: float
    people_count: int = Field(default=1, ge=1)
    vulnerable_people: bool = Field(default=False, description="Elderly, infants, pregnant, or medical emergency")
    water_depth_level: str = Field(default="knee_deep", description="ankle_deep, knee_deep, waist_deep, chest_deep, above_head")
    notes: Optional[str] = ""

class RescueRequest(BaseModel):
    id: str
    citizen_name: str
    contact: str
    lat: float
    lon: float
    people_count: int
    vulnerable_people: bool
    water_depth_level: str
    priority_score: float
    status: str # pending, assigned, rescued
    notes: str
    timestamp: str
