# # import os, json, subprocess, shlex, datetime
# # from pathlib import Path
# # from fastapi import FastAPI, HTTPException
# # from fastapi.middleware.cors import CORSMiddleware
# # from pydantic import BaseModel, Field
# # from typing import Optional, Dict, Any

# # APP = FastAPI(title="Stiletto GCP Backend", version="0.1.0")
# # APP.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# # TF_DIR = Path(os.getenv("TF_DIR", "/data/tf")).resolve()
# # GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "sesac-effi3elov3")
# # GCP_REGION = os.getenv("GCP_REGION", "asia-northeast3")
# # GCP_ZONE = os.getenv("GCP_ZONE", "asia-northeast3-a")
# # PROJECT_NAME = os.getenv("PROJECT_NAME", "knu-effi3elov3")

# # class DeployVars(BaseModel):
# #     project_id: str = Field(default_factory=lambda: GCP_PROJECT_ID)
# #     region: str = Field(default_factory=lambda: GCP_REGION)
# #     zone: str = Field(default_factory=lambda: GCP_ZONE)
# #     project_name: str = Field(default_factory=lambda: PROJECT_NAME)
# #     home_cidr: str
# #     ssh_username: str = "ubuntu"
# #     public_key: str
# #     machine_type: str = "e2-micro"
# #     set_root_password: bool = False
# #     root_password: str = ""
# #     enable_cloud_logging: bool = True

# # def _run(cmd: str, cwd: Path):
# #     proc = subprocess.run(shlex.split(cmd), cwd=str(cwd), capture_output=True, text=True)
# #     if proc.returncode != 0:
# #         raise HTTPException(status_code=500, detail=f"Command failed: {cmd}\nSTDOUT:\n{proc.stdout}\nSTDERR:\n{proc.stderr}")
# #     return proc.stdout

# # def write_tfvars(dv: DeployVars):
# #     tfvars = f'''
# # project_id   = "{dv.project_id}"
# # region       = "{dv.region}"
# # zone         = "{dv.zone}"
# # project_name = "{dv.project_name}"

# # home_cidr     = "{dv.home_cidr}"
# # ssh_username  = "{dv.ssh_username}"
# # public_key    = <<EOKEY
# # {dv.public_key.strip()}
# # EOKEY

# # machine_type        = "{dv.machine_type}"
# # set_root_password   = {"true" if dv.set_root_password else "false"}
# # root_password       = "{dv.root_password.replace('"','\\"')}"
# # enable_cloud_logging = {"true" if dv.enable_cloud_logging else "false"}
# # '''.strip()
# #     (TF_DIR / "terraform.tfvars").write_text(tfvars, encoding="utf-8")

# # @APP.post("/deploy")
# # def deploy(dv: DeployVars):
# #     TF_DIR.mkdir(parents=True, exist_ok=True)
# #     write_tfvars(dv)
# #     _run("terraform init -upgrade", TF_DIR)
# #     _run("terraform apply -auto-approve", TF_DIR)
# #     return outputs()

# # @APP.get("/outputs")
# # def outputs():
# #     out = _run("terraform output -json", TF_DIR)
# #     try:
# #         data = json.loads(out)
# #         return {k: (v.get("value") if isinstance(v, dict) else v) for k,v in data.items()}
# #     except Exception:
# #         return {"raw": out}

# # @APP.post("/destroy")
# # def destroy():
# #     _run("terraform destroy -auto-approve", TF_DIR)
# #     return {"status": "destroyed"}

# # class AnalyzeRequest(BaseModel):
# #     since: Optional[str] = None

# # @APP.post("/logs/analyze")
# # def analyze(req: AnalyzeRequest):
# #     since = req.since or (datetime.datetime.utcnow() - datetime.timedelta(hours=1)).replace(microsecond=0).isoformat() + "Z"
# #     instance_name = f"{PROJECT_NAME}-redirector"
# #     filt = f'resource.type="gce_instance" labels."compute.googleapis.com/resource_name"="{instance_name}" timestamp>="{since}" (textPayload:"nginx" OR textPayload:"sshd" OR "Failed password" OR "Accepted password")'
# #     cmd = f"gcloud logging read {shlex.quote(filt)} --project {GCP_PROJECT_ID} --format=json --limit=1000"
# #     proc = subprocess.run(cmd, shell=True, capture_output=True, text=True)
# #     if proc.returncode != 0:
# #         raise HTTPException(status_code=500, detail=proc.stderr)
# #     try:
# #         entries = json.loads(proc.stdout or "[]")
# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=str(e))
# #     # quick stats
# #     total = len(entries)
# #     ssh_failed = sum(1 for e in entries if 'Failed password' in (e.get('textPayload') or ''))
# #     ssh_ok = sum(1 for e in entries if 'Accepted password' in (e.get('textPayload') or ''))
# #     nginx_hits = sum(1 for e in entries if 'GET ' in (e.get('textPayload') or '') or 'POST ' in (e.get('textPayload') or ''))
# #     return {"since": since, "total": total, "ssh_failed": ssh_failed, "ssh_accepted": ssh_ok, "nginx_hits": nginx_hits}

