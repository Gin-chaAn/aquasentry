from pydantic import BaseModel
from typing import Dict, Any, Optional

class GridCell(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    risk_score: float
    risk_level: str
    breakdown: Dict[str, Any]
