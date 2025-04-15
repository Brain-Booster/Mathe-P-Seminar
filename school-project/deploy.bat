@echo off
echo === Building Effner Mathe P-Seminar Website ===
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
echo.

REM Build the project
echo Building optimized production build...
call npm run build
echo.

REM Start or restart with PM2 if available
where pm2 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Starting application with PM2...
    call pm2 startOrRestart ecosystem.config.js --env production
) else (
    echo PM2 not found. Starting with regular npm start...
    echo You can install PM2 globally with: npm install -g pm2
    echo.
    start npm run start
)

echo.
echo === Deployment Complete ===
echo The application is now running on http://localhost:3001 