# import os, json, subprocess, shlex, datetime
# from pathlib import Path
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel, Field
# from typing import Optional

# APP = FastAPI(title="Stiletto GCP Backend", version="0.1.0")
# APP.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Terraform 작업 디렉터리 (docker-compose에서 TF_DIR로 주입 권장)
# TF_DIR = Path(os.getenv("TF_DIR", "/data/tf")).resolve()

# # 기본값(프론트에서 덮어씀)
# GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "sesac-effi3elov3")
# GCP_REGION = os.getenv("GCP_REGION", "asia-northeast3")
# GCP_ZONE = os.getenv("GCP_ZONE", "asia-northeast3-a")
# PROJECT_NAME = os.getenv("PROJECT_NAME", "knu-effi3elov3")


# class DeployVars(BaseModel):
#     project_id: str = Field(default_factory=lambda: GCP_PROJECT_ID)
#     region: str = Field(default_factory=lambda: GCP_REGION)
#     zone: str = Field(default_factory=lambda: GCP_ZONE)
#     project_name: str = Field(default_factory=lambda: PROJECT_NAME)

#     # NOTE: 프론트에서 "61.80.203.117" 형태로 올 수도 있고 "61.80.203.117/32"로 올 수도 있어
#     home_cidr: str

#     ssh_username: str = "ubuntu"
#     public_key: str
#     machine_type: str = "e2-micro"

#     set_root_password: bool = False
#     root_password: str = ""

#     enable_cloud_logging: bool = True


# def _run(cmd: str, cwd: Path) -> str:
#     """subprocess 래퍼 (비 0 종료 시 HTTP 500)"""
#     proc = subprocess.run(shlex.split(cmd), cwd=str(cwd), capture_output=True, text=True)
#     if proc.returncode != 0:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Command failed: {cmd}\nSTDOUT:\n{proc.stdout}\nSTDERR:\n{proc.stderr}",
#         )
#     return proc.stdout


# def write_tfvars(dv: DeployVars) -> None:
#     """terraform.tfvars 파일을 안전하게 생성 (f-string 내 백슬래시 문제 회피)"""
#     TF_DIR.mkdir(parents=True, exist_ok=True)

#     # "61.80.203.117"만 들어오면 자동으로 /32 붙여줌
#     home_cidr = (dv.home_cidr or "").strip()
#     if home_cidr and "/" not in home_cidr:
#         home_cidr = f"{home_cidr}/32"

#     # 따옴표 이스케이프는 사전에 처리(표현식 내부에 백슬래시 사용 안 함)
#     escaped_root_pw = dv.root_password.replace('"', '\\"')
#     pubkey = dv.public_key.strip()

#     # Heredoc(<<EOKEY)으로 공개키를 안전하게 기록
#     lines = [
#         f'project_id   = "{dv.project_id}"',
#         f'region       = "{dv.region}"',
#         f'zone         = "{dv.zone}"',
#         f'project_name = "{dv.project_name}"',
#         "",
#         f'home_cidr     = "{home_cidr}"',
#         f'ssh_username  = "{dv.ssh_username}"',
#         "public_key    = <<EOKEY",
#         pubkey,
#         "EOKEY",
#         "",
#         f'machine_type         = "{dv.machine_type}"',
#         f'set_root_password    = {"true" if dv.set_root_password else "false"}',
#         f'root_password        = "{escaped_root_pw}"',
#         f'enable_cloud_logging = {"true" if dv.enable_cloud_logging else "false"}',
#         "",
#     ]
#     (TF_DIR / "terraform.tfvars").write_text("\n".join(lines), encoding="utf-8")


# @APP.post("/deploy")
# def deploy(dv: DeployVars):
#     write_tfvars(dv)
#     _run("terraform init -upgrade", TF_DIR)
#     _run("terraform apply -auto-approve", TF_DIR)
#     return outputs()


# @APP.get("/outputs")
# def outputs():
#     out = _run("terraform output -json", TF_DIR)
#     try:
#         data = json.loads(out)
#         # Terraform v0.12+ output -json 형태 호환
#         return {k: (v.get("value") if isinstance(v, dict) else v) for k, v in data.items()}
#     except Exception:
#         return {"raw": out}


