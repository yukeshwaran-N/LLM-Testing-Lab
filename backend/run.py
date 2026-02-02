# backend/run.py
import uvicorn

if __name__ == "__main__":
    print("🚀 Starting LLM Testing Lab Backend...")
    print("📡 API available at: http://localhost:8000")
    print("📚 Documentation at: http://localhost:8000/docs")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )