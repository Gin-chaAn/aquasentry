import asyncio
import logging
from datetime import datetime, timezone
from app.routes.heatmap import get_heatmap

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("RefreshRiskJob")

async def run_refresh():
    """
    Periodic background job to refresh risk scores across Chennai grid cells.
    Pre-warms in-memory cache and logs high-risk anomalies.
    """
    logger.info("Starting background risk score recalculation...")
    cells = await get_heatmap()
    
    severe_count = 0
    high_count = 0
    for cell in cells:
        if cell.risk_level == "Severe":
            severe_count += 1
            logger.warning(f"SEVERE RISK ALERT: {cell.name} ({cell.risk_score * 100:.1f}%)")
        elif cell.risk_level == "High":
            high_count += 1

    logger.info(
        f"Recalculation complete. Processed {len(cells)} cells. "
        f"Status: {severe_count} Severe, {high_count} High, "
        f"{len(cells) - severe_count - high_count} Normal/Moderate."
    )
    return cells

if __name__ == "__main__":
    asyncio.run(run_refresh())
