from fastapi import APIRouter
from app.api.v1.endpoints import auth, detection, alerts, persons

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(detection.router, prefix="/detection", tags=["YOLO Detection & History"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Security Alerts"])
api_router.include_router(persons.router, prefix="/persons", tags=["Person Database & Identities"])
