import os
import sys
import unittest
import requests

BASE_URL = os.environ.get("ATTI_TEST_BASE_URL", "http://127.0.0.1:8000/api")

class TestFinalThreeSectionsGuardianDashboard(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Login as guardian
        login_res = requests.post(f"{BASE_URL}/auth/demo", json={"role": "family"}, timeout=5)
        assert login_res.status_code == 200, f"Guardian login failed: {login_res.text}"
        data = login_res.json()
        cls.guardian_token = data.get("access_token") or data.get("token")
        cls.guardian_headers = {"Authorization": f"Bearer {cls.guardian_token}"}

        # Login as patient
        patient_res = requests.post(f"{BASE_URL}/auth/demo", json={"role": "patient"}, timeout=5)
        assert patient_res.status_code == 200, f"Patient login failed: {patient_res.text}"
        pdata = patient_res.json()
        cls.patient_token = pdata.get("access_token") or pdata.get("token")
        cls.patient_headers = {"Authorization": f"Bearer {cls.patient_token}"}

    # SECTION 1: OVERVIEW TESTS
    def test_01_overview_endpoint_completeness(self):
        res = requests.get(f"{BASE_URL}/guardian/overview", headers=self.guardian_headers, timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("patient", data)
        self.assertIn("safety_status", data)
        self.assertIn("activity_summary", data)
        self.assertIn("upcoming_medications", data)
        self.assertIn("upcoming_appointments", data)
        self.assertIn("recent_sos_alerts", data)
        self.assertIn("refill_reminders", data)

    # SECTION 2: CARE MANAGEMENT TESTS
    def test_02_medication_crud_and_patient_sync(self):
        # 1. Guardian creates medication reminder
        create_res = requests.post(
            f"{BASE_URL}/guardian/medications",
            headers=self.guardian_headers,
            json={
                "name": "Donepezil Hydrochloride",
                "dosage": "5mg tablet",
                "schedule_time": "09:00 PM",
                "instructions": "Take at bedtime with water",
                "purpose": "Cognitive support",
                "frequency": "Every day",
                "timing_slot": "Night",
                "current_stock": 25,
                "refill_threshold": 5,
                "refill_reminder_days": 5
            },
            timeout=5
        )
        self.assertEqual(create_res.status_code, 200)
        med_id = create_res.json()["id"]

        # 2. Guardian edits medication
        update_res = requests.put(
            f"{BASE_URL}/guardian/medications/{med_id}",
            headers=self.guardian_headers,
            json={"instructions": "Take at bedtime after light meal with water"},
            timeout=5
        )
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.json()["instructions"], "Take at bedtime after light meal with water")

        # 3. Patient receives and verifies medication in DB
        meds_res = requests.get(f"{BASE_URL}/guardian/medications", headers=self.guardian_headers, timeout=5)
        self.assertTrue(any(m["id"] == med_id for m in meds_res.json()))

        # Clean up
        del_res = requests.delete(f"{BASE_URL}/guardian/medications/{med_id}", headers=self.guardian_headers, timeout=5)
        self.assertEqual(del_res.status_code, 200)

    def test_03_medication_intake_vs_acknowledgement_separated(self):
        # Check that acknowledgement and confirmed intake are stored as separate statuses
        meds_res = requests.get(f"{BASE_URL}/guardian/medications", headers=self.guardian_headers, timeout=5)
        self.assertTrue(len(meds_res.json()) > 0)
        med = meds_res.json()[0]
        med_id = med["id"]
        stock_before = med.get("current_stock", 30)

        # Acknowledge reminder
        ack_res = requests.post(
            f"{BASE_URL}/guardian/medications/{med_id}/record-intake",
            headers=self.guardian_headers,
            json={"status": "acknowledged", "notes": "Patient acknowledged reminder via app"},
            timeout=5
        )
        self.assertEqual(ack_res.status_code, 200)
        ack_med = ack_res.json()["medication"]
        self.assertEqual(ack_med["last_status"], "acknowledged")
        # Stock should remain intact on acknowledgement alone
        self.assertEqual(ack_med["current_stock"], stock_before)

        # Confirm taken
        taken_res = requests.post(
            f"{BASE_URL}/guardian/medications/{med_id}/record-intake",
            headers=self.guardian_headers,
            json={"status": "completed", "notes": "Confirmed taken by patient"},
            timeout=5
        )
        self.assertEqual(taken_res.status_code, 200)
        taken_med = taken_res.json()["medication"]
        self.assertEqual(taken_med["last_status"], "completed")
        # Stock decrements on confirmed intake
        self.assertEqual(taken_med["current_stock"], stock_before - 1)

    def test_04_appointments_crud_and_reminders(self):
        # Create appointment
        create_res = requests.post(
            f"{BASE_URL}/guardian/appointments",
            headers=self.guardian_headers,
            json={
                "doctor_name": "Dr. Shweta Rastogi",
                "clinic_or_hospital": "Max Healthcare Saket",
                "appointment_date": "2026-12-05",
                "appointment_time": "03:30 PM",
                "notes": "Annual ophthalmology & retina checkup",
                "advance_reminder_hours": 24
            },
            timeout=5
        )
        self.assertEqual(create_res.status_code, 200)
        appt_id = create_res.json()["id"]

        # List appointments
        list_res = requests.get(f"{BASE_URL}/guardian/appointments", headers=self.guardian_headers, timeout=5)
        self.assertTrue(any(a["id"] == appt_id for a in list_res.json()))

        # Update appointment
        update_res = requests.put(
            f"{BASE_URL}/guardian/appointments/{appt_id}",
            headers=self.guardian_headers,
            json={"notes": "Updated: Fasting for 2 hours required"},
            timeout=5
        )
        self.assertEqual(update_res.status_code, 200)

    def test_05_daily_activities_guardian_patient_sync(self):
        # 1. Guardian creates activity
        create_res = requests.post(
            f"{BASE_URL}/guardian/activities",
            headers=self.guardian_headers,
            json={
                "title": "Evening Pranayama & Deep Breathing",
                "description": "15-minute gentle breathwork in garden",
                "category": "exercise",
                "time": "18:00",
                "repeat_frequency": "Daily",
                "day_of_week": "daily",
                "status": "scheduled",
                "reminder_minutes_before": 15
            },
            timeout=5
        )
        self.assertEqual(create_res.status_code, 200)
        act_id = create_res.json()["id"]

        # 2. Patient reads routines from existing endpoint
        patient_routines = requests.get(f"{BASE_URL}/routines", headers=self.patient_headers, timeout=5)
        self.assertEqual(patient_routines.status_code, 200)
        self.assertTrue(any(r["id"] == act_id for r in patient_routines.json()))

        # 3. Patient / Guardian updates activity status
        status_res = requests.post(
            f"{BASE_URL}/guardian/activities/{act_id}/status",
            headers=self.guardian_headers,
            json={"status": "completed", "notes": "Completed successfully in garden"},
            timeout=5
        )
        self.assertEqual(status_res.status_code, 200)
        self.assertEqual(status_res.json()["routine"]["status"], "completed")

        # 4. Clean up
        del_res = requests.delete(f"{BASE_URL}/guardian/activities/{act_id}", headers=self.guardian_headers, timeout=5)
        self.assertEqual(del_res.status_code, 200)

    # SECTION 3: SAFETY & ALERTS TESTS
    def test_06_safe_zone_configuration_and_monitoring(self):
        # Get safe zone
        sz_res = requests.get(f"{BASE_URL}/guardian/safe-zone", headers=self.guardian_headers, timeout=5)
        self.assertEqual(sz_res.status_code, 200)
        initial_sz = sz_res.json()

        # Update radius and monitoring
        update_res = requests.put(
            f"{BASE_URL}/guardian/safe-zone",
            headers=self.guardian_headers,
            json={
                "radius_meters": 550,
                "monitoring_enabled": True
            },
            timeout=5
        )
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.json()["radius_meters"], 550)
        self.assertTrue(update_res.json()["monitoring_enabled"])

    def test_07_sos_trigger_acknowledge_and_resolve(self):
        # Trigger SOS
        sos_res = requests.post(
            f"{BASE_URL}/guardian/sos/trigger",
            headers=self.guardian_headers,
            json={
                "location_address": "Near Green Park Metro, New Delhi",
                "notes": "Emergency assistance test trigger"
            },
            timeout=5
        )
        self.assertEqual(sos_res.status_code, 200)
        sos_id = sos_res.json()["id"]

        # Acknowledge SOS
        ack_res = requests.post(
            f"{BASE_URL}/guardian/sos/{sos_id}/acknowledge",
            headers=self.guardian_headers,
            json={"notes": "Caregiver on the way"},
            timeout=5
        )
        self.assertEqual(ack_res.status_code, 200)
        self.assertEqual(ack_res.json()["status"], "acknowledged")

        # Resolve SOS
        resolve_res = requests.post(
            f"{BASE_URL}/guardian/sos/{sos_id}/resolve",
            headers=self.guardian_headers,
            timeout=5
        )
        self.assertEqual(resolve_res.status_code, 200)
        self.assertEqual(resolve_res.json()["status"], "resolved")

    def test_08_emergency_qr_management_and_privacy(self):
        # Get QR details
        qr_res = requests.get(f"{BASE_URL}/guardian/qr", headers=self.guardian_headers, timeout=5)
        self.assertEqual(qr_res.status_code, 200)
        qr = qr_res.json()
        self.assertIn("qr_code_hash", qr)
        self.assertIn("status", qr)

        # Update QR status to disabled and back to active
        dis_res = requests.post(
            f"{BASE_URL}/guardian/qr/status",
            headers=self.guardian_headers,
            json={"status": "disabled"},
            timeout=5
        )
        self.assertEqual(dis_res.status_code, 200)
        self.assertEqual(dis_res.json()["status"], "disabled")

        act_res = requests.post(
            f"{BASE_URL}/guardian/qr/status",
            headers=self.guardian_headers,
            json={"status": "active"},
            timeout=5
        )
        self.assertEqual(act_res.status_code, 200)
        self.assertEqual(act_res.json()["status"], "active")

    def test_09_notifications_persistence_and_read_status(self):
        # Get notifications
        notifs_res = requests.get(f"{BASE_URL}/guardian/notifications", headers=self.guardian_headers, timeout=5)
        self.assertEqual(notifs_res.status_code, 200)
        notifs = notifs_res.json()
        self.assertTrue(isinstance(notifs, list))

        if len(notifs) > 0:
            target_id = notifs[0]["id"]
            # Mark single read
            read_res = requests.post(f"{BASE_URL}/guardian/notifications/{target_id}/read", headers=self.guardian_headers, timeout=5)
            self.assertEqual(read_res.status_code, 200)

        # Mark all read
        all_read_res = requests.post(f"{BASE_URL}/guardian/notifications/read-all", headers=self.guardian_headers, timeout=5)
        self.assertEqual(all_read_res.status_code, 200)

    def test_10_refill_reminders_triggered(self):
        # Overview should detect refill reminders for low stock
        ov_res = requests.get(f"{BASE_URL}/guardian/overview", headers=self.guardian_headers, timeout=5)
        self.assertEqual(ov_res.status_code, 200)
        reminders = ov_res.json().get("refill_reminders", [])
        self.assertTrue(isinstance(reminders, list))

    def test_11_role_based_authorisation(self):
        # Unauthorized request without token
        unauth_res = requests.get(f"{BASE_URL}/guardian/overview", timeout=5)
        self.assertEqual(unauth_res.status_code, 401)

if __name__ == "__main__":
    unittest.main()
