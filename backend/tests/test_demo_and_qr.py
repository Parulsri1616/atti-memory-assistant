import os
import sys
import unittest
import requests
import json

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.config import settings
from app.database import SessionLocal
from app.models import Patient, Person, DailyRoutine, Medication, PersonalItem, LifeEvent, InteractionLog

BASE_URL = os.environ.get("ATTI_TEST_BASE_URL", "http://127.0.0.1:8000/api")

class TestDemoAndQRFunctionality(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        res = requests.get(f"{BASE_URL}/assistant/status", timeout=5)
        assert res.status_code == 200, "Backend not running"
        data = res.json()
        cls.status_data = data

    def test_01_backend_status_exposes_network_url_and_identities(self):
        data = self.status_data
        self.assertEqual(data["status"], "online")
        self.assertEqual(data["patient_name"], "Meera Sharma")
        self.assertEqual(data["caregiver_name"], "Ananya Sharma")
        self.assertIn("lan_ip", data)
        self.assertIn("network_app_url", data)
        self.assertNotIn("localhost", data["network_app_url"])

    def test_02_demo_patient_login_flow(self):
        res = requests.post(f"{BASE_URL}/auth/demo", json={"role": "patient"})
        self.assertEqual(res.status_code, 200, f"Patient demo login failed: {res.text}")
        data = res.json()

        self.assertIn("access_token", data)
        patient = data["patient"]
        self.assertEqual(patient["name"], "Meera Sharma")
        self.assertEqual(patient["call_sign"], "Meera")
        self.assertEqual(patient["role"], "patient")
        self.assertTrue(patient["is_demo"])
        self.assertEqual(patient["age"], 72)
        self.assertEqual(patient["emergency_contact_relation"], "Daughter")
        self.assertEqual(patient["caregiver_name"], "Ananya Sharma")

        # Verify authenticated patient can query their database records
        headers = {"Authorization": f"Bearer {data['access_token']}"}

        # A. People I Know (at least 5 contacts with proper relationships)
        p_res = requests.get(f"{BASE_URL}/memories/people", headers=headers)
        self.assertEqual(p_res.status_code, 200)
        people = p_res.json()
        self.assertGreaterEqual(len(people), 5)
        relationships = [p["relationship"].lower() for p in people]
        self.assertTrue(any("daughter" in r for r in relationships))
        self.assertTrue(any("son" in r for r in relationships))
        self.assertTrue(any("doctor" in r for r in relationships))

        # Check no Auntie/Uncle in people
        for p in people:
            self.assertNotIn("auntie", p["name"].lower())
            self.assertNotIn("uncle", p["name"].lower())
            self.assertNotIn("auntie", p["relationship"].lower())
            self.assertNotIn("uncle", p["relationship"].lower())

        # B. Daily Routines (at least 6 distributed routines)
        r_res = requests.get(f"{BASE_URL}/routines", headers=headers)
        self.assertEqual(r_res.status_code, 200)
        routines = r_res.json()
        self.assertGreaterEqual(len(routines), 6)

        # C. Medications (labeled as fictional demo data)
        m_res = requests.get(f"{BASE_URL}/routines/medications", headers=headers)
        self.assertEqual(m_res.status_code, 200)
        meds = m_res.json()
        self.assertGreaterEqual(len(meds), 3)
        for m in meds:
            combined = f"{m.get('purpose', '')} {m.get('instructions', '')}".lower()
            self.assertTrue("demo" in combined or "demonstration" in combined or "fictional" in combined)

        # D. Personal Items & Memories
        it_res = requests.get(f"{BASE_URL}/memories/items", headers=headers)
        self.assertEqual(it_res.status_code, 200)
        self.assertGreaterEqual(len(it_res.json()), 4)

        ev_res = requests.get(f"{BASE_URL}/memories/events", headers=headers)
        self.assertEqual(ev_res.status_code, 200)
        self.assertGreaterEqual(len(ev_res.json()), 5)

        # E. Voice Assistant Query
        q_res = requests.post(f"{BASE_URL}/assistant/query", json={"query": "Where are my reading glasses?"}, headers=headers)
        self.assertEqual(q_res.status_code, 200)
        q_data = q_res.json()
        self.assertIn("glasses", q_data["answer"].lower())
        self.assertFalse(q_data["is_fallback"])

        # Query about daughter Ananya
        q2_res = requests.post(f"{BASE_URL}/assistant/query", json={"query": "Who is Ananya?"}, headers=headers)
        self.assertEqual(q2_res.status_code, 200)
        q2_data = q2_res.json()
        self.assertIn("daughter", q2_data["answer"].lower())

    def test_03_demo_family_member_login_and_data_association(self):
        res = requests.post(f"{BASE_URL}/auth/demo", json={"role": "family"})
        self.assertEqual(res.status_code, 200, f"Family demo login failed: {res.text}")
        data = res.json()

        self.assertIn("access_token", data)
        patient = data["patient"]
        self.assertEqual(patient["name"], "Ananya Sharma")
        self.assertEqual(patient["email"], "ananya.demo@atti.example")
        self.assertIn(patient["role"], ["caregiver", "family"])
        self.assertEqual(patient["associated_patient_id"], 1)
        self.assertEqual(patient["associated_patient_name"], "Meera Sharma")

        headers = {"Authorization": f"Bearer {data['access_token']}"}

        # Verify family member transparently retrieves associated patient Meera Sharma's data
        r_res = requests.get(f"{BASE_URL}/routines", headers=headers)
        self.assertEqual(r_res.status_code, 200)
        routines = r_res.json()
        self.assertGreaterEqual(len(routines), 6)

        an_res = requests.get(f"{BASE_URL}/logs/analytics", headers=headers)
        self.assertEqual(an_res.status_code, 200)
        an_data = an_res.json()
        self.assertIn("total_queries", an_data)
        self.assertIn("counts", an_data)

    def test_04_caregiver_crud_persists_for_associated_patient(self):
        # Log in as family member Ananya
        login_res = requests.post(f"{BASE_URL}/auth/demo", json={"role": "family"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Create a new personal item for Meera Sharma
        new_item = {
            "item_name": "Test Silver Locket",
            "location": "inside the wooden jewelry box on the vanity mirror",
            "notes": "Gift from husband Anand",
            "keywords": "locket, necklace, silver, jewelry"
        }
        create_res = requests.post(f"{BASE_URL}/memories/items", json=new_item, headers=headers)
        self.assertEqual(create_res.status_code, 200)
        created_item = create_res.json()
        item_id = created_item["id"]

        # 2. Verify it is scoped to patient_id 1 in database
        db = SessionLocal()
        try:
            db_item = db.query(PersonalItem).filter(PersonalItem.id == item_id).first()
            self.assertIsNotNone(db_item)
            self.assertEqual(db_item.patient_id, 1)
            self.assertEqual(db_item.item_name, "Test Silver Locket")
        finally:
            db.close()

        # 3. Clean up created test item
        del_res = requests.delete(f"{BASE_URL}/memories/items/{item_id}", headers=headers)
        self.assertEqual(del_res.status_code, 200)

    def test_05_emergency_profile_public_access_and_verified_details(self):
        # Emergency profile must be accessible publicly without any Authorization header
        res = requests.get(f"{BASE_URL}/auth/emergency-profile/1")
        self.assertEqual(res.status_code, 200, f"Emergency profile failed: {res.text}")
        data = res.json()

        self.assertEqual(data["patient_id"], 1)
        self.assertEqual(data["name"], "Meera Sharma")
        self.assertEqual(data["age"], 72)
        self.assertEqual(data["address"], "24, Green Park, New Delhi")
        self.assertEqual(data["caregiver_name"], "Ananya Sharma")
        self.assertEqual(data["emergency_contact_relation"], "Daughter")
        self.assertEqual(data["caregiver_phone"], "+91 98765 12345")
        self.assertEqual(data["doctor_name"], "Dr. Arjun Mehta")
        self.assertEqual(data["doctor_phone"], "+91 98111 55667")
        self.assertEqual(data["blood_group"], "B+")
        self.assertIn("Mild Cognitive Impairment", data["medical_conditions"])
        self.assertIn("Penicillin", data["allergies"])
        self.assertIn("Ananya Sharma", data["care_instructions"])

        # Zero banned words in the response text
        dumped = json.dumps(data).lower()
        self.assertNotIn("auntie", dumped)
        self.assertNotIn("uncle", dumped)
        self.assertNotIn("rahul", dumped)

    def test_06_qr_code_matrix_generation_and_decodability(self):
        import subprocess

        status_res = requests.get(f"{BASE_URL}/assistant/status")
        network_url = status_res.json().get("network_app_url", "http://192.168.0.3:5173")
        qr_target_url = f"{network_url}/?view=assist&patient_id=1"

        js_code = f"""
const QRCode = require('qrcode');
const jsQR = require('jsqr');

const targetUrl = '{qr_target_url}';
const qrData = QRCode.create(targetUrl, {{ errorCorrectionLevel: 'H' }});
const modules = qrData.modules;
const size = modules.size;
const data = modules.data;

const rgba = new Uint8ClampedArray(size * size * 4);
for (let i = 0; i < size * size; i++) {{
  const val = data[i] ? 0 : 255;
  rgba[i * 4] = val;
  rgba[i * 4 + 1] = val;
  rgba[i * 4 + 2] = val;
  rgba[i * 4 + 3] = 255;
}}

const code = jsQR(rgba, size, size);
if (!code || code.data !== targetUrl) {{
  console.error('Mismatch or decoding failure');
  process.exit(1);
}}
console.log('DECODED_OK:' + code.data);
"""
        frontend_dir = os.path.abspath(os.path.join(backend_dir, "..", "frontend"))
        proc = subprocess.run(["node", "-e", js_code], cwd=frontend_dir, capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, f"QR decoding test failed: {proc.stderr}")
        self.assertIn(f"DECODED_OK:{qr_target_url}", proc.stdout)

if __name__ == "__main__":
    unittest.main()
