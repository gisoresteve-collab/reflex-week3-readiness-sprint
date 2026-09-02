import React, { useState, useEffect } from 'react';

const API_BASE_URL = "http://localhost:3000/api";

export default function App() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    itemDescription: ''
  });

  const [deliveries, setDeliveries] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing deliveries on load so Dispatcher/Retailer can see them
  const fetchDeliveries = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/deliveries`);
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data);
      }
    } catch (err) {
      console.error("Could not fetch deliveries:", err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Validation Requirements
    if (!formData.customerName.trim()) {
      return setError('Customer name is required.');
    }
    if (!formData.customerPhone.trim()) {
      return setError('Customer phone number is required.');
    }
    if (!formData.deliveryAddress.trim()) {
      return setError('Delivery address is required.');
    }
    if (!formData.itemDescription.trim()) {
      return setError('Item description is required.');
    }

    setIsSubmitting(true);

    try {
      // 2. Submit to existing Node.js / Express backend (Port 3000)
      const response = await fetch(`${API_BASE_URL}/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create delivery record.');
      }

      // Success state
      setSuccess(`Delivery #${data.id} created successfully with status: ${data.status}!`);

      // Reset Form
      setFormData({
        customerName: '',
        customerPhone: '',
        deliveryAddress: '',
        itemDescription: ''
      });

      // Refresh list to make visible to Dispatcher view
      fetchDeliveries();

    } catch (err) {
      setError(err.message || 'Network error: Express backend on port 3000 unavailable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>Retailer Workflow - Delivery Request</h1>

      {/* Error & Success Messages */}
      {error && <div style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
      {success && <div style={{ color: 'green', background: '#e6ffe6', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{success}</div>}

      {/* Creation Form */}
      <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: '#fafafa' }}>
        <h3>Create New Delivery</h3>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Customer Name *</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Customer Phone *</label>
          <input
            type="text"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Delivery Address *</label>
          <input
            type="text"
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Item Description *</label>
          <textarea
            name="itemDescription"
            value={formData.itemDescription}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit / Create Delivery'}
        </button>
      </form>

      {/* Live Deliveries List (Visible to Dispatcher/Retailer) */}
      <div style={{ marginTop: '40px' }}>
        <h3>Active Deliveries ({deliveries.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ background: '#f2f2f2', textAlign: 'left' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Customer</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Address</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Item</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '12px', textAlign: 'center' }}>No deliveries found.</td></tr>
            ) : (
              deliveries.map((del) => (
                <tr key={del.id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{del.id}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{del.customerName} ({del.customerPhone})</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{del.deliveryAddress}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{del.itemDescription}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', color: del.status === 'OPEN' ? 'blue' : 'green' }}>
                    {del.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}