#!/usr/bin/env bash
# Report whether the local knowledge base is behind its remote.
# Throttled: at most one network check every 4 hours. Silent when up to date.
set -euo pipefail

SDLC_HOME="$HOME/.sdlc"
STAMP="$SDLC_HOME/.last-update-check"
THROTTLE=14400

cd "$SDLC_HOME" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "sdlc: no git remote configured, cannot check for updates"
  exit 0
fi

now="$(date +%s)"
if [ -f "$STAMP" ]; then
  last="$(cat "$STAMP" 2>/dev/null || echo 0)"
  [ $((now - last)) -lt "$THROTTLE" ] && exit 0
fi

git fetch --quiet origin 2>/dev/null || { echo "sdlc: fetch failed, skipping update check"; exit 0; }
echo "$now" >"$STAMP"

behind="$(git rev-list --count HEAD..@{u} 2>/dev/null || echo 0)"
if [ "$behind" -gt 0 ]; then
  echo "sdlc: knowledge base is $behind commit(s) behind. Run: git -C ~/.sdlc pull"
fi
