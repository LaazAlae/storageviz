import { useState, useCallback } from 'react';
import { formatNumber, formatCurrency, formatCurrencyPrecise } from '../utils/dataProcessor';

// Custom number input with styled steppers
function NumberInput({ value, onChange, step = 0.01, min = 0 }) {
  const increment = useCallback(() => {
    onChange(Math.round((value + step) * 10000) / 10000);
  }, [value, step, onChange]);

  const decrement = useCallback(() => {
    onChange(Math.max(min, Math.round((value - step) * 10000) / 10000));
  }, [value, step, min, onChange]);

  return (
    <div className="number-input-wrapper">
      <input
        type="number"
        className="cost-input"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        min={min}
      />
      <div className="number-input-steppers">
        <button type="button" className="stepper-btn" onClick={increment}>
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 8L6 4L10 8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button type="button" className="stepper-btn" onClick={decrement}>
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 4L6 8L10 4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

const CloudIcon = () => (
  <svg className="cost-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
  </svg>
);

const ArchiveIcon = () => (
  <svg className="cost-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const CalculatorIcon = () => (
  <svg className="cost-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="8" y2="10.01" />
    <line x1="12" y1="10" x2="12" y2="10.01" />
    <line x1="16" y1="10" x2="16" y2="10.01" />
    <line x1="8" y1="14" x2="8" y2="14.01" />
    <line x1="12" y1="14" x2="12" y2="14.01" />
    <line x1="16" y1="14" x2="16" y2="14.01" />
    <line x1="8" y1="18" x2="8" y2="18.01" />
    <line x1="12" y1="18" x2="12" y2="18.01" />
    <line x1="16" y1="18" x2="16" y2="18.01" />
  </svg>
);

export default function CostSimulator({ thresholdStats }) {
  const [sharePointRate, setSharePointRate] = useState(0.20);
  const [coolRate, setCoolRate] = useState(0.01);
  const [archiveRate, setArchiveRate] = useState(0.002);
  const [coldTier, setColdTier] = useState('cool'); // 'cool' or 'archive'

  const { migrate, archive } = thresholdStats;

  const sharePointCost = migrate.sizeGB * sharePointRate;
  const coldStorageRate = coldTier === 'cool' ? coolRate : archiveRate;
  const coldStorageCost = archive.sizeGB * coldStorageRate;

  const monthlyTotal = sharePointCost + coldStorageCost;
  const annualTotal = monthlyTotal * 12;

  return (
    <div className="section">
      <div className="section-header">
        <h2>Cost Simulator</h2>
        <span className="section-badge">Live estimates</span>
      </div>

      <div className="cost-simulator">
        <div className="cost-simulator-grid">
          <div className="cost-section">
            <div className="cost-section-title">
              <CloudIcon />
              SharePoint Migration
            </div>

            <div className="cost-row">
              <span className="cost-label">Files to migrate</span>
              <span className="cost-value">{formatNumber(migrate.count)}</span>
            </div>

            <div className="cost-row">
              <span className="cost-label">Total size</span>
              <span className="cost-value">{migrate.sizeGB.toFixed(2)} GB</span>
            </div>

            <div className="cost-row">
              <span className="cost-label">Rate per GB/month</span>
              <div className="cost-input-group">
                <span className="cost-unit">$</span>
                <NumberInput
                  value={sharePointRate}
                  onChange={setSharePointRate}
                  step={0.01}
                />
              </div>
            </div>

            <div className="cost-row">
              <span className="cost-label">Monthly cost</span>
              <span className="cost-value accent">{formatCurrencyPrecise(sharePointCost)}</span>
            </div>
          </div>

          <div className="cost-section">
            <div className="cost-section-title">
              <ArchiveIcon />
              Cold Storage
            </div>

            <div className="cost-row">
              <span className="cost-label">Files to archive</span>
              <span className="cost-value">{formatNumber(archive.count)}</span>
            </div>

            <div className="cost-row">
              <span className="cost-label">Total size</span>
              <span className="cost-value">{archive.sizeGB.toFixed(2)} GB</span>
            </div>

            <div className="cost-row">
              <span className="cost-label">Cool rate ($/GB/mo)</span>
              <div className="cost-input-group">
                <span className="cost-unit">$</span>
                <NumberInput
                  value={coolRate}
                  onChange={setCoolRate}
                  step={0.001}
                />
              </div>
            </div>

            <div className="cost-row">
              <span className="cost-label">Archive rate ($/GB/mo)</span>
              <div className="cost-input-group">
                <span className="cost-unit">$</span>
                <NumberInput
                  value={archiveRate}
                  onChange={setArchiveRate}
                  step={0.0001}
                />
              </div>
            </div>

            <div className="storage-toggle">
              <button
                className={coldTier === 'cool' ? 'active' : ''}
                onClick={() => setColdTier('cool')}
              >
                Cool Storage
              </button>
              <button
                className={coldTier === 'archive' ? 'active' : ''}
                onClick={() => setColdTier('archive')}
              >
                Archive Storage
              </button>
            </div>

            <div className="cost-row" style={{ marginTop: '1rem' }}>
              <span className="cost-label">Monthly cost</span>
              <span className="cost-value accent">{formatCurrencyPrecise(coldStorageCost)}</span>
            </div>
          </div>

          <div className="cost-section">
            <div className="cost-section-title">
              <CalculatorIcon />
              Summary
            </div>

            <div className="cost-row">
              <span className="cost-label">Migrate to SharePoint</span>
              <span className="cost-value">{migrate.percent.toFixed(1)}%</span>
            </div>

            <div className="cost-row">
              <span className="cost-label">Send to cold storage</span>
              <span className="cost-value">{archive.percent.toFixed(1)}%</span>
            </div>

            <div className="cost-row">
              <span className="cost-label">SharePoint monthly</span>
              <span className="cost-value">{formatCurrencyPrecise(sharePointCost)}</span>
            </div>

            <div className="cost-row">
              <span className="cost-label">{coldTier === 'cool' ? 'Cool' : 'Archive'} storage monthly</span>
              <span className="cost-value">{formatCurrencyPrecise(coldStorageCost)}</span>
            </div>
          </div>
        </div>

        <div className="cost-totals">
          <div className="cost-total-card">
            <div className="cost-total-label">Total Monthly Cost</div>
            <div className="cost-total-value">{formatCurrency(monthlyTotal)}</div>
          </div>
          <div className="cost-total-card highlight">
            <div className="cost-total-label">Total Annual Cost</div>
            <div className="cost-total-value">{formatCurrency(annualTotal)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