# @APP.post("/destroy")
# def destroy():
#     _run("terraform destroy -auto-approve", TF_DIR)
#     return {"status": "destroyed"}


# class AnalyzeRequest(BaseModel):
#     since: Optional[str] = None  # ISO8601 (없으면 최근 1시간)


# @APP.post("/logs/analyze")
# def analyze(req: AnalyzeRequest):
#     since = (
#         req.since
#         or (datetime.datetime.utcnow() - datetime.timedelta(hours=1))
#         .replace(microsecond=0)
#         .isoformat()
#         + "Z"
#     )
#     instance_name = f"{PROJECT_NAME}-redirector"
#     # Cloud Logging 쿼리(간단 샘플)
#     filt = (
#         'resource.type="gce_instance" '
#         f'labels."compute.googleapis.com/resource_name"="{instance_name}" '
#         f'timestamp>="{since}" '
#         '(textPayload:"nginx" OR textPayload:"sshd" OR "Failed password" OR "Accepted password")'
#     )
#     cmd = f"gcloud logging read {shlex.quote(filt)} --project {GCP_PROJECT_ID} --format=json --limit=1000"
#     proc = subprocess.run(cmd, shell=True, capture_output=True, text=True)
#     if proc.returncode != 0:
#         raise HTTPException(status_code=500, detail=proc.stderr)

#     try:
#         entries = json.loads(proc.stdout or "[]")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

#     total = len(entries)
#     def _tp(e): return (e.get("textPayload") or "")
#     ssh_failed = sum(1 for e in entries if "Failed password" in _tp(e))
#     ssh_ok = sum(1 for e in entries if "Accepted password" in _tp(e))
#     nginx_hits = sum(1 for e in entries if ("GET " in _tp(e)) or ("POST " in _tp(e)))

#     return {
#         "since": since,
#         "total": total,
#         "ssh_failed": ssh_failed,
#         "ssh_accepted": ssh_ok,
#         "nginx_hits": nginx_hits,
#     }

import os, json, subprocess, shlex, datetime
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import google.generativeai as genai

# uvicorn main:app 가 찾는 이름은 "app"
app = FastAPI(title="Stiletto GCP Backend", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Terraform 작업 디렉터리 (docker-compose에서 TF_DIR로 주입 권장)
TF_DIR = Path(os.getenv("TF_DIR", "/data/tf")).resolve()

# 기본값(프론트에서 덮어씀)
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "sesac-effi3elov3")
GCP_REGION = os.getenv("GCP_REGION", "asia-northeast3")
GCP_ZONE = os.getenv("GCP_ZONE", "asia-northeast3-a")
PROJECT_NAME = os.getenv("PROJECT_NAME", "knu-effi3elov3")

# Gemini API 설정
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class DeployVars(BaseModel):
    project_id: str = Field(default_factory=lambda: GCP_PROJECT_ID)
    region: str = Field(default_factory=lambda: GCP_REGION)
    zone: str = Field(default_factory=lambda: GCP_ZONE)
    project_name: str = Field(default_factory=lambda: PROJECT_NAME)

    home_cidr: str

    ssh_username: str = "ubuntu"
    public_key: str
    machine_type: str = "e2-micro"

    set_root_password: bool = False
    root_password: str = ""

    enable_cloud_logging: bool = True


def _run(cmd: str, cwd: Path) -> str:
    """subprocess 래퍼 (비 0 종료 시 HTTP 500)"""
    proc = subprocess.run(shlex.split(cmd), cwd=str(cwd), capture_output=True, text=True)
    if proc.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail=f"Command failed: {cmd}\nSTDOUT:\n{proc.stdout}\nSTDERR:\n{proc.stderr}",
        )
    return proc.stdout


def write_tfvars(dv: DeployVars) -> None:
    """terraform.tfvars 파일을 variables.tf의 이름에 맞춰 안전하게 생성"""
    TF_DIR.mkdir(parents=True, exist_ok=True)

    # 프론트가 보낸 home_cidr가 "1.2.3.4" 또는 "1.2.3.4/32"라면 IP만 추출
    raw_home = (dv.home_cidr or "").strip()
    home_ip = raw_home.split("/")[0] if raw_home else ""

    # escape double-quotes in root password
    escaped_root_pw = dv.root_password.replace('"', '\\"')
    pubkey = dv.public_key.strip()

    # 변수 이름은 variables.tf에 선언된 이름과 정확히 일치시킬 것
    lines = [
        f'project_id   = "{dv.project_id}"',
        f'region       = "{dv.region}"',
        f'zone         = "{dv.zone}"',
        f'project_name = "{dv.project_name}"',
        "",
        # variables.tf에서 required로 선언된 이름: home_ip (IP only, no /32)
        f'home_ip      = "{home_ip}"',
        f'ssh_username = "{dv.ssh_username}"',
        f'public_key   = "{pubkey}"',
        "",
        f'machine_type        = "{dv.machine_type}"',
        f'set_root_password   = {"true" if dv.set_root_password else "false"}',
        f'root_password       = "{escaped_root_pw}"',
        # Terraform이 선언했다면 넣기 (안정성 위해 넣어두는 편)
        f'enable_cloud_logging = {"true" if dv.enable_cloud_logging else "false"}',
        "",
    ]
    (TF_DIR / "terraform.tfvars").write_text("\n".join(lines), encoding="utf-8")


