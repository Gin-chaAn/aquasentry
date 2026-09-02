from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReportCreate(BaseModel):
    lat: float = Field(..., description="Latitude")
    lon: float = Field(..., description="Longitude")
    water_level_cm: float = Field(..., description="Estimated water depth in centimeters")
    description: Optional[str] = Field(default="", description="Description of the situation")
    severity: Optional[str] = Field(default=None, description="low, medium, high (auto-derived if omitted)")

class Report(BaseModel):
    id: str
    lat: float
    lon: float
    water_level_cm: float
    description: str
    severity: str
    timestamp: str
