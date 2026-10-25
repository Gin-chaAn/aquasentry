import json
import os
from pathlib import Path
import logging
from typing import Dict, Any, List, Tuple
from shapely.geometry import shape, Point

logger = logging.getLogger(__name__)

CATEGORY_WEIGHTS = {
    "high": 0.9,
    "severe": 1.0,
    "moderate": 0.5,
    "medium": 0.5,
    "low": 0.2,
}

class HazardZoneService:
    def __init__(self, geojson_path: str):
        self.geojson_path = geojson_path
        self.polygons: List[Tuple[Any, str, Dict[str, Any]]] = []
        self._load_geojson()

    def _load_geojson(self):
        resolved_path = None
        candidates = [
            self.geojson_path,
            Path(self.geojson_path).resolve() if self.geojson_path else None,
            Path(__file__).resolve().parents[1] / "data" / "chennai_hazard_zones.geojson",
            Path(__file__).resolve().parents[2] / "data" / "chennai_hazard_zones.geojson",
            Path(__file__).resolve().parents[3] / "data" / "chennai_hazard_zones.geojson",
            Path.cwd() / "data" / "chennai_hazard_zones.geojson",
            Path.cwd() / "backend" / "data" / "chennai_hazard_zones.geojson",
            Path.cwd().parent / "data" / "chennai_hazard_zones.geojson",
        ]

        for p in candidates:
            if p and os.path.exists(str(p)):
                resolved_path = str(p)
                break

        if not resolved_path:
            logger.warning(f"Hazard GeoJSON not found at: {self.geojson_path}")
            return

        try:
            with open(resolved_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            features = data.get("features", [])
            for feat in features:
                geometry = feat.get("geometry")
                props = feat.get("properties", {})
                if geometry:
                    geom_shape = shape(geometry)
                    raw_cat = (
                        props.get("risk_category")
                        or props.get("risk_level")
                        or props.get("hazard_level")
                        or props.get("Zone")
                        or props.get("severity")
                        or "Low"
                    )
                    category = str(raw_cat).strip().lower()
                    self.polygons.append((geom_shape, category, props))
            logger.info(f"Loaded {len(self.polygons)} hazard zone polygons from {resolved_path}")
        except Exception as e:
            logger.error(f"Failed to load hazard GeoJSON: {e}")

    def get_baseline_risk(self, lat: float, lon: float) -> Tuple[float, str, Dict[str, Any]]:
        """
        Tests point-in-polygon using GeoJSON [lon, lat] coordinate ordering.
        Returns: (baseline_risk_score, matched_category_name, properties)
        """
        pt = Point(lon, lat)
        max_score = 0.0
        best_category = "None"
        best_props = {}

        for poly, cat, props in self.polygons:
            if poly.contains(pt) or poly.intersects(pt):
                score = CATEGORY_WEIGHTS.get(cat, 0.2)
                if score > max_score:
                    max_score = score
                    best_category = props.get("risk_category", cat.capitalize())
                    best_props = props

        return max_score, best_category, best_props
