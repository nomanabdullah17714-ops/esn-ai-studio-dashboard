from fastapi import APIRouter
from app.models import OrchestrationRequest
from app.services.orchestrator import orchestrate

router = APIRouter()

@router.post('/orchestrate')
async def run_orchestration(request: OrchestrationRequest):
    return await orchestrate(request.goal, request.context)
