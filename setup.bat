@echo off
echo ContextRank Setup
echo ======================

echo.
echo [1/5] Installing Python dependencies...
pip install -r backend\requirements.txt

echo [2/5] Generating dataset (500 candidates)...
python scripts\generate_dataset.py

echo [3/5] Exporting ranked CSV outputs...
python scripts\export_ranked.py

echo [4/5] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo [5/5] Setup complete!
echo.
echo To run the project:
echo   Terminal 1: cd backend\api ^&^& python main.py
echo   Terminal 2: cd frontend ^&^& npm run dev
echo.
echo Then open: http://localhost:5173
echo API docs:  http://localhost:8000/docs
pause
