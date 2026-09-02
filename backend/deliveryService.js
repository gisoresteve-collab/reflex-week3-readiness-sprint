const { deliveries, riders } = require("../data/store");

const VALID_TRANSITIONS = {
    OPEN: ["ASSIGNED"],
    ASSIGNED: ["PICKED_UP"],
    PICKED_UP: ["DELIVERED"],
    DELIVERED: []
};

// CREATE DELIVERY
function createDelivery(data) {
    const now = new Date().toISOString();

    const delivery = {
        id: `D${String(deliveries.length + 1).padStart(3, "0")}`,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddress: data.deliveryAddress,
        itemDescription: data.itemDescription,
        status: "OPEN",
        assignedRider: null,
        createdAt: now,
        updatedAt: now
    };

    deliveries.push(delivery);
    return delivery;
}

// GET ALL DELIVERIES
function getDeliveries() {
    return deliveries;
}

// GET ONE DELIVERY
function getDelivery(id) {
    return deliveries.find(delivery => delivery.id === id);
}

// GET ALL RIDERS
function getRiders() {
    return riders;
}

// ASSIGN RIDER
function assignRider(deliveryId, riderId) {
    const delivery = getDelivery(deliveryId);
    const rider = riders.find(rider => rider.id === riderId);

    if (!delivery) {
        throw new Error("Delivery not found");
    }

    if (!rider) {
        throw new Error("Rider not found");
    }

    if (delivery.status !== "OPEN") {
        throw new Error("Only OPEN deliveries can be assigned");
    }

    delivery.assignedRider = rider.id;
    delivery.status = "ASSIGNED";
    delivery.updatedAt = new Date().toISOString();

    return delivery;
}

// GET DELIVERIES ASSIGNED TO A RIDER
function getAssignedDeliveries(riderId) {
    const rider = riders.find(rider => rider.id === riderId);

    if (!rider) {
        throw new Error("Rider not found");
    }

    return deliveries.filter(
        delivery => delivery.assignedRider === riderId
    );
}

// UPDATE DELIVERY STATUS
function updateStatus(deliveryId, newStatus) {
    const delivery = getDelivery(deliveryId);

    if (!delivery) {
        throw new Error("Delivery not found");
    }

    const allowedTransitions = VALID_TRANSITIONS[delivery.status] || [];

    if (!allowedTransitions.includes(newStatus)) {
        throw new Error(
            `Invalid status transition: ${delivery.status} -> ${newStatus}`
        );
    }

    delivery.status = newStatus;
    delivery.updatedAt = new Date().toISOString();

    return delivery;
}

// ADMIN SUMMARY
function getAdminSummary() {
    return {
        totalDeliveries: deliveries.length,

        open: deliveries.filter(
            delivery => delivery.status === "OPEN"
        ).length,

        assigned: deliveries.filter(
            delivery => delivery.status === "ASSIGNED"
        ).length,

        pickedUp: deliveries.filter(
            delivery => delivery.status === "PICKED_UP"
        ).length,

        delivered: deliveries.filter(
            delivery => delivery.status === "DELIVERED"
        ).length,

        riders: riders,

        currentAssignments: deliveries
            .filter(delivery => delivery.assignedRider !== null)
            .map(delivery => ({
                deliveryId: delivery.id,
                riderId: delivery.assignedRider,
                status: delivery.status
            }))
    };
}

module.exports = {
    createDelivery,
    getDeliveries,
    getDelivery,
    getRiders,
    assignRider,
    getAssignedDeliveries,
    updateStatus,
    getAdminSummary
};