@app.post("/deploy")
def deploy(dv: DeployVars):
    write_tfvars(dv)
    _run("terraform init -upgrade", TF_DIR)
    _run("terraform apply -auto-approve", TF_DIR)
    return outputs()


@app.get("/outputs")
def outputs():
    out = _run("terraform output -json", TF_DIR)
    try:
        data = json.loads(out)
        return {k: (v.get("value") if isinstance(v, dict) else v) for k, v in data.items()}
    except Exception:
        return {"raw": out}


@app.post("/destroy")
def destroy():
    _run("terraform destroy -auto-approve", TF_DIR)
    return {"status": "destroyed"}


class AnalyzeRequest(BaseModel):
    since: Optional[str] = None  # ISO8601 (없으면 최근 1시간)
    use_ai: bool = False         # AI 분석 사용 여부 추가


@app.post("/logs/analyze")
def analyze(req: AnalyzeRequest):
    # 1. 시간 설정 (기본 1시간 전)
    since = (
        req.since
        or (datetime.datetime.utcnow() - datetime.timedelta(hours=1))
        .replace(microsecond=0)
        .isoformat()
        + "Z"
    )
    
    # 2. 로그 필터 구성 및 조회
    instance_name = f"{PROJECT_NAME}-redirector"
    filt = (
        'resource.type="gce_instance" '
        f'labels."compute.googleapis.com/resource_name"="{instance_name}" '
        f'timestamp>="{since}" '
        '(textPayload:"nginx" OR textPayload:"sshd" OR "Failed password" OR "Accepted password")'
    )
    
    cmd = f"gcloud logging read {shlex.quote(filt)} --project {GCP_PROJECT_ID} --format=json --limit=500"
    proc = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    if proc.returncode != 0:
        raise HTTPException(status_code=500, detail=proc.stderr)

    try:
        entries = json.loads(proc.stdout or "[]")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Log parsing failed: {str(e)}")

    # 3. 기본 통계 계산
    def _tp(e): return (e.get("textPayload") or "")
    
    logs_summary = []
    for e in entries:
        ts = e.get("timestamp", "")
        payload = _tp(e)
        logs_summary.append(f"[{ts}] {payload}")

    ssh_failed = sum(1 for e in entries if "Failed password" in _tp(e))
    ssh_ok = sum(1 for e in entries if "Accepted password" in _tp(e))
    nginx_hits = sum(1 for e in entries if ("GET " in _tp(e)) or ("POST " in _tp(e)))

    stats = {
        "total": len(entries),
        "ssh_failed": ssh_failed,
        "ssh_accepted": ssh_ok,
        "nginx_hits": nginx_hits,
    }

    # 4. Gemini AI 분석 실행
    ai_report = "AI analysis not requested or API Key missing."
    if req.use_ai:
        if not GEMINI_API_KEY:
            ai_report = "Error: GOOGLE_API_KEY environment variable is not set."
        elif not logs_summary:
            ai_report = "No logs found to analyze."
        else:
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                
                # 로그 샘플링 (토큰 제한 고려하여 앞부분 100줄만)
                log_context = "\n".join(logs_summary[:100])
                
                prompt = f"""
                You are a cybersecurity expert. Analyze the following server logs (Nginx & SSH) for suspicious activities.
                
                Logs (Sample):
                {log_context}
                
                Task:
                1. Identify any potential attacks (e.g., SQL Injection, XSS, Brute Force, Scanners).
                2. Summarize the traffic patterns.
                3. Recommend security actions if needed.
                
                Output format: Markdown.
                """
                
                response = model.generate_content(prompt)
                ai_report = response.text
            except Exception as e:
                ai_report = f"AI Analysis Failed: {str(e)}"

    return {
        "since": since,
        "stats": stats,
        "ai_report": ai_report,
        "raw_logs_sample": logs_summary[:20]  # 프론트엔드 표시용 샘플
    }