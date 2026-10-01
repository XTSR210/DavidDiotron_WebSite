@echo off
rem ============================================================
rem  Atelier David Drioton (Windows) - lancement en un double-clic
rem  - Base de l'atelier (ce PC) : port 3311
rem  - Site en local              : port 3210
rem  Le navigateur s'ouvre sur l'espace Atelier.
rem ============================================================
cd /d "%~dp0"

if not exist node_modules (
  echo Premiere fois : installation, une minute...
  call npm install
)

echo Demarrage de la base de l'atelier (port 3311)...
start "Atelier - Base de donnees (laisser ouvert)" cmd /k node local-server.mjs

echo Demarrage du site local (port 3210)...
start "Atelier - Site (laisser ouvert)" cmd /k npm run dev -- -p 3210

rem Laisse le temps au site de demarrer avant d'ouvrir le navigateur
timeout /t 8 /nobreak >nul
start http://localhost:3210/admin/

echo.
echo Deux fenetres noires restent ouvertes : ne pas les fermer
echo tant que vous travaillez sur l'atelier. En cas de mot de passe
echo oublie, le code de reinitialisation s'affiche dans la fenetre
echo "Atelier - Base de donnees". Pour tout arreter : fermez-les.
timeout /t 10 /nobreak >nul
