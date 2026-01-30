@echo off
title Iniciando Soporte Peten
echo ==========================================
echo      SISTEMA DE SOPORTE PETEN
echo ==========================================
echo.
echo Iniciando Servidor (Backend)...
cd server
start "Soporte Peten SERVER (Port 5000)" cmd /k "npm run dev"
cd ..

echo Iniciando Cliente Web (Frontend)...
cd client
start "Soporte Peten CLIENT (Port 3000)" cmd /k "npm run dev"
cd ..

echo.
echo ==========================================
echo  Todo listo!
echo  El sistema se abrira en tu navegador...
echo ==========================================
timeout /t 5
start http://localhost:3000
pause
