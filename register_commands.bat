@echo off
echo Starting Discord bot command registration...
echo.

npm run register

if %errorlevel% equ 0 (
    echo.
    echo ✅ Registration completed successfully!
) else (
    echo.
    echo ❌ Registration failed with error code %errorlevel%
    echo This is normal if BOT_TOKEN is not configured in .env
)

echo.
echo Press any key to close this window...
pause > nul
