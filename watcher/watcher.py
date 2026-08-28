import os
import time
import json
import glob
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

JOURNAL_PATH = os.path.expanduser(r"~\Saved Games\Frontier Developments\Elite Dangerous")
RASPI_BACKEND_URL = "https://nexus-pi:5000/api/event"

def get_latest_journal():
    list_of_files = glob.glob(os.path.join(JOURNAL_PATH, "Journal.*.log"))
    if not list_of_files:
        return None
    return max(list_of_files, key=os.path.getctime)

def main():
    global f
    print("=== ED-Cetera Watcher (All-Pass Mode) gestartet ===")
    current_journal = None

    while True:
        latest_journal = get_latest_journal()
        if latest_journal != current_journal:
            current_journal = latest_journal
            print(f"[*] Wechsle zu Journal: {current_journal}")
            f = open(current_journal, "r", encoding="utf-8")
            f.seek(0, os.SEEK_END) # Nur neue Events ab Start lesen

        try:
            line = f.readline()
            if not line:
                time.sleep(0.5)
                continue

            line = line.strip()
            if not line:
                continue

            event = json.loads(line)
            requests.post(RASPI_BACKEND_URL, json=event, timeout=1, verify=False)

        except (json.JSONDecodeError, FileNotFoundError):
            time.sleep(1)
        except requests.exceptions.RequestException:
            # Raspi evtl. offline? Kurz warten, nicht abstürzen.
            time.sleep(2)
        except KeyboardInterrupt:
            print("\n[*] Watcher beendet.")
            break

if __name__ == "__main__":
    main()