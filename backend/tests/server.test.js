const request = require("supertest");
const app = require("../server");
const { deliveries } = require("../data/store");

describe("Reflex MVP API Endpoints", () => {

    beforeEach(() => {
        deliveries.length = 0;
    });

    describe("GET /", () => {
        it("should return 200 and health check message", async () => {
            const res = await request(app).get("/");
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("message", "Reflex MVP API is running");
        });
    });

    describe("POST /api/deliveries", () => {
        it("should create a new delivery when payload is valid", async () => {
            const payload = {
                customerName: "Jane Doe",
                customerPhone: "+254700000000",
                deliveryAddress: "Westlands, Nairobi",
                itemDescription: "Package"
            };

            const res = await request(app)
                .post("/api/deliveries")
                .send(payload);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty("id");
            expect(res.body.status).toBe("OPEN");
        });

        it("should return 400 if required fields are missing", async () => {
            const res = await request(app)
                .post("/api/deliveries")
                .send({ customerName: "Jane Doe" });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("error", "All delivery fields are required");
        });
    });

    describe("GET /api/deliveries", () => {
        it("should retrieve all deliveries", async () => {
            const res = await request(app).get("/api/deliveries");
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe("PATCH /api/deliveries/:id/status", () => {
        it("should transition status from OPEN to ASSIGNED to PICKED_UP to DELIVERED", async () => {
            const createRes = await request(app)
                .post("/api/deliveries")
                .send({
                    customerName: "John",
                    customerPhone: "+254711111111",
                    deliveryAddress: "CBD",
                    itemDescription: "Documents"
                });

            const deliveryId = createRes.body.id;

            const assignRes = await request(app)
                .post(`/api/deliveries/${deliveryId}/assign`)
                .send({ riderId: "R001" });

            expect(assignRes.statusCode).toEqual(200);
            expect(assignRes.body.status).toBe("ASSIGNED");

            const pickupRes = await request(app)
                .patch(`/api/deliveries/${deliveryId}/status`)
                .send({ status: "PICKED_UP" });

            expect(pickupRes.statusCode).toEqual(200);
            expect(pickupRes.body.status).toBe("PICKED_UP");

            const deliverRes = await request(app)
                .patch(`/api/deliveries/${deliveryId}/status`)
                .send({ status: "DELIVERED" });

            expect(deliverRes.statusCode).toEqual(200);
            expect(deliverRes.body.status).toBe("DELIVERED");
        });

        it("should return 400 for invalid state transitions", async () => {
            const createRes = await request(app)
                .post("/api/deliveries")
                .send({
                    customerName: "Alice",
                    customerPhone: "+254722222222",
                    deliveryAddress: "Kilimani",
                    itemDescription: "Box"
                });

            const deliveryId = createRes.body.id;

            const res = await request(app)
                .patch(`/api/deliveries/${deliveryId}/status`)
                .send({ status: "DELIVERED" });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toContain("Invalid status transition");
        });
    });

    describe("GET /api/admin/summary", () => {
        it("should return administrative statistics summary", async () => {
            const res = await request(app).get("/api/admin/summary");
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("totalDeliveries");
            expect(res.body).toHaveProperty("open");
            expect(res.body).toHaveProperty("currentAssignments");
        });
    });
});