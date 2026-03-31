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

set "BACKEND_PORT=8011"
set "FRONTEND_PORT=8502"
set "BACKEND_URL=http://127.0.0.1:%BACKEND_PORT%"
set "ENV_FILE=%~dp0.env"
set "BACKEND_TIMEOUT_SEC=90"

echo [INFO] Sync .env BACKEND_URL/BACKEND_PORT
powershell -NoProfile -Command ^
  "$f='%ENV_FILE%';" ^
  "$lines=@(); if (Test-Path $f) { $lines=Get-Content $f };" ^
  "$lines=$lines | Where-Object { $_ -notmatch '^(BACKEND_URL|BACKEND_PORT)=' };" ^
  "$lines += 'BACKEND_URL=%BACKEND_URL%';" ^
  "$lines += 'BACKEND_PORT=%BACKEND_PORT%';" ^
  "Set-Content -Path $f -Value $lines -Encoding UTF8"

echo [1/2] Backend: %BACKEND_URL%
powershell -NoProfile -Command ^
  "$backendUrl='%BACKEND_URL%';" ^
  "$backendScript='%~dp0backend\main.py';" ^
  "$pythonExe='%PYTHON_EXE%';" ^
  "$workdir='%~dp0';" ^
  "$timeoutSec=%BACKEND_TIMEOUT_SEC%;" ^
  "$healthy=$false;" ^
  "try { $resp = Invoke-WebRequest -UseBasicParsing -Uri ($backendUrl + '/health') -TimeoutSec 3; if ($resp.StatusCode -eq 200) { $healthy=$true } } catch {}" ^
  "if ($healthy) { Write-Host '[INFO] Backend already healthy. Reusing existing process.'; exit 0 }" ^
  "$stale = Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'python.exe' -and $_.CommandLine -match [regex]::Escape($backendScript) };" ^
  "foreach ($proc in $stale) { Write-Host ('[INFO] Stopping stale backend PID ' + $proc.ProcessId); Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue }" ^
  "Start-Process -FilePath $pythonExe -ArgumentList $backendScript -WorkingDirectory $workdir;" ^
  "$deadline = (Get-Date).AddSeconds($timeoutSec);" ^
  "while ((Get-Date) -lt $deadline) {" ^
  "  try { $resp = Invoke-WebRequest -UseBasicParsing -Uri ($backendUrl + '/health') -TimeoutSec 3; if ($resp.StatusCode -eq 200) { Write-Host '[INFO] Backend ready.'; exit 0 } } catch {}" ^
  "  Start-Sleep -Seconds 2" ^
  "}" ^
  "Write-Host '[ERROR] Backend did not become ready within timeout.';" ^
  "exit 1"
if errorlevel 1 (
  echo [ERROR] Backend startup failed.
  pause
  exit /b 1
)

echo [2/2] Frontend: frontend/app.py
powershell -NoProfile -Command ^
  "$frontendUrl='http://127.0.0.1:%FRONTEND_PORT%/_stcore/health';" ^
  "$running=$false;" ^
  "try { $resp = Invoke-WebRequest -UseBasicParsing -Uri $frontendUrl -TimeoutSec 3; if ($resp.StatusCode -eq 200) { $running=$true } } catch {}" ^
  "if ($running) { Write-Host '[INFO] Frontend already healthy. Reusing existing process.'; exit 0 }" ^
  "exit 1"
if errorlevel 1 start "RAG Frontend" /D "%~dp0" "%PYTHON_EXE%" -m streamlit run "%~dp0frontend\app.py" --server.port %FRONTEND_PORT%

echo ==========================================
echo Launched. Open frontend and test.
echo ==========================================
powershell -NoProfile -Command "Start-Sleep -Seconds 2" >nul
exit /b 0
