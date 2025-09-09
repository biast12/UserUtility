@ECHO OFF
SETLOCAL ENABLEDELAYEDEXPANSION

REM ============================================================================
REM UserUtility Bot - TypeScript Build Script
REM Compiles TypeScript source code to JavaScript
REM ============================================================================

REM Set console title for better identification
TITLE UserUtility Bot - TypeScript Build

REM Display script header
ECHO ============================================
ECHO UserUtility Bot - TypeScript Build
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

REM Check if node_modules exists
IF NOT EXIST "node_modules" (
    ECHO [WARNING] No node_modules found.
    ECHO Installing dependencies first...
    npm install
    IF %ERRORLEVEL% NEQ 0 (
        ECHO [ERROR] Failed to install dependencies.
        PAUSE
        EXIT /B 1
    )
    ECHO.
)

REM Check if tsconfig.json exists
IF NOT EXIST "tsconfig.json" (
    ECHO [ERROR] tsconfig.json not found in current directory.
    ECHO Please ensure TypeScript is properly configured.
    PAUSE
    EXIT /B 1
)

REM Clean existing build if it exists
IF EXIST "dist" (
    ECHO [INFO] Cleaning existing build directory...
    RMDIR /S /Q "dist"
    IF %ERRORLEVEL% NEQ 0 (
        ECHO [ERROR] Failed to remove existing dist/ directory
        ECHO Please check your file permissions.
        PAUSE
        EXIT /B 1
    )
    ECHO [INFO] Previous build cleaned.
    ECHO.
)

REM Build the TypeScript project
ECHO [INFO] Building TypeScript project...
npm run build

REM Check build status
IF %ERRORLEVEL% EQU 0 (
    ECHO.
    ECHO ============================================
    ECHO [SUCCESS] Build completed successfully!
    ECHO ============================================
    ECHO Output directory: %CD%\dist
) ELSE (
    ECHO.
    ECHO ============================================
    ECHO [ERROR] Build failed with error code: %ERRORLEVEL%
    ECHO ============================================
    ECHO Please check the console output above for details.
)

ECHO.
ECHO Press any key to exit...
PAUSE >NUL
