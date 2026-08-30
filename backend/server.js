const express = require("express");
const cors = require("cors");

const {
    createDelivery,
    getDeliveries,
    getDelivery,
    getRiders,
    assignRider,
    getAssignedDeliveries,
    updateStatus,
    getAdminSummary
} = require("./services/deliveryService");

const app = express();
const PORT = 3000;


// MIDDLEWARE
app.use(cors());
app.use(express.json());


// HEALTH CHECK
app.get("/", (req, res) => {
    res.json({
        message: "Reflex MVP API is running"
    });
});


// CREATE DELIVERY
app.post("/api/deliveries", (req, res) => {
    try {
        const {
            customerName,
            customerPhone,
            deliveryAddress,
            itemDescription
        } = req.body;

        if (
            !customerName ||
            !customerPhone ||
            !deliveryAddress ||
            !itemDescription
        ) {
            return res.status(400).json({
                error: "All delivery fields are required"
            });
        }

        const delivery = createDelivery(req.body);

        res.status(201).json(delivery);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// GET ALL DELIVERIES
app.get("/api/deliveries", (req, res) => {
    res.json(getDeliveries());
});


// GET ONE DELIVERY
app.get("/api/deliveries/:id", (req, res) => {
    const delivery = getDelivery(req.params.id);

    if (!delivery) {
        return res.status(404).json({
            error: "Delivery not found"
        });
    }

    res.json(delivery);
});


// GET ALL RIDERS
app.get("/api/riders", (req, res) => {
    res.json(getRiders());
});

// ADMIN SUMMARY
app.get("/api/admin/summary", (req, res) => {
    try {
        res.json(getAdminSummary());
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});
// GET ASSIGNED DELIVERIES FOR A RIDER
app.get("/api/riders/:riderId/deliveries", (req, res) => {
    try {
        const assignedDeliveries = getAssignedDeliveries(
            req.params.riderId
        );

        res.json(assignedDeliveries);

    } catch (error) {
        res.status(404).json({
            error: error.message
        });
    }
});


// ASSIGN RIDER
app.post("/api/deliveries/:id/assign", (req, res) => {
    try {
        const { riderId } = req.body;

        if (!riderId) {
            return res.status(400).json({
                error: "riderId is required"
            });
        }

        const delivery = assignRider(
            req.params.id,
            riderId
        );

        res.json(delivery);

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});


// UPDATE DELIVERY STATUS
app.patch("/api/deliveries/:id/status", (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                error: "status is required"
            });
        }

        const delivery = updateStatus(
            req.params.id,
            status
        );

        res.json(delivery);

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});


// ADMIN SUMMARY
app.get("/api/admin/summary", (req, res) => {
    try {
        const summary = getAdminSummary();

        res.json(summary);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// START SERVER
app.listen(PORT, () => {
    console.log(
        `Reflex MVP API running on http://localhost:${PORT}`
    );
});