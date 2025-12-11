# Stiletto — GCP Dockerized

## Prereqs
- Docker & Docker Compose
- GCP 프로젝트/결제 활성화
- 서비스 계정(JSON) 권장: `roles/compute.admin`, `roles/compute.networkAdmin`, `roles/compute.securityAdmin`, `roles/logging.viewer`

## How to run
1) 서비스 계정 JSON을 `backend/creds/sa.json` 으로 저장
2) 빌드 & 실행
```bash
docker compose build
docker compose up -d
```
3) 프론트: http://localhost:3000
4) 백엔드: http://localhost:8080/health

## Deploy flow
- 프론트 `/` → 공개키/현재IP/필수값 입력 → **Deploy**
- 백엔드는 컨테이너 내 `terraform`으로 배포 (상태/구성은 **볼륨** `/data/tf`에 영속화)
- 출력의 External IP를 Namecheap A 레코드 값으로 입력 → `http://stilettosec.com/health` 확인
- `/dashboard`에서 **Analyze** → 최근 로그 요약

## Notes
- 백엔드 컨테이너는 Terraform과 gcloud CLI를 내장합니다.
- ADC는 `GOOGLE_APPLICATION_CREDENTIALS=/creds/sa.json`로 설정(Compose에 포함).
- Terraform 워킹디렉터리: 볼륨 `tfstate` → 컨테이너 경로 `/data/tf`
- 초기 기동 시 이미지 내 템플릿을 `/data/tf`로 자동 복사

## Destroy
- 프론트에서 제거 기능은 없고, API로:
```bash
curl -X POST http://localhost:8080/destroy
```
또는 백엔드 컨테이너 쉘 진입 후 `terraform destroy -auto-approve`

## Security
- HTTP(80)는 전 세계 허용, SSH(22)는 home_cidr로 제한
- 루트/비밀번호 로그인 옵션은 **학습용** — 실습 후 끄는 것을 강력 권장
