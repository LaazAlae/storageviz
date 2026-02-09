import { useState, useCallback } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatNumber, formatBytes } from '../utils/dataProcessor';

// Convert months to years with one decimal
const monthsToYears = (months) => (months / 12).toFixed(1);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const years = monthsToYears(label);

  return (
    <div className="custom-chart-tooltip">
      <div className="tooltip-header">{years} years</div>
      <div className="tooltip-body">
        {payload.map((entry, i) => (
          <div key={i} className="tooltip-row">
            <span className="tooltip-dot" style={{ backgroundColor: entry.color }} />
            <span className="tooltip-label">{entry.name}</span>
            <span className="tooltip-value">{entry.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
      <div className="tooltip-hint">Click to set threshold</div>
    </div>
  );
};

export default function MigrationCurve({ data, threshold, onThresholdChange, maxMonths, thresholdStats }) {
  const [hoverMonth, setHoverMonth] = useState(null);

  // Handle chart click - use activeLabel for exact X position
  const handleChartClick = useCallback((chartData) => {
    if (chartData && chartData.activeLabel !== undefined) {
      onThresholdChange(chartData.activeLabel);
    }
  }, [onThresholdChange]);

  // Handle chart mouse move for hover line
  const handleChartMouseMove = useCallback((chartData) => {
    if (chartData && chartData.activeLabel !== undefined) {
      setHoverMonth(chartData.activeLabel);
    }
  }, []);

  const handleChartMouseLeave = useCallback(() => {
    setHoverMonth(null);
  }, []);

  // Generate appropriate X-axis ticks (in months, but we'll format as years)
  const generateTicks = () => {
    const ticks = [];
    // Generate ticks at year intervals (12 months)
    const yearStep = maxMonths <= 60 ? 1 : maxMonths <= 120 ? 2 : 3;
    const monthStep = yearStep * 12;
    for (let i = 0; i <= maxMonths; i += monthStep) {
      ticks.push(i);
    }
    return ticks;
  };

  // Format X-axis tick labels as years
  const formatXAxisTick = (months) => {
    const years = months / 12;
    if (years === 0) return '0';
    if (Number.isInteger(years)) return `${years}y`;
    return `${years.toFixed(1)}y`;
  };

  const thresholdYears = monthsToYears(threshold);

  return (
    <div className="section">
      <div className="section-header">
        <h2>Migration Threshold</h2>
        <span className="section-badge">Click to set</span>
      </div>

      <div className="chart-container">
        <div className="chart-wrapper" style={{ cursor: 'crosshair' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 30, left: 60, bottom: 40 }}
              onClick={handleChartClick}
              onMouseMove={handleChartMouseMove}
              onMouseLeave={handleChartMouseLeave}
            >
              <defs>
                <linearGradient id="fileGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2e" />

              <XAxis
                dataKey="month"
                stroke="#6b6b70"
                tick={{ fill: '#a0a0a5', fontSize: 12 }}
                tickLine={{ stroke: '#6b6b70' }}
                ticks={generateTicks()}
                tickFormatter={formatXAxisTick}
                label={{
                  value: 'Years since last modified',
                  position: 'bottom',
                  offset: 0,
                  fill: '#6b6b70',
                  fontSize: 12,
                }}
              />

              <YAxis
                stroke="#6b6b70"
                tick={{ fill: '#a0a0a5', fontSize: 12 }}
                tickLine={{ stroke: '#6b6b70' }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="filePercent"
                name="Files"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#fileGradient)"
              />

              <Line
                type="monotone"
                dataKey="sizePercent"
                name="Size"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />

              {/* Hover indicator line (gray, dashed) */}
              {hoverMonth !== null && hoverMonth !== threshold && (
                <ReferenceLine
                  x={hoverMonth}
                  stroke="#6b6b70"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              )}

              {/* Locked threshold line (accent color, solid) */}
              <ReferenceLine
                x={threshold}
                stroke="#10b981"
                strokeWidth={3}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Threshold Stats Display */}
        <div className="threshold-stats">
          <div className="threshold-stats-group">
            <div className="threshold-stat migrate">
              <div className="threshold-stat-header">
                <span className="threshold-stat-dot migrate-dot" />
                <span>Migrate to SharePoint</span>
              </div>
              <div className="threshold-stat-detail">
                Files modified within the last <strong>{thresholdYears} years</strong>
              </div>
              <div className="threshold-stat-values">
                <span className="threshold-stat-count">{formatNumber(thresholdStats?.migrate?.count || 0)} files</span>
                <span className="threshold-stat-size">{formatBytes(thresholdStats?.migrate?.sizeBytes || 0)}</span>
                <span className="threshold-stat-percent">{(thresholdStats?.migrate?.percent || 0).toFixed(1)}%</span>
              </div>
            </div>

            <div className="threshold-stat archive">
              <div className="threshold-stat-header">
                <span className="threshold-stat-dot archive-dot" />
                <span>Send to Cold Storage</span>
              </div>
              <div className="threshold-stat-detail">
                Files older than <strong>{thresholdYears} years</strong>
              </div>
              <div className="threshold-stat-values">
                <span className="threshold-stat-count">{formatNumber(thresholdStats?.archive?.count || 0)} files</span>
                <span className="threshold-stat-size">{formatBytes(thresholdStats?.archive?.sizeBytes || 0)}</span>
                <span className="threshold-stat-percent">{(thresholdStats?.archive?.percent || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
