# backend/setup.sh
#!/bin/bash

echo "Setting up LLM Testing Lab Backend..."

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Backend setup complete!"
echo "To start the backend:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Run: python run.py"
echo "3. Make sure Ollama is running: ollama serve"