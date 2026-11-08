"""
Router de la API para el Asistente Inteligente.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import AgentCommandRequest
from app.services.agent_service import agent_service

router = APIRouter(prefix="/api/agent", tags=["Agent"])

@router.post("/chat")
def chat_with_agent(payload: AgentCommandRequest, db: Session = Depends(get_db)):
    """Envía un comando o mensaje en lenguaje natural al agente."""
    result = agent_service.process_command(payload.query, db)
    return result
