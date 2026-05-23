@echo off
echo ========================================
echo   TaskFlow - Installing Dependencies
echo ========================================
echo.

cd backend
echo Installing backend dependencies...
call npm install

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Configure backend/.env file
echo 3. Run START_BACKEND.bat
echo.

pause
