import { useMemo } from 'react';
import { formatNumber, formatBytes } from '../utils/dataProcessor';

// Categories that matter for corporate/accounting
// Office formats track modern vs legacy for migration insights
const FILE_CATEGORIES = {
  pdf: {
    label: 'PDF',
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
  images: {
    label: 'Images',
    color: '#8b5cf6',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'],
    modernExt: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    legacyExt: ['.bmp', '.tiff', '.tif'],
  },
  zip: {
    label: 'Archives',
    color: '#78716c',
    extensions: ['.zip', '.rar', '.7z'],
    modernExt: ['.zip', '.rar', '.7z'],
    legacyExt: [],
  },
};

export default function FileTypeBreakdown({ data }) {
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

    // Convert to array and sort by count (but keep Other at end)
    const categoryOrder = ['pdf', 'excel', 'word', 'powerpoint', 'images', 'zip'];
    categoryOrder.forEach((key) => {
      const catData = categoryData[key];
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

    // Add "Other" category at the end if there are any
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

    return result;
  }, [data.fileTypesList]);

  const maxCount = categories[0]?.count || 1;

  // Horizontal compact layout for overview page
  return (
    <div className="filetype-horizontal">
      <div className="filetype-horizontal-header">
        <h3>File Types</h3>
      </div>
      <div className="filetype-horizontal-grid">
        {categories.map((category) => {
          const barWidth = Math.max(5, (category.count / maxCount) * 100);
          return (
            <div key={category.key} className="filetype-horizontal-item">
              <div className="filetype-horizontal-label">
                <span
                  className="filetype-dot"
                  style={{ backgroundColor: category.color }}
                />
                <span className="filetype-horizontal-name">{category.label}</span>
              </div>
              <div className="filetype-horizontal-bar-wrap">
                <div
                  className="filetype-horizontal-bar"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: category.color,
                  }}
                />
              </div>
              <div className="filetype-horizontal-stats">
                <span className="filetype-horizontal-count">{formatNumber(category.count)}</span>
                <span className="filetype-horizontal-size">{formatBytes(category.sizeBytes)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
