@ECHO OFF
ECHO Starting Discord User Utility Bot (Development Mode)...
ECHO.

if not exist "src\index.ts" (
    ECHO ❌ Error: Source files not found in src/ directory
    ECHO Please ensure the project structure is correct.
    ECHO.
    ECHO Press any key to close this window...
    PAUSE > NUL
    EXIT /B 1
)

npm run start

IF %ERRORLEVEL% EQU 0 (
    ECHO.
    ECHO ✅ Bot stopped normally.
) ELSE (
    ECHO.
    ECHO ❌ Bot stopped with error code %ERRORLEVEL%
    ECHO Please check the console output above for details.
)

ECHO.
ECHO Press any key to close this window...
PAUSE > NUL
