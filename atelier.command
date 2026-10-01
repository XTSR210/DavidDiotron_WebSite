#!/bin/bash
# ============================================================
#  Atelier David Drioton (Mac) - lancement en un double-clic
#  - Base de l'atelier (cet ordinateur) : port 3311
#  - Site en local                      : port 3210
#  Le navigateur s'ouvre sur l'espace Atelier.
#  Laissez cette fenêtre ouverte : c'est ici que s'affiche le code
#  en cas de mot de passe oublié. Pour tout arrêter : fermez-la.
# ============================================================
cd "$(dirname "$0")" || exit 1

if [ ! -d node_modules ]; then
  echo "Première fois : installation (une minute)..."
  npm install || exit 1
fi

node local-server.mjs &
BASE=$!
npm run dev -- -p 3210 >/dev/null 2>&1 &
SITE=$!
trap 'kill $BASE $SITE 2>/dev/null' EXIT

echo "Ouverture du site..."
for i in $(seq 1 60); do
  curl -s -o /dev/null http://localhost:3210/ && break
  sleep 1
done
open "http://localhost:3210/admin/"
wait
