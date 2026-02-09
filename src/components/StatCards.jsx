import { useEffect, useState } from 'react';
import { formatBytes, formatNumber } from '../utils/dataProcessor';
import InfoTooltip from './InfoTooltip';

function AnimatedNumber({ value, format = 'number' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const stepDuration = duration / steps;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(value, increment * step);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  if (format === 'bytes') {
    return formatBytes(displayValue);
  }
  return formatNumber(displayValue);
}

export default function StatCards({ data, thresholdStats }) {
  const {
    totalFiles,
    totalSizeBytes,
    duplicates,
    olderThan5Years,
  } = data;

  return (
    <div className="stat-cards stat-cards-4">
      <div className="stat-card">
        <div className="stat-label">Total Files</div>
        <div className="stat-value">
          <AnimatedNumber value={totalFiles} />
        </div>
        {thresholdStats && (
          <div className="stat-sub">
            <span className="positive">{formatNumber(thresholdStats.migrate.count)}</span> to migrate
          </div>
        )}
      </div>

      <div className="stat-card">
        <div className="stat-label">Total Size</div>
        <div className="stat-value">
          <AnimatedNumber value={totalSizeBytes} format="bytes" />
        </div>
        {thresholdStats && (
          <div className="stat-sub">
            <span className="positive">{thresholdStats.migrate.sizeGB.toFixed(1)} GB</span> to migrate
          </div>
        )}
      </div>

      <div className="stat-card">
        <div className="stat-label-with-info">
          <span>Duplicate Files</span>
          <InfoTooltip text="Flagged based on naming patterns like '-copy', '(1)', 'backup' in filenames. This is a heuristic estimate." />
        </div>
        <div className="stat-value">
          <AnimatedNumber value={duplicates.count} />
        </div>
        <div className="stat-sub">
          <span className="positive">{formatBytes(duplicates.sizeBytes)}</span> recoverable
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label-with-info">
          <span>Files &gt; 5 Years Old</span>
          <InfoTooltip text="Based on each file's last modified date — when the file content was last changed." />
        </div>
        <div className="stat-value">
          <AnimatedNumber value={olderThan5Years.count} />
        </div>
        <div className="stat-sub">
          {formatBytes(olderThan5Years.sizeBytes)}
        </div>
      </div>
    </div>
  );
}
