from fastapi import FastAPI
from app.routers.orchestrate import router as orchestrate_router

app = FastAPI(title='ESN AI Studio Python Agent Mesh', version='1.0.0')

@app.get('/health')
async def health():
    return {'status': 'ok', 'service': 'esn-python-agents'}

app.include_router(orchestrate_router)
