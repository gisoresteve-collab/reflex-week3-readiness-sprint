import React, { useState, useEffect, useCallback } from 'react';
import { fetchDeliveries, fetchRiders, assignRider, ApiError } from './dispatcherApi';

/**
 * DispatcherDashboard
 *
 * Implements MVP-02: Dispatcher Dashboard and Rider Assignment Workflow.
 *
 * Flow:
 *   Retailer creates delivery -> OPEN
 *   -> Dispatcher retrieves deliveries (this component)
 *   -> Dispatcher selects rider for an OPEN delivery
 *   -> POST /deliveries/:id/assign -> delivery becomes ASSIGNED
 *   -> Rider interface (Member 3) reads the same shared delivery record
 *
 * See dispatcherApi.js for the assumed backend contract.
 */
export default function DispatcherDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Per-delivery UI state: which rider is selected, assignment in flight, row-level error/success
  const [selectedRiderByDelivery, setSelectedRiderByDelivery] = useState({});
  const [assigningId, setAssigningId] = useState(null);
  const [rowMessages, setRowMessages] = useState({}); // { [deliveryId]: { type: 'error'|'success', text } }

  const loadData = useCallback(async (opts = {}) => {
    const { silent = false } = opts;
    // `silent` is used for background refreshes triggered after an
    // assignment conflict/not-found error, so we don't blank the table
    // (and the row's error message) behind a full-page loading state.
    if (!silent) {
      setLoading(true);
      setLoadError(null);
    }
    try {
      const [deliveriesData, ridersData] = await Promise.all([fetchDeliveries(), fetchRiders()]);
      setDeliveries(deliveriesData);
      setRiders(ridersData);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Something went wrong loading the dashboard. Please try again.';
      if (silent) {
        // Don't hijack the whole page for a background refresh failure;
        // the row-level error from the triggering action already explains
        // what happened. Just leave the existing (stale) list in place.
      } else {
        setLoadError(message);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

 const availableRiders = riders.filter((r) => r.availability === 'AVAILABLE');
  function setRowMessage(deliveryId, message) {
    setRowMessages((prev) => ({ ...prev, [deliveryId]: message }));
  }

  function clearRowMessage(deliveryId) {
    setRowMessages((prev) => {
      const next = { ...prev };
      delete next[deliveryId];
      return next;
    });
  }

  async function handleAssign(delivery) {
    const deliveryId = delivery?.id;
    const riderId = selectedRiderByDelivery[deliveryId];

    if (!deliveryId) {
      setRowMessage(deliveryId, { type: 'error', text: 'Invalid delivery ID — cannot assign.' });
      return;
    }
    if (delivery.status !== 'OPEN') {
      setRowMessage(deliveryId, {
        type: 'error',
        text: 'This delivery is no longer open for assignment.',
      });
      return;
    }
    if (availableRiders.length === 0) {
      setRowMessage(deliveryId, { type: 'error', text: 'No riders are currently available.' });
      return;
    }
    if (!riderId) {
      setRowMessage(deliveryId, { type: 'error', text: 'Select a rider first.' });
      return;
    }

    setAssigningId(deliveryId);
    clearRowMessage(deliveryId);

    try {
     const updated = await assignRider(deliveryId, riderId);

setDeliveries((prev) =>
  prev.map((d) => (d.id === deliveryId ? updated : d))
);

const assignedRider = riders.find(
  (r) => r.id === updated.assignedRider
);

setRowMessage(deliveryId, {
  type: 'success',
  text: `Assigned to ${assignedRider?.name || 'rider'}.`,
});
      if (err instanceof ApiError && err.code === 'CONFLICT') {
        // Delivery was claimed/changed elsewhere between load and assign — refresh state
        setRowMessage(deliveryId, {
          type: 'error',
          text: err.message || 'This delivery was already assigned by someone else.',
        });
        loadData({ silent: true });
      } else if (err instanceof ApiError && err.code === 'NOT_FOUND') {
        // Don't silently refetch here: if the delivery truly no longer
        // exists, a refresh would remove the row and take the error
        // message with it before the dispatcher can read it. Leave the
        // stale row + message in place; a manual Retry/reload will
        // reconcile the list.
        setRowMessage(deliveryId, { type: 'error', text: err.message });
      } else if (err instanceof ApiError) {
        setRowMessage(deliveryId, { type: 'error', text: err.message });
      } else {
        setRowMessage(deliveryId, {
          type: 'error',
          text: 'Assignment failed unexpectedly. Please try again.',
        });
      }
    } finally {
      setAssigningId(null);
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.statusText}>Loading dashboard…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={styles.page}>
        <div style={styles.errorBanner}>
          <p>{loadError}</p>
          <button style={styles.retryButton} onClick={loadData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const openCount = deliveries.filter((d) => d.status === 'OPEN').length;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Dispatcher Dashboard</h1>
        <div style={styles.summaryRow}>
          <span style={styles.summaryItem}>{deliveries.length} total deliveries</span>
          <span style={{ ...styles.summaryItem, ...styles.openBadge }}>{openCount} open</span>
          <span style={styles.summaryItem}>{availableRiders.length} riders available</span>
        </div>
      </header>

      {deliveries.length === 0 ? (
        <p style={styles.statusText}>No deliveries yet.</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Delivery ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Address</th>
                <th style={styles.th}>Item</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Assigned Rider</th>
                <th style={styles.th}>Assign</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => {
                const isOpen = delivery.status === 'OPEN';
                const rowMsg = rowMessages[delivery.id];
                return (
                  <tr key={delivery.id} data-testid={`delivery-row-${delivery.id}`}>
                    <td style={styles.td}>{delivery.id}</td>
                    <td style={styles.td}>{delivery.customerName}</td>
                    <td style={styles.td}>{delivery.customerPhone}</td>
                    <td style={styles.td}>{delivery.deliveryAddress}</td>
                    <td style={styles.td}>{delivery.itemDescription}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusPill,
                          ...(isOpen ? styles.statusOpen : styles.statusAssigned),
                        }}
                      >
                        {delivery.status}
                      </span>
                    </td>
                    <td style={styles.td}>
  {riders.find((r) => r.id === delivery.assignedRider)?.name || '—'}
</td>
                    <td style={styles.td}>
                      {isOpen ? (
                        <div style={styles.assignCell}>
                          <select
                            aria-label={`Select rider for delivery ${delivery.id}`}
                            value={selectedRiderByDelivery[delivery.id] || ''}
                            onChange={(e) =>
                              setSelectedRiderByDelivery((prev) => ({
                                ...prev,
                                [delivery.id]: e.target.value,
                              }))
                            }
                            disabled={availableRiders.length === 0 || assigningId === delivery.id}
                            style={styles.select}
                          >
                            <option value="">
                              {availableRiders.length === 0 ? 'No riders available' : 'Select rider…'}
                            </option>
                            {availableRiders.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                          <button
                            style={styles.assignButton}
                            disabled={assigningId === delivery.id || availableRiders.length === 0}
                            onClick={() => handleAssign(delivery)}
                          >
                            {assigningId === delivery.id ? 'Assigning…' : 'Assign'}
                          </button>
                          {rowMsg && (
                            <span
                              style={
                                rowMsg.type === 'error' ? styles.rowError : styles.rowSuccess
                              }
                            >
                              {rowMsg.text}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div style={styles.assignCell}>
                          <span style={styles.doneText}>Assigned</span>
                          {rowMsg && (
                            <span
                              style={
                                rowMsg.type === 'error' ? styles.rowError : styles.rowSuccess
                              }
                            >
                              {rowMsg.text}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 1100, margin: '0 auto' },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 8 },
  summaryRow: { display: 'flex', gap: 12 },
  summaryItem: {
    fontSize: 13,
    background: '#f1f3f5',
    padding: '4px 10px',
    borderRadius: 6,
    color: '#333',
  },
  openBadge: { background: '#fff3cd', color: '#7a5b00' },
  statusText: { color: '#555' },
  errorBanner: {
    background: '#fdecea',
    border: '1px solid #f5c2c0',
    color: '#8a1f11',
    padding: 16,
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryButton: {
    background: '#8a1f11',
    color: 'white',
    border: 'none',
    padding: '6px 14px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  tableWrap: { overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    background: '#f8f9fa',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap',
  },
  td: { padding: '10px 12px', borderBottom: '1px solid #f1f3f5', verticalAlign: 'top' },
  statusPill: {
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },
  statusOpen: { background: '#fff3cd', color: '#7a5b00' },
  statusAssigned: { background: '#d4edda', color: '#1e5e2b' },
  assignCell: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180 },
  select: { padding: '4px 6px', borderRadius: 6, border: '1px solid #ccc' },
  assignButton: {
    background: '#2b6cb0',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  rowError: { color: '#c0392b', fontSize: 12 },
  rowSuccess: { color: '#1e5e2b', fontSize: 12 },
  doneText: { color: '#888', fontSize: 12 },
};
