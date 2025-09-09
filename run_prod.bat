@ECHO OFF
SETLOCAL ENABLEDELAYEDEXPANSION

REM =====================================================
REM UserUtility Bot - Production Launcher
REM Runs the compiled JavaScript bot from dist folder
REM =====================================================

REM Set console title for better identification
TITLE UserUtility Bot - Production Mode

REM Display script header
ECHO ============================================
ECHO UserUtility Bot - Production Mode
ECHO ============================================
ECHO.

REM Check if Node.js is installed and accessible
node --version >NUL 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERROR] Node.js is not installed or not in PATH.
    ECHO Please install Node.js and ensure it's added to your system PATH.
    PAUSE
    EXIT /B 1
)

REM Check if dist folder and bot.js exist
IF NOT EXIST "dist\bot.js" (
    ECHO [ERROR] Built files not found in dist/ directory
    ECHO Please run build.bat first to compile the TypeScript code.
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

ECHO [INFO] Starting bot from compiled JavaScript...
ECHO =====================================================
ECHO.

REM Run the compiled bot
node dist/bot.js

REM Check if bot crashed
IF %ERRORLEVEL% NEQ 0 (
    ECHO.
    ECHO =====================================================
    ECHO [ERROR] Bot crashed with error code: %ERRORLEVEL%
    ECHO =====================================================
    PAUSE
) ELSE (
    ECHO.
    ECHO =====================================================
    ECHO [SUCCESS] Bot stopped normally.
    ECHO =====================================================
)

ECHO.
ECHO Press any key to exit...
PAUSE >NUL
