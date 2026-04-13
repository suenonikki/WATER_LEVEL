@echo off
echo ================================================
echo   HydroFlow - Athlete Hydration Dashboard
echo ================================================
echo.

REM Create output directory
if not exist "out" mkdir out

REM Compile Java files
echo Compiling Java files...
javac -d out src/main/java/com/hydroflow/*.java

if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Compilation failed! Make sure you have Java JDK installed.
    echo Download from: https://adoptium.net/
    pause
    exit /b 1
)

echo Compilation successful!
echo.

REM Run the server
echo Starting server...
echo.
java -cp out com.hydroflow.HydroFlowServer

pause
