import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber } from '../utils/dataProcessor';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="custom-chart-tooltip">
      <div className="tooltip-header">{label}</div>
      <div className="tooltip-body">
        {payload.map((entry, i) => (
          <div key={i} className="tooltip-row">
            <span className="tooltip-dot" style={{ backgroundColor: entry.color }} />
            <span className="tooltip-label">{entry.name}</span>
            <span className="tooltip-value">
              {entry.name === 'Files' ? formatNumber(entry.value) : `${entry.value.toFixed(2)} GB`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AgeHistogram({ data }) {
  return (
    <div className="section">
      <div className="section-header">
        <h2>File Age Distribution</h2>
      </div>

      <div className="chart-container">
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 60, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2e" />

              <XAxis
                dataKey="label"
                stroke="#a0a0a5"
                tick={{ fill: '#d0d0d5', fontSize: 12 }}
                tickLine={{ stroke: '#a0a0a5' }}
              />

              <YAxis
                yAxisId="left"
                stroke="#10b981"
                tick={{ fill: '#d0d0d5', fontSize: 12 }}
                tickLine={{ stroke: '#a0a0a5' }}
                tickFormatter={(value) => formatNumber(value)}
                label={{
                  value: 'File Count',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#10b981',
                  fontSize: 12,
                }}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#3b82f6"
                tick={{ fill: '#d0d0d5', fontSize: 12 }}
                tickLine={{ stroke: '#a0a0a5' }}
                tickFormatter={(value) => `${value.toFixed(0)} GB`}
                label={{
                  value: 'Size (GB)',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#3b82f6',
                  fontSize: 12,
                }}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                wrapperStyle={{ outline: 'none' }}
              />

              <Bar
                yAxisId="left"
                dataKey="count"
                name="Files"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />

              <Bar
                yAxisId="right"
                dataKey="sizeGB"
                name="Size"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="histogram-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#10b981' }} />
            <span>File Count (left axis)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#3b82f6' }} />
            <span>Total Size in GB (right axis)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
