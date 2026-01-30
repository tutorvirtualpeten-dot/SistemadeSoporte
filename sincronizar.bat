@echo off
title Sincronizador Git - Soporte Peten
cd /d "%~dp0"
cls

echo ==========================================
echo      SINCRONIZACION AUTOMATICA
echo ==========================================
echo.
echo  Este script guardara todos los cambios y
echo  los subira a GitHub.
echo.

set "msg="
echo  Escriba una descripcion (o presione ENTER para usar FECHA/HORA):
set /p "msg=>> "

if not defined msg (
    set "msg=Auto-Sync: %date% %time%"
)

echo.
echo  -----------------------------------------
echo  Mensaje: "%msg%"
echo  -----------------------------------------
echo.

echo  [1/3] Agregando archivos (git add)...
git add .
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo  [2/3] Guardando localmente (git commit)...
git commit -m "%msg%"

echo.
echo  [3/3] Subiendo a GitHub (git push)...
git push origin main
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo ==========================================
echo      TODO SALIO BIEN (EXITO)
echo ==========================================
goto :fin

:error
echo.
echo ==========================================
echo      ALERTA: OCURRIO UN ERROR
echo ==========================================
echo  Verifica tu conexion a internet o si hay
echo  conflicto de versiones.

:fin
echo.
echo Presiona cualquier tecla para cerrar.
pause >nul
