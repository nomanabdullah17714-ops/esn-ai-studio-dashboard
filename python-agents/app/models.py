from pydantic import BaseModel, Field
from typing import Any

class OrchestrationRequest(BaseModel):
    goal: str = Field(..., min_length=3)
    context: dict[str, Any] = Field(default_factory=dict)

class AgentResult(BaseModel):
    agent: str
    focus: str
    recommendation: str
    confidence: float
