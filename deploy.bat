@echo off
echo ========================================
echo    DEPLOY APLICACION LEY SILLA
echo ========================================
echo.

echo 1. Construyendo la aplicación...
npm run build

echo.
echo 2. Desplegando a Firebase...
firebase deploy --only hosting:analisisbipedestacionhunter

echo.
echo ========================================
echo    DEPLOY COMPLETADO
echo ========================================
echo.
echo URL: https://analisisbipedestacionhunter.web.app
echo.
pause 