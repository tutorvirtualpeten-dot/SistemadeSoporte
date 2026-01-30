@echo off
title Reiniciando Servidor Backend
echo ==========================================
echo      REINICIANDO SOLO EL BACKEND
echo ==========================================
echo.
echo Cerrando procesos de node.js antiguos...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Soporte Peten SERVER*"
echo.
echo Iniciando Servidor de nuevo...
cd server
start "Soporte Peten SERVER (Port 5000)" cmd /k "npm run dev"
echo.
echo LISTO! El backend se ha reiniciado.
echo Ya puedes probar de nuevo la pagina.
pause
