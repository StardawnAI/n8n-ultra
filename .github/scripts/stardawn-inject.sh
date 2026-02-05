#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# === SOURCE OF TRUTH ===
SRC="$ROOT/stardawn_setup"
SRC_NODES="$SRC/nodes"
SRC_CREDS="$SRC/credentials"
STATE_FILE="$SRC/.injected.json"

# === DESTINATION (n8n expects these) ===
NODES_BASE="$ROOT/packages/nodes-base"
DST_NODES="$NODES_BASE/nodes"
DST_CREDS="$NODES_BASE/credentials"
PKG_JSON="$NODES_BASE/package.json"

[ -f "$PKG_JSON" ] || { echo "ERROR: missing $PKG_JSON"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "ERROR: jq missing"; exit 1; }

mkdir -p "$DST_NODES" "$DST_CREDS"

# --- remove previously injected artifacts (tracked)
if [ -f "$STATE_FILE" ]; then
  jq -r '.nodeFolders[]? // empty' "$STATE_FILE" | while read -r folder; do
    [ -n "${folder:-}" ] && rm -rf "$DST_NODES/$folder" || true
  done
  jq -r '.credFiles[]? // empty' "$STATE_FILE" | while read -r f; do
    [ -n "${f:-}" ] && rm -f "$DST_CREDS/$f" || true
  done
fi

# --- copy current nodes folders (1 folder per node group)
NODE_FOLDERS=()
if [ -d "$SRC_NODES" ]; then
  mapfile -t NODE_FOLDERS < <(find "$SRC_NODES" -mindepth 1 -maxdepth 1 -type d -printf "%f\n" | sort)
  for folder in "${NODE_FOLDERS[@]:-}"; do
    rm -rf "$DST_NODES/$folder"
    cp -r "$SRC_NODES/$folder" "$DST_NODES/$folder"
  done
fi

# --- copy current credential files (flat)
CRED_FILES=()
if [ -d "$SRC_CREDS" ]; then
  mapfile -t CRED_FILES < <(find "$SRC_CREDS" -maxdepth 1 -type f -name "*.credentials.ts" -printf "%f\n" | sort)
  for f in "${CRED_FILES[@]:-}"; do
    cp -f "$SRC_CREDS/$f" "$DST_CREDS/$f"
  done
fi

# --- build package.json entries from ACTUAL filenames
# IMPORTANT: we require *.node.ts in the FOLDER ROOT (not nested),
# because n8n expects dist/nodes/<folder>/<base>.node.js
CUR_NODE_ENTRIES=()
for folder in "${NODE_FOLDERS[@]:-}"; do
  mapfile -t NODE_TS < <(find "$DST_NODES/$folder" -maxdepth 1 -type f -name "*.node.ts" -printf "%f\n" | sort)
  [ "${#NODE_TS[@]}" -gt 0 ] || { echo "ERROR: no *.node.ts in stardawn_setup/nodes/$folder"; exit 1; }

  for file in "${NODE_TS[@]}"; do
    base="${file%.node.ts}"
    CUR_NODE_ENTRIES+=("dist/nodes/$folder/$base.node.js")
  done
done

CUR_CRED_ENTRIES=()
for f in "${CRED_FILES[@]:-}"; do
  base="${f%.credentials.ts}"
  CUR_CRED_ENTRIES+=("dist/credentials/$base.credentials.js")
done

# --- previous injected entries for clean replace
PREV_NODES_JSON="[]"
PREV_CREDS_JSON="[]"
if [ -f "$STATE_FILE" ]; then
  PREV_NODES_JSON="$(jq -c '.nodes // []' "$STATE_FILE" || echo '[]')"
  PREV_CREDS_JSON="$(jq -c '.credentials // []' "$STATE_FILE" || echo '[]')"
fi

CUR_NODES_JSON="$(printf '%s\n' "${CUR_NODE_ENTRIES[@]:-}" | jq -R . | jq -s .)"
CUR_CREDS_JSON="$(printf '%s\n' "${CUR_CRED_ENTRIES[@]:-}" | jq -R . | jq -s .)"

tmp="$(mktemp)"
jq \
  --argjson prevNodes "$PREV_NODES_JSON" \
  --argjson prevCreds "$PREV_CREDS_JSON" \
  --argjson curNodes "$CUR_NODES_JSON" \
  --argjson curCreds "$CUR_CREDS_JSON" \
  '
  .n8n = (.n8n // {}) |
  .n8n.nodes = (((.n8n.nodes // []) - $prevNodes + $curNodes) | unique) |
  .n8n.credentials = (((.n8n.credentials // []) - $prevCreds + $curCreds) | unique)
  ' "$PKG_JSON" > "$tmp"
mv "$tmp" "$PKG_JSON"

# --- persist state for next run (so removals work)
jq -n \
  --argjson n "$CUR_NODES_JSON" \
  --argjson c "$CUR_CREDS_JSON" \
  --argjson folders "$(printf '%s\n' "${NODE_FOLDERS[@]:-}" | jq -R . | jq -s .)" \
  --argjson credfiles "$(printf '%s\n' "${CRED_FILES[@]:-}" | jq -R . | jq -s .)" \
  '{nodes:$n, credentials:$c, nodeFolders:$folders, credFiles:$credfiles}' > "$STATE_FILE"

echo "Injected nodes=${#CUR_NODE_ENTRIES[@]} credentials=${#CUR_CRED_ENTRIES[@]}"
