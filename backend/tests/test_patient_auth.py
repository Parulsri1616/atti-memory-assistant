import os
import sys
import uuid
import time
import unittest
import requests
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta

# Ensure backend directory is in python path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.config import settings
from app.database import SessionLocal
from app.models import Patient, RefreshToken, DailyRoutine, Person

BASE_URL = os.environ.get("ATTI_TEST_BASE_URL", "http://127.0.0.1:8000/api")

class TestPatientAuthentication(unittest.TestCase):
    """
    Automated backend tests covering all 13 authentication and authorization scenarios
    specified in ATTI Secure Patient Authentication requirements.
    """

    @classmethod
    def setUpClass(cls):
        # Quick healthcheck to verify server is reachable
        try:
            res = requests.get(f"{BASE_URL}/assistant/status", timeout=5)
            assert res.status_code == 200
        except Exception as e:
            raise RuntimeError(f"Backend server is not reachable at {BASE_URL}. Ensure it is running: {e}")

    # 1. Successful patient registration
    def test_01_successful_patient_registration(self):
        unique_id = uuid.uuid4().hex[:8]
        cls = self.__class__
        cls.reg_email = f"patient_{unique_id}@atti.care"
        cls.reg_password = "SecurePassword123"
        cls.reg_name = f"Test Patient {unique_id}"

        payload = {
            "name": cls.reg_name,
            "email": cls.reg_email,
            "password": cls.reg_password,
            "confirm_password": cls.reg_password,
            "call_sign": "Dadi",
            "caregiver_name": "Rohan"
        }

        res = requests.post(f"{BASE_URL}/auth/register", json=payload)
        self.assertIn(res.status_code, [200, 201], f"Registration failed: {res.text}")
        data = res.json()

        # Token & schema validations
        self.assertIn("access_token", data)
        self.assertIn("refresh_token", data)
        self.assertEqual(data.get("token_type", "").lower(), "bearer")
        self.assertIn("patient", data)
        self.assertEqual(data["patient"]["email"], cls.reg_email)
        self.assertEqual(data["patient"]["name"], cls.reg_name)
        self.assertEqual(data["patient"]["role"], "patient")
        self.assertEqual(data["patient"]["account_status"], "active")

        # Security check: Password hashes or plaintext passwords must NEVER be in response
        self.assertNotIn("password", data)
        self.assertNotIn("password_hash", data)
        self.assertNotIn("password", data["patient"])
        self.assertNotIn("password_hash", data["patient"])

        # Check Set-Cookie header contains HttpOnly refresh cookie
        cookie_header = res.headers.get("set-cookie", "")
        self.assertIn("atti_refresh_token", cookie_header)
        self.assertIn("HttpOnly", cookie_header)

        cls.patient_1_id = data["patient"]["id"]
        cls.patient_1_access_token = data["access_token"]
        cls.patient_1_refresh_token = data["refresh_token"]

    # 2. Duplicate email registration
    def test_02_duplicate_email_registration(self):
        cls = self.__class__
        payload = {
            "name": "Duplicate Tester",
            "email": cls.reg_email,
            "password": "AnotherPassword456",
            "confirm_password": "AnotherPassword456",
            "call_sign": "Meera",
            "caregiver_name": "Ananya Sharma"
        }
        res = requests.post(f"{BASE_URL}/auth/register", json=payload)
        self.assertEqual(res.status_code, 400)
        self.assertIn("already registered", res.json().get("detail", "").lower())

    # 3. Password hashing verification
    def test_03_password_hashing_verification(self):
        cls = self.__class__
        db = SessionLocal()
        try:
            patient = db.query(Patient).filter(Patient.id == cls.patient_1_id).first()
            self.assertIsNotNone(patient)

            # Check bcrypt hash format ($2b$ or $2a$)
            self.assertTrue(patient.password_hash.startswith(("$2b$", "$2a$")))

            # Verify bcrypt verification passes
            pw_bytes = cls.reg_password.encode("utf-8")
            is_valid = bcrypt.checkpw(pw_bytes, patient.password_hash.encode("utf-8"))
            self.assertTrue(is_valid)

            # Plaintext password must never be in database
            self.assertNotEqual(patient.password_hash, cls.reg_password)
            self.assertNotIn(cls.reg_password, patient.password_hash)
        finally:
            db.close()

    # 4. Successful login
    def test_04_successful_login(self):
        cls = self.__class__
        payload = {
            "email": cls.reg_email,
            "password": cls.reg_password
        }
        res = requests.post(f"{BASE_URL}/auth/login", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertIn("refresh_token", data)
        self.assertEqual(data["patient"]["email"], cls.reg_email)

        # Validate JWT claims
        decoded = jwt.decode(
            data["access_token"],
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        self.assertEqual(decoded.get("sub"), str(cls.patient_1_id))
        self.assertEqual(decoded.get("email"), cls.reg_email)
        self.assertEqual(decoded.get("role"), "patient")
        self.assertEqual(decoded.get("type"), "access")
        self.assertTrue(decoded.get("exp") > int(time.time()))

    # 5. Incorrect password
    def test_05_incorrect_password(self):
        cls = self.__class__
        # Wrong password
        res = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": cls.reg_email, "password": "WrongPassword999"}
        )
        self.assertEqual(res.status_code, 401)
        self.assertIn("Invalid email or password", res.json().get("detail", ""))

        # Non-existent email (must also return identical generic message)
        res_nonexistent = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": "nobody@nowhere.com", "password": "WrongPassword999"}
        )
        self.assertEqual(res_nonexistent.status_code, 401)
        self.assertIn("Invalid email or password", res_nonexistent.json().get("detail", ""))

    # 6. Invalid JWT
    def test_06_invalid_jwt(self):
        headers = {"Authorization": "Bearer malformed.fake.token"}
        res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        self.assertEqual(res.status_code, 401)
        self.assertIn("invalid", res.json().get("detail", "").lower())

    # 7. Expired JWT
    def test_07_expired_jwt(self):
        past_time = datetime.now(timezone.utc) - timedelta(minutes=30)
        expired_payload = {
            "sub": str(self.__class__.patient_1_id),
            "email": self.__class__.reg_email,
            "role": "patient",
            "type": "access",
            "iat": int((past_time - timedelta(minutes=15)).timestamp()),
            "exp": int(past_time.timestamp())
        }
        expired_token = jwt.encode(expired_payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        headers = {"Authorization": f"Bearer {expired_token}"}
        res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        self.assertEqual(res.status_code, 401)
        self.assertIn("expired", res.json().get("detail", "").lower())

    # 8. Refresh-token rotation and reuse detection
    def test_08_refresh_token_rotation_and_reuse_detection(self):
        cls = self.__class__
        # 1. Login to obtain a known initial refresh token
        login_res = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": cls.reg_email, "password": cls.reg_password}
        )
        self.assertEqual(login_res.status_code, 200)
        token_1 = login_res.json()["refresh_token"]

        # 2. First rotation: token_1 -> token_2
        rot_res_1 = requests.post(f"{BASE_URL}/auth/refresh", json={"refresh_token": token_1})
        self.assertEqual(rot_res_1.status_code, 200)
        data_1 = rot_res_1.json()
        token_2 = data_1["refresh_token"]
        self.assertNotEqual(token_1, token_2)

        # 3. Verify new access token works
        me_res = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {data_1['access_token']}"}
        )
        self.assertEqual(me_res.status_code, 200)

        # 4. Attempt to reuse old token_1 (replay attack detection)
        replay_res = requests.post(f"{BASE_URL}/auth/refresh", json={"refresh_token": token_1})
        self.assertEqual(replay_res.status_code, 401)
        self.assertIn("revoked", replay_res.json().get("detail", "").lower())

        # 5. Verify reuse detection invalidated patient tokens
        subsequent_res = requests.post(f"{BASE_URL}/auth/refresh", json={"refresh_token": token_2})
        self.assertEqual(subsequent_res.status_code, 401)

    # 9. Logout and token revocation
    def test_09_logout_and_token_revocation(self):
        cls = self.__class__
        # Login to obtain fresh tokens
        login_res = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": cls.reg_email, "password": cls.reg_password}
        )
        self.assertEqual(login_res.status_code, 200)
        tokens = login_res.json()
        access_tok = tokens["access_token"]
        refresh_tok = tokens["refresh_token"]

        # Logout with access token & refresh token
        logout_res = requests.post(
            f"{BASE_URL}/auth/logout",
            headers={"Authorization": f"Bearer {access_tok}"},
            json={"refresh_token": refresh_tok}
        )
        self.assertEqual(logout_res.status_code, 200)

        # Attempt to refresh using the revoked token must fail
        post_logout_refresh = requests.post(
            f"{BASE_URL}/auth/refresh",
            json={"refresh_token": refresh_tok}
        )
        self.assertEqual(post_logout_refresh.status_code, 401)

    # 10. Unauthenticated access to protected APIs
    def test_10_unauthenticated_access_to_protected_apis(self):
        endpoints = [
            ("GET", f"{BASE_URL}/auth/me"),
            ("GET", f"{BASE_URL}/routines"),
            ("POST", f"{BASE_URL}/routines"),
            ("GET", f"{BASE_URL}/memories/people"),
            ("POST", f"{BASE_URL}/memories/people"),
            ("GET", f"{BASE_URL}/memories/items"),
            ("GET", f"{BASE_URL}/memories/events"),
            ("GET", f"{BASE_URL}/logs"),
            ("GET", f"{BASE_URL}/logs/analytics"),
            ("POST", f"{BASE_URL}/assistant/query"),
        ]

        for method, url in endpoints:
            if method == "GET":
                res = requests.get(url)
            else:
                res = requests.post(url, json={})
            self.assertEqual(
                res.status_code,
                401,
                f"Endpoint {method} {url} should require authentication, returned {res.status_code}"
            )

    # 11. Patient A attempting to access Patient B's records (Data Isolation)
    def test_11_patient_data_isolation(self):
        # Register Patient A
        uid_a = uuid.uuid4().hex[:6]
        res_a = requests.post(f"{BASE_URL}/auth/register", json={
            "name": f"Alice {uid_a}",
            "email": f"alice_{uid_a}@atti.test",
            "password": "PasswordAlice123",
            "confirm_password": "PasswordAlice123",
            "call_sign": "Alice",
            "caregiver_name": "Bob"
        })
        self.assertIn(res_a.status_code, [200, 201])
        tok_a = res_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {tok_a}"}

        # Register Patient B
        uid_b = uuid.uuid4().hex[:6]
        res_b = requests.post(f"{BASE_URL}/auth/register", json={
            "name": f"Bob {uid_b}",
            "email": f"bob_{uid_b}@atti.test",
            "password": "PasswordBob123",
            "confirm_password": "PasswordBob123",
            "call_sign": "Bob",
            "caregiver_name": "Charlie"
        })
        self.assertIn(res_b.status_code, [200, 201])
        tok_b = res_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {tok_b}"}

        # 1. Patient A creates a unique routine and person
        routine_a_res = requests.post(f"{BASE_URL}/routines", headers=headers_a, json={
            "time": "08:30",
            "title": f"Alice Unique Morning Walk {uid_a}",
            "activity": "Walk in the garden",
            "importance": "High"
        })
        self.assertEqual(routine_a_res.status_code, 200)
        routine_a_id = routine_a_res.json()["id"]

        person_a_res = requests.post(f"{BASE_URL}/memories/people", headers=headers_a, json={
            "name": f"Dr. Alice's Neurologist {uid_a}",
            "relationship": "Doctor",
            "notes": "Private medical notes for Alice"
        })
        self.assertEqual(person_a_res.status_code, 200)

        # 2. Patient B queries routines -> Patient A's routine must NOT appear
        routines_b_res = requests.get(f"{BASE_URL}/routines", headers=headers_b)
        self.assertEqual(routines_b_res.status_code, 200)
        b_routine_titles = [r["title"] for r in routines_b_res.json()]
        self.assertNotIn(f"Alice Unique Morning Walk {uid_a}", b_routine_titles)

        # 3. Patient B queries people -> Patient A's doctor must NOT appear
        people_b_res = requests.get(f"{BASE_URL}/memories/people", headers=headers_b)
        self.assertEqual(people_b_res.status_code, 200)
        b_people_names = [p["name"] for p in people_b_res.json()]
        self.assertNotIn(f"Dr. Alice's Neurologist {uid_a}", b_people_names)

        # 4. Patient B attempts to DELETE Patient A's routine
        del_attempt = requests.delete(f"{BASE_URL}/routines/{routine_a_id}", headers=headers_b)
        self.assertEqual(del_attempt.status_code, 404, "Patient B should receive 404 when attempting to delete Patient A's routine")

        # 5. Confirm Patient A's routine is still intact
        routines_a_res = requests.get(f"{BASE_URL}/routines", headers=headers_a)
        a_routine_ids = [r["id"] for r in routines_a_res.json()]
        self.assertIn(routine_a_id, a_routine_ids)

    # 12. Patient Demo authentication
    def test_12_patient_demo_authentication(self):
        res = requests.post(f"{BASE_URL}/auth/demo")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertIn("refresh_token", data)
        self.assertEqual(data["patient"]["email"], "demo@atti.care")
        self.assertEqual(data["patient"]["role"], "patient")
        self.assertEqual(data["patient"]["account_status"], "active")

        # Verify demo access token can read demo routines
        demo_headers = {"Authorization": f"Bearer {data['access_token']}"}
        routines_res = requests.get(f"{BASE_URL}/routines", headers=demo_headers)
        self.assertEqual(routines_res.status_code, 200)
        routines = routines_res.json()
        self.assertTrue(len(routines) > 0, "Demo patient should have pre-loaded routines")

    # 13. Existing assistant, routines, memories and logs functionality after authentication
    def test_13_existing_functionality_after_authentication(self):
        # Authenticate via Demo
        demo_res = requests.post(f"{BASE_URL}/auth/demo")
        self.assertEqual(demo_res.status_code, 200)
        headers = {"Authorization": f"Bearer {demo_res.json()['access_token']}"}

        # 1. Routines & Banner
        banner_res = requests.get(f"{BASE_URL}/routines/current-banner", headers=headers)
        self.assertEqual(banner_res.status_code, 200)
        self.assertIn("time_info", banner_res.json())

        # 2. Memories (People, Items, Events)
        people_res = requests.get(f"{BASE_URL}/memories/people", headers=headers)
        self.assertEqual(people_res.status_code, 200)
        self.assertIsInstance(people_res.json(), list)

        items_res = requests.get(f"{BASE_URL}/memories/items", headers=headers)
        self.assertEqual(items_res.status_code, 200)
        self.assertIsInstance(items_res.json(), list)

        events_res = requests.get(f"{BASE_URL}/memories/events", headers=headers)
        self.assertEqual(events_res.status_code, 200)
        self.assertIsInstance(events_res.json(), list)

        # 3. Assistant query
        query_payload = {
            "query": "What is my routine today?",
            "client_time": "2026-11-12T10:00:00"
        }
        assistant_res = requests.post(f"{BASE_URL}/assistant/query", headers=headers, json=query_payload)
        self.assertEqual(assistant_res.status_code, 200)
        assistant_data = assistant_res.json()
        self.assertIn("answer", assistant_data)
        self.assertIn("intent", assistant_data)
        self.assertIn("sources", assistant_data)

        # 4. Logs and Analytics
        logs_res = requests.get(f"{BASE_URL}/logs", headers=headers)
        self.assertEqual(logs_res.status_code, 200)
        self.assertIsInstance(logs_res.json(), list)

        analytics_res = requests.get(f"{BASE_URL}/logs/analytics", headers=headers)
        self.assertEqual(analytics_res.status_code, 200)
        self.assertIn("total_queries", analytics_res.json())

if __name__ == "__main__":
    unittest.main()
