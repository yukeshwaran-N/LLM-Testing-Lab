# backend/app/api/cancel.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import asyncio
from typing import Dict, Set

router = APIRouter()

# Store ongoing test tasks
ongoing_tests: Dict[str, asyncio.Task] = {}
test_tasks: Dict[str, asyncio.Task] = {}

class CancelRequest(BaseModel):
    test_id: str

@router.post("/api/n8n/cancel")
async def cancel_test(request: CancelRequest):
    """
    Cancel an ongoing test by its ID
    """
    test_id = request.test_id
    
    if test_id in test_tasks:
        task = test_tasks[test_id]
        
        # Cancel the task
        task.cancel()
        
        try:
            await task
        except asyncio.CancelledError:
            print(f"Test {test_id} cancelled successfully")
        
        # Cleanup
        del test_tasks[test_id]
        if test_id in ongoing_tests:
            del ongoing_tests[test_id]
        
        return {"success": True, "message": f"Test {test_id} cancelled"}
    else:
        return {"success": False, "message": f"No test found with ID {test_id}"}

def register_test_task(test_id: str, task: asyncio.Task):
    """
    Register a test task so it can be cancelled later
    """
    test_tasks[test_id] = task

def unregister_test_task(test_id: str):
    """
    Remove test task from tracking
    """
    if test_id in test_tasks:
        del test_tasks[test_id]