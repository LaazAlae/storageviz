import { useEffect, useState, useMemo } from 'react';

// Format utilities - inline to avoid any import conflicts
function formatByteSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(i > 1 ? 2 : 0)} ${units[i]}`;
}

function formatCount(num) {
  return new Intl.NumberFormat().format(Math.round(num));
}

// Animated counter component
function CounterAnimation({ targetValue, displayFormat = 'count' }) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const animDuration = 800;
    const totalSteps = 30;
    const stepTime = animDuration / totalSteps;
    const stepIncrement = targetValue / totalSteps;
    let stepCount = 0;

    const interval = setInterval(() => {
      stepCount++;
      const newVal = Math.min(targetValue, stepIncrement * stepCount);
      setCurrentValue(newVal);

      if (stepCount >= totalSteps) {
        clearInterval(interval);
        setCurrentValue(targetValue);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [targetValue]);

  if (displayFormat === 'bytes') {
    return formatByteSize(currentValue);
  }
  return formatCount(currentValue);
}

// Tooltip component for info icons
function QuickTip({ tipText }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <span
      className="overview-tip-trigger"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      {showTip && <span className="overview-tip-popup">{tipText}</span>}
    </span>
  );
}

// File category definitions
const CATEGORY_CONFIG = {
  pdf: {
    name: 'PDF',
    color: '#ef4444',
    exts: ['.pdf'],
  },
  excel: {
    name: 'Excel',
    color: '#10b981',
    exts: ['.xlsx', '.xlsm', '.xlsb', '.xls'],
  },
  word: {
    name: 'Word',
    color: '#3b82f6',
    exts: ['.docx', '.docm', '.doc'],
  },
  powerpoint: {
    name: 'PowerPoint',
    color: '#f59e0b',
    exts: ['.pptx', '.pptm', '.ppt'],
  },
  images: {
    name: 'Images',
    color: '#8b5cf6',
    exts: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'],
  },
  archives: {
    name: 'Archives',
    color: '#78716c',
    exts: ['.zip', '.rar', '.7z'],
  },
};

export default function OverviewPanel({ inventoryData, migrationStats }) {
  // Extract metrics from inventory data
  const fileCount = inventoryData?.totalFiles || 0;
  const sizeInBytes = inventoryData?.totalSizeBytes || 0;
  const duplicateInfo = inventoryData?.duplicates || { count: 0, sizeBytes: 0 };
  const oldFileInfo = inventoryData?.olderThan5Years || { count: 0, sizeBytes: 0 };
  const fileTypeList = inventoryData?.fileTypesList || [];

  // Calculate file categories from the file types list
  const categoryBreakdown = useMemo(() => {
    const result = [];
    let uncategorizedCount = 0;
    let uncategorizedSize = 0;

    // Initialize category accumulators
    const catAccum = {};
    Object.keys(CATEGORY_CONFIG).forEach((key) => {
      catAccum[key] = { files: 0, bytes: 0 };
    });

    // Categorize each file type
    fileTypeList.forEach((typeEntry) => {
      const extLower = typeEntry.extension.toLowerCase();
      let matched = false;

      for (const [catKey, catConfig] of Object.entries(CATEGORY_CONFIG)) {
        if (catConfig.exts.includes(extLower)) {
          catAccum[catKey].files += typeEntry.count;
          catAccum[catKey].bytes += typeEntry.sizeBytes;
          matched = true;
          break;
        }
      }

      if (!matched) {
        uncategorizedCount += typeEntry.count;
        uncategorizedSize += typeEntry.sizeBytes;
      }
    });

    // Build output array in fixed order
    const categoryOrder = ['pdf', 'excel', 'word', 'powerpoint', 'images', 'archives'];
    categoryOrder.forEach((catKey) => {
      const accum = catAccum[catKey];
      if (accum.files > 0) {
        result.push({
          id: catKey,
          label: CATEGORY_CONFIG[catKey].name,
          barColor: CATEGORY_CONFIG[catKey].color,
          fileCount: accum.files,
          byteSize: accum.bytes,
        });
      }
    });

    // Add "Other" if any uncategorized files
    if (uncategorizedCount > 0) {
      result.push({
        id: 'other',
        label: 'Other',
        barColor: '#6b7280',
        fileCount: uncategorizedCount,
        byteSize: uncategorizedSize,
      });
    }

    return result;
  }, [fileTypeList]);

  // Find max count for bar scaling
  const maxFileCount = categoryBreakdown.length > 0
    ? Math.max(...categoryBreakdown.map((c) => c.fileCount))
    : 1;

  return (
    <div className="overview-panel">
      {/* Summary Metrics Row */}
      <div className="overview-metrics-row">
        <div className="overview-metric-box">
          <div className="overview-metric-label">Total Files</div>
          <div className="overview-metric-value">
            <CounterAnimation targetValue={fileCount} />
          </div>
          {migrationStats && (
            <div className="overview-metric-sub">
              <span className="overview-positive">{formatCount(migrationStats.migrate.count)}</span> to migrate
            </div>
          )}
        </div>

        <div className="overview-metric-box">
          <div className="overview-metric-label">Total Size</div>
          <div className="overview-metric-value">
            <CounterAnimation targetValue={sizeInBytes} displayFormat="bytes" />
          </div>
          {migrationStats && (
            <div className="overview-metric-sub">
              <span className="overview-positive">{migrationStats.migrate.sizeGB.toFixed(1)} GB</span> to migrate
            </div>
          )}
        </div>

        <div className="overview-metric-box">
          <div className="overview-metric-label">
            Duplicate Files
            <QuickTip tipText="Detected by filename patterns like '-copy', '(1)', 'backup'" />
          </div>
          <div className="overview-metric-value">
            <CounterAnimation targetValue={duplicateInfo.count} />
          </div>
          <div className="overview-metric-sub">
            <span className="overview-positive">{formatByteSize(duplicateInfo.sizeBytes)}</span> recoverable
          </div>
        </div>

        <div className="overview-metric-box">
          <div className="overview-metric-label">
            Files &gt; 5 Years
            <QuickTip tipText="Based on last modified date" />
          </div>
          <div className="overview-metric-value">
            <CounterAnimation targetValue={oldFileInfo.count} />
          </div>
          <div className="overview-metric-sub">
            {formatByteSize(oldFileInfo.sizeBytes)}
          </div>
        </div>
      </div>

      {/* File Categories Grid */}
      <div className="overview-categories-section">
        <h3 className="overview-categories-title">File Types</h3>
        <div className="overview-categories-grid">
          {categoryBreakdown.map((cat) => {
            const barWidthPercent = Math.max(5, (cat.fileCount / maxFileCount) * 100);
            return (
              <div key={cat.id} className="overview-category-row">
                <div className="overview-category-info">
                  <span
                    className="overview-category-dot"
                    style={{ backgroundColor: cat.barColor }}
                  />
                  <span className="overview-category-name">{cat.label}</span>
                </div>
                <div className="overview-category-bar-container">
                  <div
                    className="overview-category-bar"
                    style={{
                      width: `${barWidthPercent}%`,
                      backgroundColor: cat.barColor,
                    }}
                  />
                </div>
                <div className="overview-category-numbers">
                  <span className="overview-category-count">{formatCount(cat.fileCount)}</span>
                  <span className="overview-category-size">{formatByteSize(cat.byteSize)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
