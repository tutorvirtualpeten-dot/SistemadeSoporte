@echo off
echo ==========================================
echo      SINCRONIZANDO CON GITHUB
echo ==========================================
echo.

set /p msg="Ingrese descripcion de cambios (Enter para usar fecha/hora): "

if "%msg%"=="" (
    set msg=Actualizacion automatica %date% %time%
)

echo.
echo 1. Agregando archivos...
git add .

echo.
echo 2. Guardando cambios localmente...
git commit -m "%msg%"

echo.
echo 3. Subiendo a la nube (GitHub)...
git push origin main

echo.
echo ==========================================
if %ERRORLEVEL% EQU 0 (
    echo      SINCRONIZACION EXITOSA
) else (
    echo      HUBO UN ERROR
)
echo ==========================================
echo.
pause
