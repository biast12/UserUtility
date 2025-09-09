@ECHO OFF
ECHO Building Discord User Utility Bot...
ECHO.

IF EXIST "dist" (
    RMDIR /S /Q "dist"
    IF %ERRORLEVEL% NEQ 0 (
        ECHO ❌ Error: Failed to remove existing dist/ directory
        ECHO Please check your file permissions.
        ECHO.
        ECHO Press any key to close this window...
        PAUSE > NUL
        EXIT /B 1
    )
)

npm run build

IF %ERRORLEVEL% EQU 0 (
    ECHO.
    ECHO ✅ Build completed successfully!
    ECHO Output directory: dist/
) ELSE (
    ECHO.
    ECHO ❌ Build failed with error code %ERRORLEVEL%
    ECHO Please check the console output above for details.
)

ECHO.
ECHO Press any key to close this window...
PAUSE > NUL
