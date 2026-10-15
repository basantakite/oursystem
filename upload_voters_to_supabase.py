import sqlite3
import json
import urllib.request
import os
import sys

SUPABASE_URL = "https://bmhbuypigsfhvqxxoyoh.supabase.co"
SUPABASE_KEY = "sb_publishable_1J2kZOka9zrcaHkcGAD5XA_moqVXj2P"
DB_PATH = os.path.abspath(os.path.join("..", "VOTING DATA", "data", "voter_records.db"))

def run_split_upload():
    print(f"Reading records from {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT serial_no, voter_id, name, age, gender, spouse_name, parent_name, booth_name FROM voters")
    rows = cur.fetchall()
    conn.close()

    helambu_voters = []
    gokarneshwor_voters = []

    for r in rows:
        sn, vid, name, age, gender, spouse, parent, booth = r
        if not vid or str(vid).strip() == "मतदाता नं." or not name or str(name).strip() == "नाम थर":
            continue

        gender_clean = "Male" if "पुरुष" in str(gender) else ("Female" if "महिला" in str(gender) else "Other")
        booth_str = str(booth or "").strip()

        # Split: Booth_1 to Helambu, Bot 2 to Gokarneshwor
        if "Booth_1" in booth_str:
            target_tenant = "TNT_HELAMBU"
            ward = 1
        else:
            target_tenant = "TNT_GOKARNESHWOR"
            ward = 5

        notes = json.dumps({
            "tenant_id": target_tenant,
            "spouse_name": str(spouse or "").strip(),
            "father_name": str(parent or "").strip(),
            "booth_name": booth_str,
            "verification_status": "Verified",
            "contact_status": "Not Contacted",
            "support_tier": "swing",
            "current_location": "गाउँमै उपस्थित (On-Ground)",
            "election_day_turnout": "पक्का स्थानीय उपस्थित (Confirmed)"
        }, ensure_ascii=False)

        record = {
            "voter_id": str(vid).strip(),
            "serial_no": str(sn or "").strip(),
            "full_name": str(name).strip(),
            "age": int(age) if str(age).isdigit() else None,
            "gender": gender_clean,
            "ward_no": ward,
            "booth_no": booth_str,
            "tole": "",
            "phone": "",
            "party_leaning": "Undecided",
            "sentiment": "swing",
            "support_level": "Neutral",
            "influence_level": "Normal",
            "notes": notes
        }

        if target_tenant == "TNT_HELAMBU":
            helambu_voters.append(record)
        else:
            gokarneshwor_voters.append(record)

    print(f"Total Prepared: {len(helambu_voters)} for Helambu (TNT_HELAMBU), {len(gokarneshwor_voters)} for Gokarneshwor (TNT_GOKARNESHWOR)")
    
    all_voters = helambu_voters + gokarneshwor_voters
    total = len(all_voters)
    chunk_size = 150
    uploaded = 0

    print(f"Beginning batch upload of {total} voters to Supabase Cloud...")

    for i in range(0, total, chunk_size):
        chunk = all_voters[i:i + chunk_size]
        payload_bytes = json.dumps(chunk, ensure_ascii=False).encode('utf-8')

        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/voters",
            data=payload_bytes,
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json; charset=utf-8",
                "Prefer": "resolution=merge-duplicates"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req) as resp:
                if resp.status in (200, 201, 204):
                    uploaded += len(chunk)
                    pct = round((uploaded / total) * 100)
                    print(f"Uploaded: {uploaded}/{total} ({pct}%)")
                else:
                    print(f"Warning: Status {resp.status} on chunk {i}")
        except Exception as e:
            print(f"Error at chunk starting at {i}: {e}")

    print(f"\n🎉 Successfully uploaded {uploaded} voters to Supabase Cloud!")
    print(f"  - Helambu: {len(helambu_voters)} voters")
    print(f"  - Gokarneshwor: {len(gokarneshwor_voters)} voters")

if __name__ == "__main__":
    run_split_upload()
