import { useMemo } from 'react';
import { formatNumber, formatBytes } from '../utils/dataProcessor';

// Categories that matter for corporate/accounting
const FILE_CATEGORIES = {
  pdf: {
    label: 'PDF Documents',
    color: '#ef4444',
    extensions: ['.pdf'],
  },
  excel: {
    label: 'Excel',
    color: '#10b981',
    extensions: ['.xlsx', '.xlsm', '.xlsb', '.xls'],
  },
  word: {
    label: 'Word',
    color: '#3b82f6',
    extensions: ['.docx', '.docm', '.doc'],
  },
  powerpoint: {
    label: 'PowerPoint',
    color: '#f59e0b',
    extensions: ['.pptx', '.pptm', '.ppt'],
  },
  zip: {
    label: 'ZIP Archives',
    color: '#78716c',
    extensions: ['.zip', '.rar', '.7z'],
  },
  images: {
    label: 'Images',
    color: '#8b5cf6',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'],
  },
};

export default function FileTypeBreakdown({ data, inline = false }) {
  // Process file types into the simplified categories
  const categories = useMemo(() => {
    const result = [];
    let otherCount = 0;
    let otherSize = 0;

    // Initialize categories
    const categoryData = {};
    Object.keys(FILE_CATEGORIES).forEach((key) => {
      categoryData[key] = { count: 0, sizeBytes: 0 };
    });

    // Categorize each file type
    data.fileTypesList.forEach((fileType) => {
      const ext = fileType.extension.toLowerCase();
      let found = false;

      for (const [catKey, catDef] of Object.entries(FILE_CATEGORIES)) {
        if (catDef.extensions.includes(ext)) {
          categoryData[catKey].count += fileType.count;
          categoryData[catKey].sizeBytes += fileType.sizeBytes;
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
                <span className="filetype-count-inline">{formatNumber(category.count)}</span>
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
                      <span className="filetype-count">{formatNumber(category.count)}</span>
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
