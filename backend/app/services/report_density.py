import math
from typing import List, Dict, Any, Tuple
from datetime import datetime, timezone

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class ReportDensityService:
    def __init__(self):
        self._reports: List[Dict[str, Any]] = []

    def add_report(self, report: Dict[str, Any]):
        self._reports.append(report)

    def get_all_reports(self) -> List[Dict[str, Any]]:
        return list(reversed(self._reports))

    def get_density_score(self, lat: float, lon: float, radius_km: float = 1.0) -> Tuple[float, int]:
        """
        Computes normalized density score (0.0 - 1.0) and report count within radius_km.
        Severity weights:
        - high / water >= 60cm: 1.0
        - medium / water 30-59cm: 0.6
        - low / water < 30cm: 0.3
        """
        nearby_reports = 0
        weighted_sum = 0.0

        for rep in self._reports:
            r_lat = rep.get("lat")
            r_lon = rep.get("lon")
            if r_lat is None or r_lon is None:
                continue
            dist = haversine_km(lat, lon, float(r_lat), float(r_lon))
            if dist <= radius_km:
                nearby_reports += 1
                severity = str(rep.get("severity", "")).lower()
                water_cm = float(rep.get("water_level_cm", 0.0))

                if severity == "high" or water_cm >= 60:
                    weight = 1.0
                elif severity == "medium" or water_cm >= 30:
                    weight = 0.6
                else:
                    weight = 0.3

                decay = 1.0 - 0.5 * (dist / radius_km)
                weighted_sum += weight * decay

        normalized_density = min(1.0, weighted_sum / 5.0)
        return round(normalized_density, 3), nearby_reports

# Singleton instance used across routes
shared_report_density_service = ReportDensityService()
