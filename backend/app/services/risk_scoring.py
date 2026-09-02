from typing import Dict, Any

def calculate_composite_risk(
    hazard_baseline: float,
    rainfall_mm: float,
    river_discharge: float,
    report_density: float,
) -> Dict[str, Any]:
    """
    Combines:
    - Hazard baseline: 35% (0.35)
    - Rainfall: 25% (0.25) [normalized against 30 mm/h]
    - River discharge: 20% (0.20) [normalized against 15 m^3/s]
    - Report density: 20% (0.20) [normalized 0.0 - 1.0]
    """
    norm_hazard = max(0.0, min(1.0, float(hazard_baseline)))
    norm_rain = max(0.0, min(1.0, float(rainfall_mm) / 30.0))
    norm_discharge = max(0.0, min(1.0, float(river_discharge) / 15.0))
    norm_reports = max(0.0, min(1.0, float(report_density)))

    w_hazard = 0.35
    w_rain = 0.25
    w_discharge = 0.20
    w_reports = 0.20

    score = (
        (norm_hazard * w_hazard)
        + (norm_rain * w_rain)
        + (norm_discharge * w_discharge)
        + (norm_reports * w_reports)
    )
    score = round(max(0.0, min(1.0, score)), 3)

    if score >= 0.75:
        level = "Severe"
    elif score >= 0.50:
        level = "High"
    elif score >= 0.30:
        level = "Moderate"
    else:
        level = "Low"

    return {
        "risk_score": score,
        "risk_level": level,
        "breakdown": {
            "hazard_baseline": round(norm_hazard, 3),
            "rainfall_mm": round(rainfall_mm, 2),
            "rainfall_normalized": round(norm_rain, 3),
            "river_discharge_m3s": round(river_discharge, 2),
            "river_discharge_normalized": round(norm_discharge, 3),
            "report_density_normalized": round(norm_reports, 3),
            "weights": {
                "hazard": w_hazard,
                "rainfall": w_rain,
                "river_discharge": w_discharge,
                "report_density": w_reports,
            },
        },
    }
