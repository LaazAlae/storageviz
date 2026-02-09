// Data processing utilities for StorageViz

export function processCSVData(data) {
  const processed = {
    totalFiles: data.length,
    totalSizeBytes: 0,
    duplicates: { count: 0, sizeBytes: 0 },
    tempFiles: { count: 0, sizeBytes: 0 },
    emptyFiles: { count: 0, sizeBytes: 0 },
    legacyFormats: { count: 0, sizeBytes: 0 },
    olderThan5Years: { count: 0, sizeBytes: 0 },
    incompatibleFiles: { count: 0, sizeBytes: 0 },
    files: [],
    ageHistogram: [],
    cumulativeData: [],
    maxMonthsAge: 0,
    fileTypes: {},
  };

  // Legacy extensions to detect
  const legacyExtensions = ['.xls', '.doc', '.ppt'];

  // Process each file
  data.forEach(file => {
    const sizeBytes = parseFloat(file.SizeBytes) || 0;
    const yearsSinceModified = parseFloat(file.YearsSinceModified) || 0;
    const daysSinceModified = parseFloat(file.DaysSinceModified) || 0;
    const ext = (file.Extension || '').toLowerCase();

    processed.totalSizeBytes += sizeBytes;

    // Track for threshold calculations
    processed.files.push({
      sizeBytes,
      daysSinceModified,
      monthsSinceModified: Math.floor(daysSinceModified / 30),
      yearsSinceModified,
    });

    // Track file types
    if (ext) {
      if (!processed.fileTypes[ext]) {
        processed.fileTypes[ext] = { count: 0, sizeBytes: 0 };
      }
      processed.fileTypes[ext].count++;
      processed.fileTypes[ext].sizeBytes += sizeBytes;
    }

    // Duplicates
    if (file.IsProbablyDuplicate === 'True') {
      processed.duplicates.count++;
      processed.duplicates.sizeBytes += sizeBytes;
    }

    // Temp files
    if (file.IsTempFile === 'True') {
      processed.tempFiles.count++;
      processed.tempFiles.sizeBytes += sizeBytes;
    }

    // Empty files
    if (file.IsEmptyFile === 'True') {
      processed.emptyFiles.count++;
      processed.emptyFiles.sizeBytes += sizeBytes;
    }

    // Legacy formats
    if (legacyExtensions.includes(ext)) {
      processed.legacyFormats.count++;
      processed.legacyFormats.sizeBytes += sizeBytes;
    }

    // Older than 5 years
    if (yearsSinceModified >= 5) {
      processed.olderThan5Years.count++;
      processed.olderThan5Years.sizeBytes += sizeBytes;
    }

    // SharePoint incompatible
    if (file.SharePointCompatibility !== 'OK') {
      processed.incompatibleFiles.count++;
      processed.incompatibleFiles.sizeBytes += sizeBytes;
    }
  });

  // Sort files by age for cumulative calculations
  processed.files.sort((a, b) => a.daysSinceModified - b.daysSinceModified);

  // Calculate max age in months
  if (processed.files.length > 0) {
    const maxDays = processed.files[processed.files.length - 1].daysSinceModified;
    processed.maxMonthsAge = Math.ceil(maxDays / 30);
  }

  // Calculate age histogram buckets
  processed.ageHistogram = calculateAgeHistogram(data);

  // Calculate cumulative migration curve data
  processed.cumulativeData = calculateCumulativeData(processed.files, processed.totalSizeBytes);

  // Convert file types to sorted array
  processed.fileTypesList = Object.entries(processed.fileTypes)
    .map(([ext, data]) => ({
      extension: ext,
      count: data.count,
      sizeBytes: data.sizeBytes,
      sizeGB: data.sizeBytes / (1024 * 1024 * 1024),
    }))
    .sort((a, b) => b.count - a.count);

  return processed;
}

