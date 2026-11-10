import React, { useState } from 'react';

export default function StockpileMatrix({
  activeNgoName,
  stockpiles = {},
  onUpdateStockpileItem,
  onNavigateToPledges
}) {
  const currentStockList = stockpiles[activeNgoName] || [];

  const [editItem, setEditItem] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Capacity calculation
  const totalAvailable = currentStockList.reduce((acc, item) => acc + (item.available || 0), 0);
  const totalCapacity = currentStockList.reduce((acc, item) => acc + (item.capacity || 100), 0);
  const totalCommitted = currentStockList.reduce((acc, item) => acc + (item.committed || 0), 0);
  const overallSufficiencyPct = totalCapacity > 0 ? Math.round((totalAvailable / totalCapacity) * 100) : 75;

  const handleQuickAdjust = (item, delta) => {
    const updated = Math.max(0, Math.min(item.capacity, item.available + delta));
    onUpdateStockpileItem(activeNgoName, item.id, updated);
  };

  const handleSaveCustom = (e) => {
    e.preventDefault();
    if (!editItem) return;
    onUpdateStockpileItem(activeNgoName, editItem.id, editValue);
    setEditItem(null);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '28px' }}>
      {/* Matrix Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '24px' }}>📦</span>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-h)' }}>
              Warehouse Stockpile & Knapsack Resource Matrix
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
            Live commodity reserves for <strong>{activeNgoName}</strong>. Automatically evaluated by our greedy resource sufficiency algorithm during emergency aid matching.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {onNavigateToPledges && (
            <button
              type="button"
              className="btn-outline-green"
              onClick={onNavigateToPledges}
              style={{ fontSize: '12px', fontWeight: '700', padding: '6px 14px' }}
            >
              💝 View Community Relief Pledges &rarr;
            </button>
          )}
        </div>
      </div>

      {/* Warehouse Utilization Bar */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Overall Stockpile Sufficiency & Warehouse Fill Ratio
            </span>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginTop: '2px' }}>
              {totalAvailable} / {totalCapacity} Units Available &bull; <span style={{ color: overallSufficiencyPct >= 70 ? '#16a34a' : (overallSufficiencyPct >= 40 ? '#d97706' : '#dc2626') }}>{overallSufficiencyPct}% Sufficiency</span>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#475569' }}>
            Active Field Commitments: <strong style={{ color: '#0284c7' }}>{totalCommitted} units dispatched</strong>
          </div>
        </div>

        <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${overallSufficiencyPct}%`,
              height: '100%',
              backgroundColor: overallSufficiencyPct >= 70 ? '#16a34a' : (overallSufficiencyPct >= 40 ? '#f59e0b' : '#dc2626'),
              borderRadius: '5px',
              transition: 'width 0.4s ease'
            }}
          ></div>
        </div>
      </div>

      {/* Commodity Matrix Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {currentStockList.map(item => {
          const ratio = Math.round((item.available / item.capacity) * 100);
          const isLow = item.available <= item.reorderLevel;

          return (
            <div
              key={item.id}
              style={{
                border: isLow ? '2px solid #fca5a5' : '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                backgroundColor: isLow ? '#fffaf0' : '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: isLow ? '#fee2e2' : '#f0fdf4', color: isLow ? '#991b1b' : '#166534', padding: '2px 6px', borderRadius: '4px' }}>
                    {isLow ? '⚠️ Restock Needed' : '✓ Sufficient'}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                  {item.name}
                </h4>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: isLow ? '#b91c1c' : '#16a34a' }}>
                    {item.available} <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>/ {item.capacity} {item.unit}</span>
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                    {ratio}% Capacity
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ width: `${ratio}%`, height: '100%', backgroundColor: ratio >= 60 ? '#16a34a' : (ratio >= 30 ? '#f59e0b' : '#dc2626'), borderRadius: '3px' }}></div>
                </div>

                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Dispatched: <strong>{item.committed || 0} {item.unit}</strong></span>
                  <span>Safety Buffer: <strong>{item.reorderLevel} {item.unit}</strong></span>
                </div>
              </div>

              {/* Adjust / Restock Actions */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <button
                  type="button"
                  className="btn-outline-green"
                  onClick={() => {
                    setEditItem(item);
                    setEditValue(item.available);
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  Manage Warehouse Inventory &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Value Modal */}
      {editItem && (
        <div className="modal-backdrop-clean" onClick={() => setEditItem(null)}>
          <div className="modal-card-pro" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%' }}>
            <button
              type="button"
              className="modal-dismiss-btn"
              onClick={() => setEditItem(null)}
            >
              ✕
            </button>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '800' }}>
              Adjust Stock: {editItem.name}
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--text-muted)' }}>
              Set current available stock level in warehouse (Capacity: {editItem.capacity} {editItem.unit})
            </p>

            <form onSubmit={handleSaveCustom}>
              <div className="form-field" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  Available Quantity ({editItem.unit}):
                </label>
                <input
                  type="number"
                  min="0"
                  max={editItem.capacity}
                  className="input-control"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-card-secondary"
                  onClick={() => setEditItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-card-primary"
                >
                  Save Stockpile Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
