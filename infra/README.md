# Stiletto Minimal Infra for **GCP** (Environment-Only)

> 목표: (1) 사용자 키쌍 생성 → (2) 프론트에서 값 기입 → (3) VPC + Redirector VM 생성(SSH는 집 IP만, HTTP/80은 전체 허용) → (4) Nginx 접근 로그를 로컬로 가져와 요약 분석.
> **악용 방지**: 프록시/리다이렉트/C2/포트포워딩 등은 **포함하지 않습니다**. 기본 Nginx 페이지만 설치합니다.

## 0) 선행 조건
- GCP 프로젝트 1개와 권한(Compute 사용 가능)
- **Compute Engine API** 활성화 (필요 시 콘솔에서 한 번만 On)
- 로컬: Terraform >= 1.6, OpenSSH, Python 3.10+
- 프론트에서 `terraform/terraform.tfvars.json`을 생성해 줄 수 있어야 함

## 1) 사용자 키쌍 생성 (로컬) — 공개키만 사용
```bash
# macOS/Linux
ssh-keygen -t ed25519 -C "stiletto@user" -f ~/.ssh/stiletto_ed25519

# Windows (PowerShell)
ssh-keygen -t ed25519 -C "stiletto@user" -f $env:USERPROFILE\.ssh\stiletto_ed25519
```
- **공개키** (예: `~/.ssh/stiletto_ed25519.pub`) 내용을 복사해서 2) 단계에서 입력합니다.
- 접속 시: `ssh -i ~/.ssh/stiletto_ed25519 stiletto@<EXTERNAL_IP>`

## 2) 프론트에서 값 기입 → `terraform/terraform.tfvars.json`
프론트는 아래 필드를 받아 `terraform.tfvars.json`을 생성하세요. (수동 작성도 가능)

`infra/terraform/terraform.tfvars.json` 예시:
```json
{
  "project_id": "your-gcp-project-id",
  "region": "asia-northeast3",
  "zone": "asia-northeast3-a",
  "project_name": "stiletto-redirector",
  "home_ip": "203.0.113.45",
  "public_key": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExampleYourPublicKey user@host",
  "machine_type": "e2-micro"
}
```
- `home_ip`는 숫자만(예: `203.0.113.45`). 방화벽에서 자동으로 `/32` 적용됩니다.
- `machine_type`은 비용 최소화를 위해 기본 `e2-micro` 권장(지역별 제공 조건 상이).

보조 스크립트:
```bash
# 현재 공인 IP를 tfvars에 반영
./scripts/set_home_ip.sh
```

## 3) 배포 (Terraform)
```bash
cd infra/terraform
terraform init
terraform plan  -out tfplan
terraform apply -auto-approve tfplan
```
출력값: `redirector_external_ip`, `redirector_url`

접속 확인:
```bash
curl -I http://<redirector_external_ip>
ssh -i ~/.ssh/stiletto_ed25519 stiletto@<redirector_external_ip>
```

## 4) 로그 수집 & 요약 분석 (선택)
```bash
# 원격 로그 수집 (nginx access/error)
./scripts/log_export.sh stiletto <redirector_external_ip> ~/.ssh/stiletto_ed25519

# 로컬 요약 보고서 생성 (Markdown/JSON)
python3 ./scripts/analyze_logs.py ./logs/access.log --out ./logs/report.md
```
생성물:
- `./logs/report.md` — Top IP/UA/Paths/Status + 단순 의심 패턴
- `./logs/report.json` — 동일 데이터 JSON (프론트/AI 프롬프트에 활용)

## 보안 설계
- **방화벽**: 
  - SSH(22) → **집 IP/32**에서만 허용
  - HTTP(80) → **모든 IP 허용**
- **VM 내부**: Ubuntu LTS + Nginx 기본 페이지. UFW 미사용(혼동 방지).

## 파괴
```bash
cd infra/terraform
terraform destroy -auto-approve
```

---
**주의**: 본 구성은 “환경만” 제공합니다. 트래픽 조작/프록시/리다이렉트/C2 등 오용 가능 기능은 포함하지 않습니다.


## (선택) Docker 모드
- `infra/terraform/variables.tf`에 `enable_docker`, `docker_image` 변수를 추가했습니다.
- `enable_docker=true`일 때 VM 부팅 시 Docker를 설치하고 `docker_image` 컨테이너를 **포트 80**에 바인딩해 자동 실행합니다.
- 기본값 `docker_image="nginx:stable"`은 접근 로그가 `/var/log/nginx/access.log`에 기록되도록 호스트에 마운트되며, 기존 `log_export.sh`와 `analyze_logs.py`를 그대로 사용할 수 있습니다.

**사용 예시:**
`infra/terraform/terraform.tfvars.json`
```json
{
  "project_id": "your-gcp-project-id",
  "region": "asia-northeast3",
  "zone": "asia-northeast3-a",
  "project_name": "stiletto-redirector",
  "home_ip": "203.0.113.45",
  "public_key": "ssh-ed25519 AAAA... user@host",
  "machine_type": "e2-micro",
  "enable_docker": true,
  "docker_image": "nginx:stable"
}
```

> **주의**: 80/tcp 외 다른 포트가 필요한 컨테이너는 본 설계 범위를 벗어납니다(환경만 제공). 반드시 80으로 서비스하거나, 방화벽/설계를 확장하려면 별도 검토가 필요합니다.
