@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

echo ==========================================
echo Obsidian RAG Start
echo ==========================================

rem Prefer project\venv first (requested), then fallback to project\.venv.
set "PYTHON_EXE=%~dp0..\venv\Scripts\python.exe"
if not exist "%PYTHON_EXE%" (
    set "PYTHON_EXE=%~dp0.venv\Scripts\python.exe"
)
if not exist "%PYTHON_EXE%" (
    set "PYTHON_EXE=%~dp0..\.venv\Scripts\python.exe"
)
if not exist "%PYTHON_EXE%" (
    set "PYTHON_EXE=C:\Users\bhs33\Desktop\project\venv\Scripts\python.exe"
)
if not exist "%PYTHON_EXE%" (
    set "PYTHON_EXE=C:\Users\bhs33\Desktop\project\.venv\Scripts\python.exe"
)
if not exist "%PYTHON_EXE%" (
    echo [ERROR] Python venv not found.
    echo         checked:
    echo         - %~dp0..\venv\Scripts\python.exe
    echo         - %~dp0.venv\Scripts\python.exe
    echo         - %~dp0..\.venv\Scripts\python.exe
    echo         - C:\Users\bhs33\Desktop\project\venv\Scripts\python.exe
    echo         - C:\Users\bhs33\Desktop\project\.venv\Scripts\python.exe
    pause
    exit /b 1
)

for /f "tokens=2 delims= " %%V in ('"%PYTHON_EXE%" -V 2^>^&1') do set "PY_VER=%%V"
for /f "tokens=1,2 delims=." %%A in ("%PY_VER%") do set "PY_MM=%%A.%%B"
if not "%PY_MM%"=="3.12" (
    echo [ERROR] This project must run on Python 3.12 venv.
    echo         selected: %PYTHON_EXE%
    echo         detected: %PY_MM%
    pause
    exit /b 1
)
echo [INFO] Python: %PYTHON_EXE% ^(v%PY_MM%^)
set "PYTHONIOENCODING=utf-8"

set "BACKEND_PORT=8010"
set "FRONTEND_PORT=8502"
set "BACKEND_URL=http://127.0.0.1:%BACKEND_PORT%"
set "ENV_FILE=%~dp0.env"

echo [1/2] Backend: %BACKEND_URL%
start "RAG Backend" /D "%~dp0" "%PYTHON_EXE%" "%~dp0backend\main.py"

echo [INFO] Sync .env BACKEND_URL/BACKEND_PORT
powershell -NoProfile -Command ^
  "$f='%ENV_FILE%';" ^
  "$lines=@(); if (Test-Path $f) { $lines=Get-Content $f };" ^
  "$lines=$lines | Where-Object { $_ -notmatch '^(BACKEND_URL|BACKEND_PORT)=' };" ^
  "$lines += 'BACKEND_URL=%BACKEND_URL%';" ^
  "$lines += 'BACKEND_PORT=%BACKEND_PORT%';" ^
  "Set-Content -Path $f -Value $lines -Encoding UTF8"

timeout /t 2 >nul

echo [2/2] Frontend: frontend/app.py
start "RAG Frontend" /D "%~dp0" "%PYTHON_EXE%" -m streamlit run "%~dp0frontend\app.py" --server.port %FRONTEND_PORT%

echo ==========================================
echo Launched. Open frontend and test.
echo ==========================================
timeout /t 2 >nul
exit /b 0
