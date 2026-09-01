import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Add rider directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../rider')))

from api import RiderAPI


class TestRiderWorkflow(unittest.TestCase):

    def setUp(self):
        self.api = RiderAPI(base_url="http://localhost:3000")

    @patch("requests.get")
    def test_get_riders(self, mock_get):
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {"id": "R001", "name": "Linah Ombeki"},
            {"id": "R002", "name": "Brian Otieno"}
        ]
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        riders = self.api.get_riders()
        self.assertEqual(len(riders), 2)
        self.assertEqual(riders[0]["id"], "R001")
        mock_get.assert_called_with("http://localhost:3000/api/riders", timeout=5)

    @patch("requests.get")
    def test_get_assigned_deliveries(self, mock_get):
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {
                "id": "D001",
                "customerName": "Mary Kiliku",
                "customerPhone": "0722000111",
                "deliveryAddress": "Ngong Road",
                "itemDescription": "2x Coffee Maker",
                "status": "ASSIGNED",
                "assignedRider": "R001"
            }
        ]
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        deliveries = self.api.get_assigned_deliveries("R001")
        self.assertEqual(len(deliveries), 1)
        self.assertEqual(deliveries[0]["status"], "ASSIGNED")
        mock_get.assert_called_with("http://localhost:3000/api/riders/R001/deliveries", timeout=5)

    @patch("requests.patch")
    def test_update_status_assigned_to_picked_up(self, mock_patch):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "id": "D001",
            "status": "PICKED_UP"
        }
        mock_response.raise_for_status.return_value = None
        mock_patch.return_value = mock_response

        result = self.api.update_status("D001", "PICKED_UP")
        self.assertEqual(result["status"], "PICKED_UP")
        mock_patch.assert_called_with(
            "http://localhost:3000/api/deliveries/D001/status",
            json={"status": "PICKED_UP"},
            timeout=5
        )

    @patch("requests.patch")
    def test_update_status_picked_up_to_delivered(self, mock_patch):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "id": "D001",
            "status": "DELIVERED"
        }
        mock_response.raise_for_status.return_value = None
        mock_patch.return_value = mock_response

        result = self.api.update_status("D001", "DELIVERED")
        self.assertEqual(result["status"], "DELIVERED")
        mock_patch.assert_called_with(
            "http://localhost:3000/api/deliveries/D001/status",
            json={"status": "DELIVERED"},
            timeout=5
        )


if __name__ == "__main__":
    unittest.main()
