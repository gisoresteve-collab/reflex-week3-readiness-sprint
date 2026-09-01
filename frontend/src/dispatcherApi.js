const API_BASE_URL = "http://localhost:3000/api";

export class ApiError extends Error {
    constructor(message, status, code) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}

async function request(path, options = {}) {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });
    } catch (error) {
        throw new ApiError(
            "Unable to connect to the Reflex backend.",
            0,
            "NETWORK_ERROR"
        );
    }

    let data;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const message =
            data?.error ||
            `Request failed with status ${response.status}`;

        let code = "API_ERROR";

        if (response.status === 404) {
            code = "NOT_FOUND";
        } else if (response.status === 409) {
            code = "CONFLICT";
        } else if (response.status === 400) {
            code = "BAD_REQUEST";
        }

        throw new ApiError(message, response.status, code);
    }

    return data;
}

export async function fetchDeliveries() {
    return request("/deliveries");
}

export async function fetchRiders() {
    return request("/riders");
}

export async function assignRider(deliveryId, riderId) {
    return request(`/deliveries/${encodeURIComponent(deliveryId)}/assign`, {
        method: "POST",
        body: JSON.stringify({
            riderId
        })
    });
}