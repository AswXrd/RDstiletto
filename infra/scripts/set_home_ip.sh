#!/usr/bin/env bash
set -euo pipefail
IP="$(curl -s https://ifconfig.me || curl -s https://checkip.amazonaws.com || true)"
if [[ -z "$IP" ]]; then
  echo "Could not auto-detect public IP. Please edit infra/terraform/terraform.tfvars.json manually."
  exit 1
fi

TVARS="infra/terraform/terraform.tfvars.json"
if [[ ! -f "$TVARS" ]]; then
  cat > "$TVARS" <<EOF
{
  "project_id": "your-gcp-project-id",
  "region": "asia-northeast3",
  "zone": "asia-northeast3-a",
  "project_name": "stiletto-redirector",
  "home_ip": "$IP",
  "public_key": "REPLACE_ME",
  "machine_type": "e2-micro"
}
EOF
  echo "Created $TVARS with home_ip=$IP. Please set your public_key and project_id."
else
  if command -v jq >/dev/null 2>&1; then
    TMP="$(mktemp)"
    jq --arg ip "$IP" '.home_ip=$ip' "$TVARS" > "$TMP" && mv "$TMP" "$TVARS"
    echo "Updated home_ip in $TVARS to $IP"
  else
    echo "Please update home_ip in $TVARS to $IP (jq not found)."
  fi
fi
