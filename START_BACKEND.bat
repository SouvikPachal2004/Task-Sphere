@echo off
echo ========================================
echo   TaskFlow Backend Server Starter
echo ========================================
echo.

cd backend

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting backend server...
echo.
call npm start

pause
