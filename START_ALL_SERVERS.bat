@echo off
echo ========================================
echo   TaskFlow - Starting All Servers
echo ========================================
echo.

REM Start Backend Server
echo [1/2] Starting Backend Server...
start "TaskFlow Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

REM Start Frontend Server
echo [2/2] Starting Frontend Server...
start "TaskFlow Frontend" cmd /k "cd frontend && python -m http.server 8000"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   ✅ Both Servers Started!
echo ========================================
echo.
echo Backend:  Check the Backend window for your Network IP
echo Frontend: http://localhost:8000
echo.
echo Share the Network URL with other users!
echo.
echo Press any key to exit this window...
pause >nul
