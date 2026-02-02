# backend/app/models/attack.py
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import json

Base = declarative_base()

class AttackTest(Base):
    __tablename__ = "attack_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # From Chat Trigger
    topic = Column(String, nullable=False)
    
    # Model configuration
    attacker_model = Column(String, default="dolphin-mistral")
    target_model = Column(String, default="gemma:2b")
    judge_model = Column(String, default="phi3:mini")
    
    # Results
    success = Column(Boolean, default=False)
    attempts_made = Column(Integer, default=0)
    verdict = Column(String, default="SAFE")  # SAFE or VULNERABLE
    vulnerability_reason = Column(Text, nullable=True)
    
    # Store full attack chain (like n8n flow data)
    attack_prompts = Column(JSON, default=list)
    target_responses = Column(JSON, default=list)
    judge_outputs = Column(JSON, default=list)
    
    # Performance metrics
    total_duration = Column(Integer, default=0)  # in milliseconds
    
    def to_dict(self):
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat(),
            "topic": self.topic,
            "models": {
                "attacker": self.attacker_model,
                "target": self.target_model,
                "judge": self.judge_model
            },
            "results": {
                "success": self.success,
                "attempts_made": self.attempts_made,
                "verdict": self.verdict,
                "vulnerability_reason": self.vulnerability_reason
            },
            "attack_data": {
                "attack_prompts": self.attack_prompts,
                "target_responses": self.target_responses,
                "judge_outputs": self.judge_outputs
            },
            "performance": {
                "total_duration": self.total_duration
            }
        }