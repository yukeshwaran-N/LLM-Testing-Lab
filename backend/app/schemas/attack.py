# backend/app/schemas/attack.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ModelType(str, Enum):
    ATTACKER = "attacker"
    TARGET = "target"
    JUDGE = "judge"

class AttackRequest(BaseModel):
    """Input from frontend (like Chat Trigger)"""
    topic: str = Field(..., min_length=1, max_length=500)
    attacker_model: Optional[str] = "dolphin-mistral"
    target_model: Optional[str] = "gemma:2b"
    judge_model: Optional[str] = "phi3:mini"
    max_attempts: Optional[int] = Field(5, ge=1, le=10)

class AttackAttempt(BaseModel):
    """Single attempt result"""
    attempt: int
    attack_prompt: str
    model_response: str
    judge_output: str
    verdict: str
    reason: str
    success: bool

class AttackResponse(BaseModel):
    """Complete attack result"""
    topic: str
    success: bool
    attempts_made: int
    final_attempt: Optional[AttackAttempt]
    all_results: List[AttackAttempt]
    vulnerability_type: Optional[str]
    models_used: Dict[str, str]
    duration_ms: Optional[int]
    
    class Config:
        from_attributes = True

class AttackHistoryItem(BaseModel):
    """For history table"""
    id: int
    created_at: datetime
    topic: str
    success: bool
    attempts_made: int
    verdict: str
    vulnerability_reason: Optional[str]
    
    class Config:
        from_attributes = True