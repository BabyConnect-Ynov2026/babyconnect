import unittest

from vision.api import app
from vision.goal_detection import GoalDetector


class ApiSmokeTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["status"], "ok")

    def test_status_endpoint(self):
        response = self.client.get("/status")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertIn("detector", payload)
        self.assertIn("events", payload)


class GoalDetectorTests(unittest.TestCase):
    def test_reset_clears_internal_state(self):
        detector = GoalDetector()
        detector._trajectory.extend([(10, 10), (20, 10)])  # noqa: SLF001
        detector.reset()
        self.assertEqual(len(detector._trajectory), 0)  # noqa: SLF001


if __name__ == "__main__":
    unittest.main()
