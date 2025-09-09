@ECHO OFF
SETLOCAL ENABLEDELAYEDEXPANSION

REM =====================================================
REM UserUtility Bot - Bot Launcher
REM =====================================================

REM Set console title for better identification
TITLE UserUtility Bot - Bot Launcher

REM Check if Node.js is installed and accessible
node --version >NUL 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERROR] Node.js is not installed or not in PATH.
    ECHO Please install Node.js and ensure it's added to your system PATH.
    PAUSE
    EXIT /B 1
)

REM Check if node_modules exists
IF NOT EXIST "node_modules" (
    ECHO [WARNING] No node_modules found.
    ECHO Please run setup_environment.bat first to install dependencies.
    PAUSE
    EXIT /B 1
)

REM Check if .env file exists
IF NOT EXIST ".env" (
    ECHO [ERROR] .env file not found.
    ECHO Please create a .env file with your bot configuration.
    ECHO You can copy .env.example to .env and modify it.
    PAUSE
    EXIT /B 1
)

REM Check if TypeScript build exists
IF NOT EXIST "dist" (
    ECHO [WARNING] No dist folder found. Building TypeScript project...
    npm run build
    IF %ERRORLEVEL% NEQ 0 (
        ECHO [ERROR] Failed to build TypeScript project.
        PAUSE
        EXIT /B 1
    )
)

ECHO.
ECHO Launching bot...
ECHO =====================================================
ECHO.

REM Run the bot
npm run start

REM Check if bot crashed
if %ERRORLEVEL% neq 0 (
    ECHO.
    ECHO =====================================================
    ECHO [ERROR] Bot crashed with error code: %ERRORLEVEL%
    ECHO =====================================================
    PAUSE
) else (
    ECHO.
    ECHO =====================================================
    ECHO Bot stopped normally.
    ECHO =====================================================
)

ECHO.
ECHO Press any key to exit...
PAUSE >NUL
