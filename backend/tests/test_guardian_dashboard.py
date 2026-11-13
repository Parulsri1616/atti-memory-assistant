import os
import sys
import unittest
import requests

BASE_URL = os.environ.get("ATTI_TEST_BASE_URL", "http://127.0.0.1:8000/api")

class TestGuardianDashboard(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # 1. Login as demo family caregiver
        login_res = requests.post(f"{BASE_URL}/auth/demo", json={"role": "family"}, timeout=5)
        assert login_res.status_code == 200, f"Caregiver demo login failed: {login_res.text}"
        data = login_res.json()
        cls.token = data.get("access_token") or data.get("token")
        assert cls.token, "No access token received"
        cls.headers = {"Authorization": f"Bearer {cls.token}"}

    def test_01_overview_endpoint(self):
        res = requests.get(f"{BASE_URL}/guardian/overview", headers=self.headers, timeout=5)
        self.assertEqual(res.status_code, 200, f"Overview failed: {res.text}")
        data = res.json()
        self.assertIn("patient", data)
        self.assertEqual(data["patient"]["name"], "Meera Sharma")
        self.assertIn("safety_status", data)
        self.assertIn("activity_summary", data)
        self.assertIn("upcoming_medications", data)
        self.assertIn("upcoming_appointments", data)
        self.assertIn("refill_reminders", data)
        self.assertIn("recent_sos_alerts", data)

    def test_02_patient_profile_update(self):
        res = requests.get(f"{BASE_URL}/guardian/patient-profile", headers=self.headers, timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["call_sign"], "Meera")

        # Update communication preferences
        update_res = requests.put(
            f"{BASE_URL}/guardian/patient-profile",
            headers=self.headers,
            json={"preferred_language": "Hindi & English", "communication_preferences": "Gentle, calm reminders"},
            timeout=5
        )
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.json()["preferred_language"], "Hindi & English")

    def test_03_medication_intake_tracking_separate_status(self):
        # 1. Get medications
        res = requests.get(f"{BASE_URL}/guardian/medications", headers=self.headers, timeout=5)
        self.assertEqual(res.status_code, 200)
        meds = res.json()
        self.assertTrue(len(meds) > 0)
        med_id = meds[0]["id"]
        initial_stock = meds[0].get("current_stock", 30)

        # 2. Record acknowledgment (acknowledged != completed/taken)
        ack_res = requests.post(
            f"{BASE_URL}/guardian/medications/{med_id}/record-intake",
            headers=self.headers,
            json={"status": "acknowledged", "notes": "Patient acknowledged reminder"},
            timeout=5
        )
        self.assertEqual(ack_res.status_code, 200)
        updated_med = ack_res.json()["medication"]
        self.assertEqual(updated_med["last_status"], "acknowledged")
        # Stock should NOT decrement on acknowledgement alone
        self.assertEqual(updated_med["current_stock"], initial_stock)

        # 3. Record confirmed intake (taken/completed)
        take_res = requests.post(
            f"{BASE_URL}/guardian/medications/{med_id}/record-intake",
            headers=self.headers,
            json={"status": "completed", "notes": "Taken with water"},
            timeout=5
        )
        self.assertEqual(take_res.status_code, 200)
        taken_med = take_res.json()["medication"]
        self.assertEqual(taken_med["last_status"], "completed")
        # Stock should decrement by 1 on intake
        self.assertEqual(taken_med["current_stock"], initial_stock - 1)

    def test_04_doctor_appointments_crud(self):
        # Create appointment
        create_res = requests.post(
            f"{BASE_URL}/guardian/appointments",
            headers=self.headers,
            json={
                "doctor_name": "Dr. Ramesh Nair",
                "clinic_or_hospital": "AIIMS New Delhi",
                "appointment_date": "2026-12-10",
                "appointment_time": "10:30 AM",
                "notes": "Neurology review consultation",
                "advance_reminder_hours": 24
            },
            timeout=5
        )
        self.assertEqual(create_res.status_code, 200)
        appt_id = create_res.json()["id"]

        # List appointments
        list_res = requests.get(f"{BASE_URL}/guardian/appointments", headers=self.headers, timeout=5)
        self.assertEqual(list_res.status_code, 200)
        self.assertTrue(any(a["id"] == appt_id for a in list_res.json()))

        # Delete appointment
        del_res = requests.delete(f"{BASE_URL}/guardian/appointments/{appt_id}", headers=self.headers, timeout=5)
        self.assertEqual(del_res.status_code, 200)

    def test_05_daily_activity_status_update(self):
        # Get activities
        res = requests.get(f"{BASE_URL}/guardian/activities", headers=self.headers, timeout=5)
        self.assertEqual(res.status_code, 200)
        acts = res.json()
        self.assertTrue(len(acts) > 0)
        act_id = acts[0]["id"]

        # Update status to completed
        status_res = requests.post(
            f"{BASE_URL}/guardian/activities/{act_id}/status",
            headers=self.headers,
            json={"status": "completed", "notes": "Walk completed in park"},
            timeout=5
        )
        self.assertEqual(status_res.status_code, 200)
        self.assertEqual(status_res.json()["routine"]["status"], "completed")

    def test_06_safe_zone_and_location(self):
        sz_res = requests.get(f"{BASE_URL}/guardian/safe-zone", headers=self.headers, timeout=5)
        self.assertEqual(sz_res.status_code, 200)
        self.assertEqual(sz_res.json()["name"], "Home Safe Zone")

        # Update radius
        update_sz = requests.put(
            f"{BASE_URL}/guardian/safe-zone",
            headers=self.headers,
            json={"radius_meters": 600},
            timeout=5
        )
        self.assertEqual(update_sz.status_code, 200)
        self.assertEqual(update_sz.json()["radius_meters"], 600)

    def test_07_memories_places_and_facts(self):
        # Test places
        places_res = requests.get(f"{BASE_URL}/guardian/places", headers=self.headers, timeout=5)
        self.assertEqual(places_res.status_code, 200)
        self.assertTrue(len(places_res.json()) > 0)

        # Test memory facts
        facts_res = requests.get(f"{BASE_URL}/guardian/facts", headers=self.headers, timeout=5)
        self.assertEqual(facts_res.status_code, 200)
        self.assertTrue(len(facts_res.json()) > 0)

    def test_08_notifications(self):
        notifs_res = requests.get(f"{BASE_URL}/guardian/notifications", headers=self.headers, timeout=5)
        self.assertEqual(notifs_res.status_code, 200)
        self.assertTrue(isinstance(notifs_res.json(), list))

if __name__ == "__main__":
    unittest.main()
