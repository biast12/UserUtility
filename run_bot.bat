@ECHO OFF
ECHO Starting Discord User Utility Bot (Production Mode)...
ECHO.

if not exist "dist\index.js" (
    ECHO ❌ Error: Built files not found in dist/ directory
    ECHO Please run build.bat first to compile the TypeScript code.
    ECHO.
    ECHO Press any key to close this window...
    PAUSE > NUL
    EXIT /B 1
)

node dist/index.js

IF %ERRORLEVEL% EQU 0 (
    ECHO.
    ECHO ✅ Bot stopped normally.
) ELSE (
    ECHO.
    ECHO ❌ Bot stopped with error code %ERRORLEVEL%
)

ECHO.
ECHO Press any key to close this window...
PAUSE > NUL
