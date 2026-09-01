import requests


DEFAULT_API_URL = "http://localhost:3000"


class RiderAPI:
    def __init__(self, base_url=DEFAULT_API_URL):
        self.base_url = base_url.rstrip("/")

    def get_riders(self):
        response = requests.get(
            f"{self.base_url}/api/riders",
            timeout=5
        )
        response.raise_for_status()
        return response.json()

    def get_assigned_deliveries(self, rider_id):
        response = requests.get(
            f"{self.base_url}/api/riders/{rider_id}/deliveries",
            timeout=5
        )
        response.raise_for_status()
        return response.json()

    def update_status(self, delivery_id, status):
        response = requests.patch(
            f"{self.base_url}/api/deliveries/{delivery_id}/status",
            json={"status": status},
            timeout=5
        )

        response.raise_for_status()
        return response.json()