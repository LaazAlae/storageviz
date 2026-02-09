import { useMemo } from 'react';
import { formatNumber, formatBytes } from '../utils/dataProcessor';

// Categories that matter for corporate/accounting
// Office formats track modern vs legacy for migration insights
const FILE_CATEGORIES = {
  pdf: {
    label: 'PDF Documents',
    color: '#ef4444',
    extensions: ['.pdf'],
    modernExt: ['.pdf'],
    legacyExt: [],
  },
  excel: {
    label: 'Excel',
    color: '#10b981',
    extensions: ['.xlsx', '.xlsm', '.xlsb', '.xls'],
    modernExt: ['.xlsx', '.xlsm', '.xlsb'],
    legacyExt: ['.xls'],
  },
  word: {
    label: 'Word',
    color: '#3b82f6',
    extensions: ['.docx', '.docm', '.doc'],
    modernExt: ['.docx', '.docm'],
    legacyExt: ['.doc'],
  },
  powerpoint: {
    label: 'PowerPoint',
    color: '#f59e0b',
    extensions: ['.pptx', '.pptm', '.ppt'],
    modernExt: ['.pptx', '.pptm'],
    legacyExt: ['.ppt'],
  },
  zip: {
    label: 'ZIP Archives',
    color: '#78716c',
    extensions: ['.zip', '.rar', '.7z'],
    modernExt: ['.zip', '.rar', '.7z'],
    legacyExt: [],
  },
  images: {
    label: 'Images',
    color: '#8b5cf6',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'],
    modernExt: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    legacyExt: ['.bmp', '.tiff', '.tif'],
  },
};

export default function FileTypeBreakdown({ data, inline = false }) {
  // Process file types into the simplified categories with modern/legacy breakdown
  const categories = useMemo(() => {
    const result = [];
    let otherCount = 0;
    let otherSize = 0;

    // Initialize categories with modern/legacy tracking
    const categoryData = {};
    Object.keys(FILE_CATEGORIES).forEach((key) => {
      categoryData[key] = {
        count: 0,
        sizeBytes: 0,
        modernCount: 0,
        legacyCount: 0,
      };
    });

    // Categorize each file type
    data.fileTypesList.forEach((fileType) => {
      const ext = fileType.extension.toLowerCase();
      let found = false;

      for (const [catKey, catDef] of Object.entries(FILE_CATEGORIES)) {
        if (catDef.extensions.includes(ext)) {
          categoryData[catKey].count += fileType.count;
          categoryData[catKey].sizeBytes += fileType.sizeBytes;

          // Track modern vs legacy
          if (catDef.modernExt.includes(ext)) {
            categoryData[catKey].modernCount += fileType.count;
          } else if (catDef.legacyExt.includes(ext)) {
            categoryData[catKey].legacyCount += fileType.count;
          }

          found = true;
          break;
        }
      }

      if (!found) {
        otherCount += fileType.count;
        otherSize += fileType.sizeBytes;
      }
    });

    // Convert to array and sort by count
    Object.entries(categoryData).forEach(([key, catData]) => {
      if (catData.count > 0) {
        result.push({
          key,
          label: FILE_CATEGORIES[key].label,
          color: FILE_CATEGORIES[key].color,
          count: catData.count,
          sizeBytes: catData.sizeBytes,
          modernCount: catData.modernCount,
          legacyCount: catData.legacyCount,
          hasBreakdown: catData.modernCount > 0 && catData.legacyCount > 0,
        });
      }
    });

    // Add "Other" category if there are any
    if (otherCount > 0) {
      result.push({
        key: 'other',
        label: 'Other',
        color: '#6b7280',
        count: otherCount,
        sizeBytes: otherSize,
        modernCount: 0,
        legacyCount: 0,
        hasBreakdown: false,
      });
    }

    // Sort by count descending
    result.sort((a, b) => b.count - a.count);

    return result;
  }, [data.fileTypesList]);

  const maxCount = categories[0]?.count || 1;

  // When inline, render as a compact section within another page
  if (inline) {
    return (
      <div className="section filetype-section-inline">
        <div className="section-header">
          <h2>File Types</h2>
        </div>
        <div className="filetype-grid-inline">
          {categories.map((category) => {
            const barWidth = (category.count / maxCount) * 100;
            return (
              <div key={category.key} className="filetype-row-inline">
                <span
                  className="filetype-dot"
                  style={{ backgroundColor: category.color }}
                />
                <span className="filetype-name-inline">{category.label}</span>
                <div className="filetype-bar-container-inline">
                  <div
                    className="filetype-bar"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
                <span className="filetype-count-inline">
                  {formatNumber(category.count)}
                  {category.hasBreakdown && (
                    <span className="filetype-breakdown">
                      ({formatNumber(category.modernCount)} modern / {formatNumber(category.legacyCount)} legacy)
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="page-section" id="section-filetypes">
      <div className="section-inner">
        <div className="section">
          <div className="section-header">
            <h2>File Type Breakdown</h2>
          </div>

          <div className="filetype-container">
            <div className="filetype-grid">
              {categories.map((category) => {
                const barWidth = (category.count / maxCount) * 100;

                return (
                  <div key={category.key} className="filetype-row">
                    <div className="filetype-label">
                      <span
                        className="filetype-dot"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="filetype-name-full">{category.label}</span>
                    </div>
                    <div className="filetype-bar-container">
                      <div
                        className="filetype-bar"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                    <div className="filetype-stats">
                      <span className="filetype-count">
                        {formatNumber(category.count)}
                        {category.hasBreakdown && (
                          <span className="filetype-breakdown-full">
                            ({formatNumber(category.modernCount)} / {formatNumber(category.legacyCount)})
                          </span>
                        )}
                      </span>
                      <span className="filetype-size">{formatBytes(category.sizeBytes)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="filetype-summary">
              <div className="filetype-summary-item">
                <span className="filetype-summary-label">Total File Types</span>
                <span className="filetype-summary-value">{data.fileTypesList.length}</span>
              </div>
              <div className="filetype-summary-item">
                <span className="filetype-summary-label">Categories Shown</span>
                <span className="filetype-summary-value">{categories.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
