@ECHO OFF
ECHO Starting Discord User Utility Bot command registration...
ECHO.

npm run register

IF %ERRORLEVEL% EQU 0 (
    ECHO.
    ECHO ✅ Registration completed successfully!
    ECHO Commands have been registered with Discord.
) ELSE (
    ECHO.
    ECHO ❌ Registration failed with error code %ERRORLEVEL%
    ECHO This is normal if BOT_TOKEN is not configured in .env file.
    ECHO Please check your environment configuration.
)

ECHO.
ECHO Press any key to close this window...
PAUSE > NUL
