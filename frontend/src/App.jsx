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
      const response = await fetch(`${API_BASE_URL}/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create delivery record.');
      }

      setSuccess(`Delivery #${data.id} created successfully with status: ${data.status}!`);

      setFormData({
        customerName: '',
        customerPhone: '',
        deliveryAddress: '',
        itemDescription: ''
      });

      fetchDeliveries();

    } catch (err) {
      setError(err.message || 'Network error: Express backend on port 3000 unavailable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      {/* Header Container with clear bottom spacing */}
      <header style={{ marginBottom: '30px', borderBottom: '2px solid #eaeaea', paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '28px', color: '#1a1a1a', margin: '0 0 8px 0' }}>
          Retailer Workflow - Delivery Request
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Create and submit delivery tasks directly to the central dispatch queue.
        </p>
      </header>

      {/* Notifications */}
      {error && (
        <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ color: '#155724', background: '#d4edda', border: '1px solid #c3e6cb', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      {/* Creation Form Card */}
      <form onSubmit={handleSubmit} style={{ border: '1px solid #e0e0e0', padding: '24px', borderRadius: '8px', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '20px', marginTop: 0, marginBottom: '20px', color: '#333' }}>
          Create New Delivery
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Customer Name *</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Customer Phone *</label>
          <input
            type="text"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Delivery Address *</label>
          <input
            type="text"
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Item Description *</label>
          <textarea
            name="itemDescription"
            value={formData.itemDescription}
            onChange={handleChange}
            rows={3}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            backgroundColor: isSubmitting ? '#6c757d' : '#0d6efd',
            color: '#ffffff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Order'}
        </button>
      </form>
    </div>
  );
}