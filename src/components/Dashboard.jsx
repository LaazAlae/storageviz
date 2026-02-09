import { useState, useMemo } from 'react';
import StatCards from './StatCards';
import MigrationCurve from './MigrationCurve';
import AgeHistogram from './AgeHistogram';
import WastePanel from './WastePanel';
import CostSimulator from './CostSimulator';
import { getThresholdStats, formatNumber } from '../utils/dataProcessor';

export default function Dashboard({ data, onReset }) {
  // Default threshold to 24 months (2 years)
  const [threshold, setThreshold] = useState(() => {
    return Math.min(24, data.maxMonthsAge);
  });

  const thresholdStats = useMemo(() => {
    return getThresholdStats(data, threshold);
  }, [data, threshold]);

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1>StorageViz</h1>
          <span>{formatNumber(data.totalFiles)} files analyzed</span>
        </div>
        <button className="reset-button" onClick={onReset}>
          Upload New File
        </button>
      </header>

      <StatCards data={data} thresholdStats={thresholdStats} />

      <MigrationCurve
        data={data.cumulativeData}
        threshold={threshold}
        onThresholdChange={setThreshold}
        maxMonths={data.maxMonthsAge}
      />

      <AgeHistogram data={data.ageHistogram} />

      <WastePanel data={data} />

      <CostSimulator thresholdStats={thresholdStats} />
    </div>
  );
}