function calculateAgeHistogram(data) {
  const buckets = [
    { label: '0-6 mo', minYears: 0, maxYears: 0.5, count: 0, sizeBytes: 0 },
    { label: '6-12 mo', minYears: 0.5, maxYears: 1, count: 0, sizeBytes: 0 },
    { label: '1-2 yr', minYears: 1, maxYears: 2, count: 0, sizeBytes: 0 },
    { label: '2-3 yr', minYears: 2, maxYears: 3, count: 0, sizeBytes: 0 },
    { label: '3-5 yr', minYears: 3, maxYears: 5, count: 0, sizeBytes: 0 },
    { label: '5-7 yr', minYears: 5, maxYears: 7, count: 0, sizeBytes: 0 },
    { label: '7-10 yr', minYears: 7, maxYears: 10, count: 0, sizeBytes: 0 },
    { label: '10+ yr', minYears: 10, maxYears: Infinity, count: 0, sizeBytes: 0 },
  ];

  data.forEach(file => {
    const years = parseFloat(file.YearsSinceModified) || 0;
    const sizeBytes = parseFloat(file.SizeBytes) || 0;

    for (const bucket of buckets) {
      if (years >= bucket.minYears && years < bucket.maxYears) {
        bucket.count++;
        bucket.sizeBytes += sizeBytes;
        break;
      }
    }
  });

  return buckets.map(b => ({
    label: b.label,
    count: b.count,
    sizeGB: b.sizeBytes / (1024 * 1024 * 1024),
  }));
}

function calculateCumulativeData(sortedFiles, totalSizeBytes) {
  if (sortedFiles.length === 0) return [];

  const data = [];
  const maxMonths = Math.ceil(sortedFiles[sortedFiles.length - 1].daysSinceModified / 30);

  // Create data points for each month
  let fileIndex = 0;
  let cumulativeSize = 0;
  let cumulativeCount = 0;

  for (let month = 0; month <= maxMonths; month++) {
    const daysThreshold = month * 30;

    // Count files within this threshold
    while (fileIndex < sortedFiles.length && sortedFiles[fileIndex].daysSinceModified <= daysThreshold) {
      cumulativeCount++;
      cumulativeSize += sortedFiles[fileIndex].sizeBytes;
      fileIndex++;
    }

    data.push({
      month,
      filePercent: (cumulativeCount / sortedFiles.length) * 100,
      sizePercent: totalSizeBytes > 0 ? (cumulativeSize / totalSizeBytes) * 100 : 0,
      fileCount: cumulativeCount,
      sizeBytes: cumulativeSize,
    });
  }

  return data;
}

export function getThresholdStats(processedData, thresholdMonths) {
  const { files, totalSizeBytes } = processedData;
  const totalFiles = files.length;

  const daysThreshold = thresholdMonths * 30;

  let migrateCount = 0;
  let migrateSize = 0;

  for (const file of files) {
    if (file.daysSinceModified <= daysThreshold) {
      migrateCount++;
      migrateSize += file.sizeBytes;
    }
  }

  const archiveCount = totalFiles - migrateCount;
  const archiveSize = totalSizeBytes - migrateSize;

  return {
    migrate: {
      count: migrateCount,
      sizeBytes: migrateSize,
      sizeGB: migrateSize / (1024 * 1024 * 1024),
      percent: totalFiles > 0 ? (migrateCount / totalFiles) * 100 : 0,
    },
    archive: {
      count: archiveCount,
      sizeBytes: archiveSize,
      sizeGB: archiveSize / (1024 * 1024 * 1024),
      percent: totalFiles > 0 ? (archiveCount / totalFiles) * 100 : 0,
    },
  };
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${value.toFixed(i > 1 ? 2 : 0)} ${units[i]}`;
}

export function formatNumber(num) {
  return new Intl.NumberFormat().format(Math.round(num));
}

export function formatCurrency(num) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatCurrencyPrecise(num) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}
