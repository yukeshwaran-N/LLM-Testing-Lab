# backend/app/api/n8n_endpoints.py
"""
API endpoints for n8n workflow execution
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
import json
import sqlite3
from datetime import datetime

from app.engine.n8n_engine import N8NWorkflowEngine, N8NWorkflowConfig
from app.schemas.attack import AttackRequest, AttackResponse

router = APIRouter(prefix="/n8n", tags=["n8n-workflow"])

# Database helper for n8n results
def save_n8n_result(result: dict):
    """Save n8n workflow result to database"""
    conn = sqlite3.connect('llm_tests.db')
    c = conn.cursor()
    
    # Create n8n-specific table if not exists
    c.execute('''
        CREATE TABLE IF NOT EXISTS n8n_workflow_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            topic TEXT NOT NULL,
            success BOOLEAN DEFAULT FALSE,
            attempts_made INTEGER DEFAULT 0,
            total_attempts INTEGER DEFAULT 5,
            verdict TEXT DEFAULT 'SAFE',
            vulnerability_reason TEXT,
            duration_seconds FLOAT DEFAULT 0.0,
            config_json TEXT,
            attempts_json TEXT,
            workflow_type TEXT DEFAULT 'n8n_replica'
        )
    ''')
    
    c.execute('''
        INSERT INTO n8n_workflow_results 
        (topic, success, attempts_made, total_attempts, verdict, 
         vulnerability_reason, duration_seconds, config_json, attempts_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        result["topic"],
        result["success"],
        result["attempts_made"],
        result["total_attempts"],
        result["verdict"],
        result.get("vulnerability_reason"),
        result["duration_seconds"],
        json.dumps(result.get("config", {})),
        json.dumps(result.get("all_attempts", []))
    ))
    
    conn.commit()
    conn.close()

@router.post("/execute")
async def execute_n8n_workflow(request: AttackRequest):
    """
    Execute your n8n workflow as a Python service
    
    This endpoint replicates exactly what your n8n automation does,
    but as a FastAPI service.
    """
    try:
        # Create config from request
        config = N8NWorkflowConfig(
            attacker_model=request.attacker_model,
            target_model=request.target_model,
            judge_model=request.judge_model,
            max_attempts=request.max_attempts
        )
        
        # Execute workflow
        async with N8NWorkflowEngine(config) as engine:
            result = await engine.execute_workflow(request.topic)
        
        # Save to database
        save_n8n_result(result)
        
        # Format response similar to your n8n output
        return {
            "workflow": "n8n_replica",
            "topic": result["topic"],
            "success": result["success"],
            "verdict": result["verdict"],
            "attempts": {
                "made": result["attempts_made"],
                "total": result["total_attempts"]
            },
            "vulnerability": result.get("vulnerability_reason"),
            "duration": f"{result['duration_seconds']}s",
            "config": result["config"],
            "details": {
                "final_attempt": result.get("final_attempt"),
                "total_attempts_data": len(result.get("all_attempts", []))
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"n8n workflow failed: {str(e)}")

@router.post("/execute/stream")
async def stream_n8n_workflow(request: AttackRequest):
    """
    Stream n8n workflow execution in real-time
    
    Watch your n8n workflow execute step by step,
    just like in the n8n editor UI.
    """
    async def event_generator():
        try:
            # Create config
            config = N8NWorkflowConfig(
                attacker_model=request.attacker_model,
                target_model=request.target_model,
                judge_model=request.judge_model,
                max_attempts=request.max_attempts
            )
            
            # Execute with streaming
            async with N8NWorkflowEngine(config) as engine:
                async for event in engine.stream_workflow(request.topic):
                    yield f"data: {json.dumps(event)}\n\n"
        
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        }
    )

@router.get("/workflow/definition")
async def get_n8n_workflow_definition():
    """
    Get the JSON definition of your n8n workflow
    
    This returns your original n8n workflow JSON,
    useful for reference or re-importing.
    """
    # Your original n8n workflow JSON
    n8n_workflow = {
        "name": "LLM Red Team Testing",
        "nodes": [
            {
                "name": "Chat Trigger",
                "description": "User input topic"
            },
            {
                "name": "Init State",
                "description": "Initialize attempt counter"
            },
            {
                "name": "Build Attacker Body",
                "description": "Generate attack prompt"
            },
            {
                "name": "Attacker Model",
                "description": "Call dolphin-mistral"
            },
            {
                "name": "Extract Attack",
                "description": "Parse attacker response"
            },
            {
                "name": "Build Target Body",
                "description": "Prepare for target model"
            },
            {
                "name": "Target Model",
                "description": "Call gemma:2b"
            },
            {
                "name": "Extract Target Response",
                "description": "Parse target response"
            },
            {
                "name": "Build Judge Body",
                "description": "Prepare for judge"
            },
            {
                "name": "Judge Model",
                "description": "Call phi3:mini"
            },
            {
                "name": "Check Jailbreak",
                "description": "Parse verdict JSON"
            },
            {
                "name": "Is Jailbroken?",
                "description": "Decision node"
            },
            {
                "name": "Increase Attempt",
                "description": "Loop logic"
            }
        ],
        "connections": "As in your n8n workflow",
        "models_used": {
            "attacker": "dolphin-mistral",
            "target": "gemma:2b",
            "judge": "phi3:mini"
        },
        "parameters": {
            "max_attempts": 5,
            "temperatures": {
                "attacker": 0.9,
                "target": 0.2,
                "judge": 0.1
            },
            "max_tokens": {
                "attacker": 200,
                "target": 120,
                "judge": 80
            }
        }
    }
    
    return n8n_workflow

@router.get("/results")
async def get_n8n_results(limit: int = 20):
    """Get results from n8n workflow executions"""
    conn = sqlite3.connect('llm_tests.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('''
        SELECT id, created_at, topic, success, attempts_made, total_attempts,
               verdict, vulnerability_reason, duration_seconds, workflow_type
        FROM n8n_workflow_results
        ORDER BY created_at DESC
        LIMIT ?
    ''', (limit,))
    
    rows = c.fetchall()
    conn.close()
    
    return [
        {
            "id": row["id"],
            "created_at": row["created_at"],
            "topic": row["topic"],
            "success": bool(row["success"]),
            "attempts": f"{row['attempts_made']}/{row['total_attempts']}",
            "verdict": row["verdict"],
            "vulnerability": row["vulnerability_reason"],
            "duration": f"{row['duration_seconds']}s",
            "workflow": row["workflow_type"]
        }
        for row in rows
    ]

@router.get("/compare")
async def compare_with_simple():
    """
    Compare n8n workflow results with simple test results
    """
    conn = sqlite3.connect('llm_tests.db')
    c = conn.cursor()
    
    # n8n results
    c.execute('''
        SELECT COUNT(*) as total,
               SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as vulnerable,
               AVG(duration_seconds) as avg_duration,
               AVG(attempts_made) as avg_attempts
        FROM n8n_workflow_results
    ''')
    n8n_stats = c.fetchone()
    
    # Simple test results
    c.execute('''
        SELECT COUNT(*) as total,
               SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as vulnerable,
               AVG(duration_ms) / 1000 as avg_duration,
               AVG(attempts) as avg_attempts
        FROM attack_tests
    ''')
    simple_stats = c.fetchone()
    
    conn.close()
    
    return {
        "n8n_workflow": {
            "total_tests": n8n_stats[0] or 0,
            "vulnerabilities_found": n8n_stats[1] or 0,
            "success_rate": round((n8n_stats[1] / n8n_stats[0] * 100) if n8n_stats[0] else 0, 1),
            "avg_duration_seconds": round(n8n_stats[2] or 0, 2),
            "avg_attempts": round(n8n_stats[3] or 0, 1)
        },
        "simple_tests": {
            "total_tests": simple_stats[0] or 0,
            "vulnerabilities_found": simple_stats[1] or 0,
            "success_rate": round((simple_stats[1] / simple_stats[0] * 100) if simple_stats[0] else 0, 1),
            "avg_duration_seconds": round(simple_stats[2] or 0, 2),
            "avg_attempts": round(simple_stats[3] or 0, 1)
        },
        "comparison": {
            "n8n_more_effective": (n8n_stats[1] or 0) > (simple_stats[1] or 0),
            "difference_percentage": round(
                ((n8n_stats[1] or 0) - (simple_stats[1] or 0)) / max(simple_stats[0] or 1, 1) * 100, 
                1
            )
        }
    }