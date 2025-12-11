#!/usr/bin/env python3
import argparse, json, re, os
from collections import Counter
from datetime import datetime

NGINX_COMBINED = re.compile(
    r'(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] "(?P<method>\S+) (?P<path>\S+) \S+" (?P<status>\d{3}) (?P<size>\S+) "(?P<ref>[^"]*)" "(?P<ua>[^"]*)"'
)

def parse_log(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            m = NGINX_COMBINED.search(line)
            if m:
                yield m.groupdict()

def summarize(entries):
    ips = Counter(); uas = Counter(); paths = Counter(); statuses = Counter()
    suspicious = {"scan_like": Counter(), "login_like": Counter(), "admin_probe": Counter(), "sql_like": Counter()}
    sql_keywords = ("union", "select", "drop", "sleep(", "or 1=1")
    admin_keywords = ("/wp-admin", "/admin", "/phpmyadmin", "/manager", "/login")
    scan_keywords = ("/.git", "/.env", "/.ds_store", "/boaform", "shell", "passwd")
    for e in entries:
        ips[e["ip"]] += 1; uas[e["ua"]] += 1; paths[e["path"]] += 1; statuses[e["status"]] += 1
        p = e["path"].lower()
        if any(k in p for k in scan_keywords): suspicious["scan_like"][e["path"]] += 1
        if any(k in p for k in admin_keywords): suspicious["admin_probe"][e["path"]] += 1
        if any(k in p for k in sql_keywords): suspicious["sql_like"][e["path"]] += 1
        if "login" in p or "signin" in p: suspicious["login_like"][e["path"]] += 1
    def topn(c, n=10): return [{"value": k, "count": v} for k, v in c.most_common(n)]
    return {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "top_ips": topn(ips), "top_user_agents": topn(uas), "top_paths": topn(paths),
        "status_codes": [{"code": k, "count": v} for k, v in statuses.most_common()],
        "suspicious": {k: [{"path": p, "count": c} for p, c in v.most_common(10)] for k, v in suspicious.items()},
    }

def write_markdown(summary, out_md):
    lines = []
    lines.append(f"# Redirector Access Log Report")
    lines.append(f"- Generated: {summary['generated_at']}")
    lines.append("")
    def tbl(rows, headers):
        lines.append("| " + " | ".join(headers) + " |")
        lines.append("|" + "|".join(["---"]*len(headers)) + "|")
        for r in rows: lines.append("| " + " | ".join(str(r[h]) for h in headers) + " |")
        lines.append("")
    lines.append("## Top IPs"); tbl([{"IP": r["value"], "Count": r["count"]} for r in summary["top_ips"]], ["IP","Count"])
    lines.append("## Top User Agents"); tbl([{"UA": r["value"][:80], "Count": r["count"]} for r in summary["top_user_agents"]], ["UA","Count"])
    lines.append("## Top Paths"); tbl([{"Path": r["value"], "Count": r["count"]} for r in summary["top_paths"]], ["Path","Count"])
    lines.append("## Status Codes"); tbl([{"Code": r["code"], "Count": r["count"]} for r in summary["status_codes"]], ["Code","Count"])
    lines.append("## Suspicious Patterns (heuristic)")
    for k, label in [("scan_like","Scan-like"), ("admin_probe","Admin probes"), ("sql_like","SQL-like"), ("login_like","Login-like")]:
        lines.append(f"### {label}")
        tbl([{"Path": r["path"], "Count": r["count"]} for r in summary["suspicious"][k]], ["Path","Count"])
    with open(out_md, "w", encoding="utf-8") as f: f.write("\n".join(lines))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("logfile", help="nginx access log file (e.g., ./logs/access.log)")
    ap.add_argument("--out", default="./logs/report.md", help="output markdown path")
    ap.add_argument("--json", default="./logs/report.json", help="output json path")
    args = ap.parse_args()
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    os.makedirs(os.path.dirname(args.json), exist_ok=True)
    entries = list(parse_log(args.logfile))
    s = summarize(entries)
    with open(args.json, "w", encoding="utf-8") as jf: json.dump(s, jf, indent=2, ensure_ascii=False)
    write_markdown(s, args.out)
    print(f"Wrote {args.out} and {args.json}")

if __name__ == "__main__":
    main()
