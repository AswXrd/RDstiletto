#!/usr/bin/env bash
set -euxo pipefail
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y nginx

cat >/var/www/html/index.html <<'HTML'
<!doctype html>
<html><head><meta charset="utf-8"><title>Stiletto Redirector (GCP)</title></head>
<body>
  <h1>Stiletto Minimal Redirector (GCP)</h1>
  <p>This VM serves a basic page for connectivity checks. No proxy/C2 is installed.</p>
</body></html>
HTML

systemctl enable nginx
systemctl restart nginx
