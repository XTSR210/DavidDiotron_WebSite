@echo off
rem ============================================================
rem  Atelier David Drioton - lancement en un double-clic
rem  - Base de donnees locale (ce PC)  : port 3311
rem  - Site en local                   : port 3210
rem  Le navigateur s'ouvre sur le panneau d'administration.
rem ============================================================
cd /d "%~dp0"

echo Demarrage de la base de donnees locale (port 3311)...
start "Atelier - Base de donnees (laisser ouvert)" cmd /k node local-server.mjs

echo Demarrage du site local (port 3210)...
start "Atelier - Site (laisser ouvert)" cmd /k npm run dev -- -p 3210

rem Laisse le temps au site de demarrer avant d'ouvrir le navigateur
timeout /t 6 /nobreak >nul
start http://localhost:3210/admin

echo.
echo Deux fenetres noires restent ouvertes : ne pas les fermer
rem tant que vous travaillez sur l'atelier. Pour tout arreter :
rem fermez simplement ces deux fenetres.
timeout /t 10 /nobreak >nul
