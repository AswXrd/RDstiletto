#!/usr/bin/env bash
set -euo pipefail
if [ $# -lt 3 ]; then
  echo "Usage: $0 <user> <host_or_ip> <ssh_key_path>"
  echo "Example: $0 stiletto 34.64.x.x ~/.ssh/stiletto_ed25519"
  exit 1
fi
USER="$1"
HOST="$2"
KEY="$3"

mkdir -p ./logs
scp -i "$KEY" -o StrictHostKeyChecking=accept-new "$USER@$HOST:/var/log/nginx/access.log" ./logs/access.log
scp -i "$KEY" -o StrictHostKeyChecking=accept-new "$USER@$HOST:/var/log/nginx/error.log"  ./logs/error.log
echo "Logs downloaded to ./logs"
