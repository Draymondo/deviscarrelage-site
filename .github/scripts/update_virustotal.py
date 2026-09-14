import sys, hashlib, os, time, requests, re
from datetime import datetime, timezone

APK_PATH = sys.argv[1]
API_KEY = os.environ["VT_API_KEY"]
HEADERS = {"x-apikey": API_KEY}

MOIS_FR = ["janvier","février","mars","avril","mai","juin","juillet",
           "août","septembre","octobre","novembre","décembre"]

sha256 = hashlib.sha256()
with open(APK_PATH, "rb") as f:
    for chunk in iter(lambda: f.read(8192), b""):
        sha256.update(chunk)
file_hash = sha256.hexdigest()
file_size_mb = os.path.getsize(APK_PATH) / (1024 * 1024)

r = requests.get(f"https://www.virustotal.com/api/v3/files/{file_hash}", headers=HEADERS)

if r.status_code == 200:
    data = r.json()["data"]
    stats = data["attributes"]["last_analysis_stats"]
    scan_ts = data["attributes"]["last_analysis_date"]
else:
    upload_url = requests.get("https://www.virustotal.com/api/v3/files/upload_url", headers=HEADERS).json()["data"]
    with open(APK_PATH, "rb") as f:
        up = requests.post(upload_url, headers=HEADERS, files={"file": f}).json()
    analysis_id = up["data"]["id"]

    stats = None
    for _ in range(30):
        a = requests.get(f"https://www.virustotal.com/api/v3/analyses/{analysis_id}", headers=HEADERS).json()
        if a["data"]["attributes"]["status"] == "completed":
            stats = a["data"]["attributes"]["stats"]
            scan_ts = int(time.time())
            break
        time.sleep(20)
    if stats is None:
        raise SystemExit("Analyse VirusTotal non terminée après 10 minutes.")

total_engines = sum(stats.values())
malicious = stats.get("malicious", 0) + stats.get("suspicious", 0)
dt = datetime.fromtimestamp(scan_ts, tz=timezone.utc)
date_fr = f"{dt.day} {MOIS_FR[dt.month-1]} {dt.year}"
date_en = dt.strftime("%B %d, %Y")
report_url = f"https://www.virustotal.com/gui/file/{file_hash}"

def sub(content, pattern, repl):
    return re.sub(pattern, repl, content)

# --- index.html (FR) ---
if os.path.exists("index.html"):
    with open("index.html", "r", encoding="utf-8") as f:
        c = f.read()
    detection_fr = "0 détection" if malicious == 0 else f"{malicious} détection(s)"
    size_fr = f"{file_size_mb:.2f} Mo".replace(".", ",")
    c = sub(c, r"analysé par \d+ moteurs de sécurité indépendants via VirusTotal — <strong>.*?</strong>",
            f"analysé par {total_engines} moteurs de sécurité indépendants via VirusTotal — <strong>{detection_fr}</strong>")
    c = sub(c, r"Dernière analyse : .*?(?=\n)", f"Dernière analyse : {date_fr}")
    c = sub(c, r"Version analysée : APK [\d,]+ Mo", f"Version analysée : APK {size_fr}")
    c = sub(c, r'href="https://www\.virustotal\.com/gui/file/[a-f0-9]+"', f'href="{report_url}"')
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(c)

# --- en/index.html (EN) ---
if os.path.exists("en/index.html"):
    with open("en/index.html", "r", encoding="utf-8") as f:
        c = f.read()
    detection_en = "0 detections" if malicious == 0 else f"{malicious} detection(s)"
    size_en = f"{file_size_mb:.2f} MB"
    c = sub(c, r"scanned by \d+ independent security engines via VirusTotal — <strong>.*?</strong>",
            f"scanned by {total_engines} independent security engines via VirusTotal — <strong>{detection_en}</strong>")
    c = sub(c, r"Last scan: .*?(?=\n)", f"Last scan: {date_en}")
    c = sub(c, r"Version scanned: [\d.]+ MB APK", f"Version scanned: {size_en} APK")
    c = sub(c, r'href="https://www\.virustotal\.com/gui/file/[a-f0-9]+"', f'href="{report_url}"')
    with open("en/index.html", "w", encoding="utf-8") as f:
        f.write(c)

print(f"OK — {total_engines} moteurs, {malicious} détection(s), hash {file_hash}")
