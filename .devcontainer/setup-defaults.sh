#!/bin/sh
set -eu

echo "=== WAITING FOR POSTGRES ==="
until pg_isready -h postgres -p 5432 -U admin >/dev/null 2>&1; do
  sleep 2
done

echo "=== STARTING N8N SERVER ==="
n8n &
N8N_PID=$!

echo "=== WAITING FOR N8N TO BE READY ==="
until curl -sf http://localhost:5678/healthz >/dev/null 2>&1 || curl -sf http://localhost:5678/ >/dev/null 2>&1; do
  sleep 3
done

echo "=== IMPORTING WORKFLOWS ==="
if [ ! -f "/home/node/.n8n/workflows-initialized" ]; then
  n8n import:workflow --input="/usr/src/app/default-workflows/" --separate
  touch /home/node/.n8n/workflows-initialized
fi

echo "=== IMPORTING AND ORGANIZING STATIC WORKFLOWS ==="
if [ -d "/usr/src/app/workflows-static" ] && [ ! -f "/home/node/.n8n/workflows-static-initialized" ]; then
  FOLDER_NAME="workflows-static"

  # list folders -> get id by name
  FOLDERS_JSON="$(curl -s -u "$N8N_BASIC_AUTH_USER:$N8N_BASIC_AUTH_PASSWORD" \
    "http://localhost:5678/api/v1/workflows/folders" || true)"

  FOLDER_ID="$(echo "$FOLDERS_JSON" | jq -r --arg n "$FOLDER_NAME" '.[]? | select(.name==$n) | .id' | head -n1 || true)"

  # create folder if missing
  if [ -z "${FOLDER_ID:-}" ] || [ "$FOLDER_ID" = "null" ]; then
    echo "Folder '${FOLDER_NAME}' not found. Creating it."
    FOLDER_ID="$(curl -s -u "$N8N_BASIC_AUTH_USER:$N8N_BASIC_AUTH_PASSWORD" \
      -X POST "http://localhost:5678/api/v1/workflows/folders" \
      -H "Content-Type: application/json" \
      -d "{\"name\":\"${FOLDER_NAME}\"}" | jq -r '.id' || true)"
  else
    echo "Folder '${FOLDER_NAME}' already exists with ID: $FOLDER_ID"
  fi

  # import static workflows (land in root)
  n8n import:workflow --input="/usr/src/app/workflows-static/" --separate

  # move by NAME -> lookup real DB workflow IDs via API
  if [ -n "${FOLDER_ID:-}" ] && [ "$FOLDER_ID" != "null" ]; then
    WF_JSON="$(curl -s -u "$N8N_BASIC_AUTH_USER:$N8N_BASIC_AUTH_PASSWORD" \
      "http://localhost:5678/api/v1/workflows" || true)"

    for file in /usr/src/app/workflows-static/*.json; do
      WF_NAME="$(jq -r '.name // empty' "$file")"
      [ -z "${WF_NAME:-}" ] && continue

      WF_ID="$(echo "$WF_JSON" | jq -r --arg n "$WF_NAME" '.data[]? | select(.name==$n) | .id' | head -n1 || true)"
      [ -z "${WF_ID:-}" ] && WF_ID="$(echo "$WF_JSON" | jq -r --arg n "$WF_NAME" '.[]? | select(.name==$n) | .id' | head -n1 || true)"

      if [ -n "${WF_ID:-}" ] && [ "$WF_ID" != "null" ]; then
        echo "  -> Moving '$WF_NAME' (ID ${WF_ID})"
        curl -s -u "$N8N_BASIC_AUTH_USER:$N8N_BASIC_AUTH_PASSWORD" \
          -X PATCH "http://localhost:5678/api/v1/workflows/${WF_ID}" \
          -H "Content-Type: application/json" \
          -d "{\"folderId\":\"$FOLDER_ID\"}" >/dev/null || true
      fi
    done
  fi

  touch /home/node/.n8n/workflows-static-initialized
fi

echo "=== IMPORTING CREDENTIALS ==="
if [ ! -f "/home/node/.n8n/credentials-initialized" ]; then
  n8n import:credentials --input="/usr/src/app/initial-credentials/" --separate || true
  touch /home/node/.n8n/credentials-initialized
fi

wait $N8N_PID
