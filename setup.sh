#!/bin/bash
# ContextRank — One-command setup
set -e

echo "🇮🇳 ContextRank Setup"
echo "======================"

echo ""
echo "[1/5] Installing Python dependencies..."
pip install -r backend/requirements.txt --quiet || pip install -r backend/requirements.txt --break-system-packages --quiet

echo "[2/5] Generating dataset (500 candidates)..."
python3 scripts/generate_dataset.py

echo "[3/5] Exporting ranked CSV outputs..."
python3 scripts/export_ranked.py

echo "[4/5] Installing frontend dependencies..."
cd frontend && npm install --silent && cd ..

echo "[5/5] Setup complete!"
echo ""
echo "To run the project:"
echo "  Terminal 1: cd backend/api && python3 main.py"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo "API docs:  http://localhost:8000/docs"
