from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.heatmap import router as heatmap_router
from app.routes.reports import router as reports_router
from app.routes.rescues import router as rescues_router
from app.routes.routing import router as routing_router

app = FastAPI(
    title="AquaSentry API",
    description="Real-time flood risk scoring, citizen rescue coordination, and responder routing platform for Chennai",
    version="1.0.0"
)

# CORS configuration - allow all origins for hackathon development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(heatmap_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(rescues_router, prefix="/api")
app.include_router(routing_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "app": "AquaSentry API",
        "status": "online",
        "city": "Chennai",
        "version": "1.0.0",
        "endpoints": [
            "/api/heatmap",
            "/api/reports",
            "/api/rescues",
            "/api/routes"
        ]
    }

@app.get("/api/health")
async def health():
    return {"status": "healthy"}
