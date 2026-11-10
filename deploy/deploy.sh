#!/usr/bin/env bash
#
# Déploiement sur le conteneur : tester, construire, envoyer, installer, sauvegarder la base,
# redémarrer, vérifier. À lancer depuis le PC, sous Git Bash, à la racine du dépôt :
#
#   deploy/deploy.sh            (HOTE=autre-alias deploy/deploy.sh pour un autre conteneur)
#
# On déploie HEAD (git archive) et l'interface construite ; un dépôt non propre est refusé,
# pour que ce qui tourne corresponde toujours à un commit. L'ancienne version reste dans
# /opt/anglais.ancien pour revenir en arrière à la main.
set -euo pipefail

HOTE="${HOTE:-anglais-luca}"
cd "$(dirname "${BASH_SOURCE[0]}")/.."

etape() { printf '\n\033[1m== %s\033[0m\n' "$1"; }

[ -z "$(git status --porcelain)" ] || { echo "Dépôt non propre : commiter d'abord (on déploie HEAD)." >&2; exit 1; }
VERSION="$(git rev-parse --short HEAD)"

etape "Tests et construction ($VERSION)"
npm --prefix server test
npm test
npm --prefix server run build
npm run build

etape "Envoi vers $HOTE"
TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT
ARCHIVE="$TEMP/anglais.tar"
git archive --format=tar -o "$ARCHIVE" HEAD
tar -rf "$ARCHIVE" dist
scp -q "$ARCHIVE" "$HOTE:/tmp/anglais.tar"

etape "Installation sur $HOTE"
ssh "$HOTE" VERSION="$VERSION" bash -s <<'DISTANT'
set -euo pipefail
export PATH=/usr/local/bin:$PATH
NOUVEAU=/opt/anglais.nouveau
# Redémarrer le service tuerait une préparation lancée par « Autres articles » (même cgroup).
VERROU=/var/lib/anglais/preparation.lock
if [ -s "$VERROU" ] && kill -0 "$(cat "$VERROU")" 2>/dev/null; then
  echo "Une préparation tourne (PID $(cat "$VERROU")) : relancer le déploiement quand elle sera finie." >&2
  exit 1
fi
rm -rf "$NOUVEAU" && mkdir -p "$NOUVEAU"
# --no-same-owner : l'archive vient de Windows (uid 197609), inconnu du conteneur.
# Deux commandes séparées : dans « a && b », un échec de a n'arrête pas set -e.
tar --no-same-owner -xf /tmp/anglais.tar -C "$NOUVEAU"
rm /tmp/anglais.tar
npm --prefix "$NOUVEAU/server" ci --omit=dev --no-audit --no-fund --loglevel=error

# Sauvegarde AVANT le redémarrage : ouvrir() crée les tables au démarrage.
mkdir -p /var/lib/anglais /root/anglais-sauvegardes
if [ -f /var/lib/anglais/anglais.db ]; then
  COPIE="/root/anglais-sauvegardes/anglais-$(date +%F-%H%M%S).db"
  node -e "new (require('node:sqlite').DatabaseSync)('/var/lib/anglais/anglais.db').exec(\"VACUUM INTO '$COPIE'\")"
  echo "Base sauvegardée : $COPIE"
  ls -1t /root/anglais-sauvegardes/*.db | tail -n +11 | xargs -r rm --
fi

[ -f /etc/anglais.env ] || { echo "/etc/anglais.env manquant (voir server/.env.example)." >&2; exit 1; }
rm -rf /opt/anglais.ancien
[ -d /opt/anglais ] && mv /opt/anglais /opt/anglais.ancien
mv "$NOUVEAU" /opt/anglais
cp /opt/anglais/deploy/anglais.service /opt/anglais/deploy/anglais-preparation.service /opt/anglais/deploy/anglais-preparation.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --quiet anglais.service anglais-preparation.timer
systemctl restart anglais.service
systemctl start anglais-preparation.timer

for _ in $(seq 1 20); do
  if curl -fs localhost:3010/api/sante >/dev/null; then echo "Version $VERSION en service : $(curl -fs localhost:3010/api/sante)"; exit 0; fi
  sleep 1
done
echo "La version $VERSION ne répond pas :" >&2
journalctl -u anglais -n 30 --no-pager >&2 || true
# Retour à la version précédente, unités comprises ; la version en échec reste dans /opt/anglais.echec.
if [ -d /opt/anglais.ancien ]; then
  rm -rf /opt/anglais.echec
  mv /opt/anglais /opt/anglais.echec
  mv /opt/anglais.ancien /opt/anglais
  cp /opt/anglais/deploy/anglais.service /opt/anglais/deploy/anglais-preparation.service /opt/anglais/deploy/anglais-preparation.timer /etc/systemd/system/
  systemctl daemon-reload
  systemctl restart anglais.service
  echo "Retour à la version précédente fait." >&2
fi
exit 1
DISTANT
