#!/usr/bin/env bash
set -euo pipefail

# Terraform 초기화 (있으면 하고, 없어도 통과)
terraform -chdir=${TF_DIR:-/app/infra/terraform} init -input=false || true

# 백엔드 기동 (반드시 0.0.0.0:8080 바인딩)
exec uvicorn main:app --host 0.0.0.0 --port 8080
