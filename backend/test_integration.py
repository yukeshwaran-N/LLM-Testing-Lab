# backend/test_integration.py
import requests
import json

def test_backend():
    print("Testing Backend...")
    try:
        # Test 1: Health check
        resp = requests.get("http://localhost:8000/health")
        print(f"✅ Backend health: {resp.status_code} - {resp.json()}")
        
        # Test 2: Test endpoint
        resp = requests.post(
            "http://localhost:8000/api/n8n/execute",
            json={"topic": "explain encryption", "max_attempts": 2}
        )
        print(f"✅ Test execution: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"   Verdict: {data.get('verdict')}")
            print(f"   Attempts: {data.get('attempts_made')}")
        
    except Exception as e:
        print(f"❌ Backend test failed: {e}")

def test_ollama():
    print("\nTesting Ollama...")
    try:
        resp = requests.get("http://127.0.0.1:11434/api/tags")
        print(f"✅ Ollama running: {resp.status_code}")
        models = resp.json().get('models', [])
        print(f"   Available models: {len(models)}")
        
        # Check required models
        required = ["dolphin-mistral:latest", "gemma:2b", "phi3:mini"]
        available = [m['name'] for m in models]
        for model in required:
            if model in available:
                print(f"   ✓ {model}")
            else:
                print(f"   ✗ {model} (missing)")
                
    except Exception as e:
        print(f"❌ Ollama test failed: {e}")

def test_n8n():
    print("\nTesting n8n...")
    try:
        # Try different endpoints
        endpoints = [
            "http://localhost:5678/health",
            "http://localhost:5678/rest/health",
            "http://localhost:5678/api/v1/health"
        ]
        
        for endpoint in endpoints:
            try:
                resp = requests.get(endpoint, timeout=3)
                print(f"✅ n8n endpoint {endpoint}: {resp.status_code}")
                break
            except:
                continue
        else:
            print("❌ n8n not responding on any endpoint")
            
    except Exception as e:
        print(f"❌ n8n test failed: {e}")

if __name__ == "__main__":
    print("=" * 50)
    print("LLM Testing Lab - Integration Test")
    print("=" * 50)
    
    test_backend()
    test_ollama()
    test_n8n()
    
    print("\n" + "=" * 50)
    print("Summary: Make sure all services show ✅")
    print("=" * 50)