const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory delivery store
const deliveries = [];

// API Endpoint: GET /api/deliveries
app.get("/api/deliveries", (req, res) => {
    res.status(200).json(deliveries);
});

// API Endpoint: POST /api/deliveries (Retailer Delivery Creation)
app.post("/api/deliveries", (req, res) => {
    const { customerName, customerPhone, deliveryAddress, itemDescription } = req.body;

    if (!customerName || !customerPhone || !deliveryAddress || !itemDescription) {
        return res.status(400).json({ 
            error: "All fields are required: customerName, customerPhone, deliveryAddress, itemDescription" 
        });
    }

    const timestamp = new Date().toISOString();
    const newDelivery = {
        id: `DEL-${Date.now()}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        itemDescription: itemDescription.trim(),
        status: "OPEN",
        assignedRiderId: null,
        createdAt: timestamp,
        updatedAt: timestamp,
        history: [{ status: "OPEN", timestamp, note: "Delivery created by Retailer" }]
    };

    deliveries.push(newDelivery);
    res.status(201).json(newDelivery);
});

// Serve frontend UI directly
app.get("/", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reflex MVP - Retailer Portal</title>
        <style>
          body { font-family: sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px; }
          .form-group { margin-bottom: 12px; }
          label { display: block; font-weight: bold; margin-bottom: 4px; }
          input, textarea { width: 100%; padding: 8px; box-sizing: border-box; }
          button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
          .error { color: red; background: #ffe6e6; padding: 10px; margin-bottom: 15px; display: none; }
          .success { color: green; background: #e6ffe6; padding: 10px; margin-bottom: 15px; display: none; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>Retailer Delivery Creation Form</h2>
        <div id="error" class="error"></div>
        <div id="success" class="success"></div>

        <form id="deliveryForm">
          <div class="form-group">
            <label>Customer Name *</label>
            <input type="text" id="customerName">
          </div>
          <div class="form-group">
            <label>Customer Phone *</label>
            <input type="text" id="customerPhone">
          </div>
          <div class="form-group">
            <label>Delivery Address *</label>
            <input type="text" id="deliveryAddress">
          </div>
          <div class="form-group">
            <label>Item Description *</label>
            <textarea id="itemDescription"></textarea>
          </div>
          <button type="submit">Submit / Create Delivery</button>
        </form>

        <h3>Active Deliveries (Dispatcher View)</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Address</th>
              <th>Item</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="deliveryTable">
            <tr><td colSpan="5" style="text-align: center;">No deliveries found.</td></tr>
          </tbody>
        </table>

        <script>
          const form = document.getElementById('deliveryForm');
          const errorDiv = document.getElementById('error');
          const successDiv = document.getElementById('success');

          async function loadDeliveries() {
            const res = await fetch('/api/deliveries');
            const data = await res.json();
            const tbody = document.getElementById('deliveryTable');
            if (data.length === 0) return;
            tbody.innerHTML = data.map(d => \`
              <tr>
                <td>\${d.id}</td>
                <td>\${d.customerName} (\${d.customerPhone})</td>
                <td>\${d.deliveryAddress}</td>
                <td>\${d.itemDescription}</td>
                <td><strong>\${d.status}</strong></td>
              </tr>
            \`).join('');
          }

          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';

            const payload = {
              customerName: document.getElementById('customerName').value.trim(),
              customerPhone: document.getElementById('customerPhone').value.trim(),
              deliveryAddress: document.getElementById('deliveryAddress').value.trim(),
              itemDescription: document.getElementById('itemDescription').value.trim()
            };

            if (!payload.customerName || !payload.customerPhone || !payload.deliveryAddress || !payload.itemDescription) {
              errorDiv.textContent = 'All fields are required!';
              errorDiv.style.display = 'block';
              return;
            }

            try {
              const res = await fetch('/api/deliveries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);

              successDiv.textContent = \`Delivery #\${data.id} created successfully with status: \${data.status}!\`;
              successDiv.style.display = 'block';
              form.reset();
              loadDeliveries();
            } catch (err) {
              errorDiv.textContent = err.message || 'Error connecting to backend.';
              errorDiv.style.display = 'block';
            }
          });

          loadDeliveries();
        </script>
      </body>
      </html>
    `);
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Reflex MVP API running on http://localhost:${PORT}`);
    });
}