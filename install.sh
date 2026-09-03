#!/usr/bin/env bash
# Link every routing skill in this repo into Claude Code's skills directory.
# Idempotent: safe to re-run after adding or renaming skills.
set -euo pipefail

SDLC_HOME="$HOME/.sdlc"
SKILLS_DIR="$HOME/.claude/skills"

if [ ! -d "$SDLC_HOME" ]; then
  echo "error: $SDLC_HOME not found." >&2
  echo "Install by cloning to the conventional path:" >&2
  echo "    git clone <repo-url> ~/.sdlc" >&2
  echo "Or, if the repo already lives elsewhere:" >&2
  echo "    ln -s /path/to/repo ~/.sdlc" >&2
  exit 1
fi

mkdir -p "$SKILLS_DIR"

count=0
for skill_dir in "$SDLC_HOME"/catalog/skills/*/*/; do
  [ -f "${skill_dir}SKILL.md" ] || continue
  name="$(sed -n 's/^name:[[:space:]]*//p' "${skill_dir}SKILL.md" | head -1)"
  if [ -z "$name" ]; then
    echo "warn: no name field in ${skill_dir}SKILL.md, skipped" >&2
    continue
  fi
  ln -sfn "${skill_dir%/}" "$SKILLS_DIR/$name"
  echo "  linked $name"
  count=$((count + 1))
done

echo "Installed $count skill(s) into $SKILLS_DIR"
echo "Open a new session for them to take effect."
