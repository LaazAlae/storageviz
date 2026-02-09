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
    cumulativeData: [],           // By last modified
    cumulativeDataOpened: [],     // By last opened
    maxMonthsAge: 0,
    maxMonthsAgeOpened: 0,
    hasOpenedData: false,         // Whether CSV has LastOpened data
    fileTypes: {},
  };

  // Legacy extensions to detect
  const legacyExtensions = ['.xls', '.doc', '.ppt'];

  // Check if CSV has accessed/opened data - search for any matching column
  if (data.length > 0) {
    const keys = Object.keys(data[0]);
    const accessPatterns = ['access', 'opened', 'lastopen'];
    const hasOpenedColumn = keys.some(key =>
      accessPatterns.some(pattern => key.toLowerCase().includes(pattern))
    );
    processed.hasOpenedData = hasOpenedColumn;
  }

  // Log column names once for debugging
  if (data.length > 0) {
    console.log('CSV COLUMNS:', Object.keys(data[0]));
    console.log('FIRST ROW:', data[0]);
  }

  // Helper to parse days since accessed/opened
  const getDaysSinceOpened = (file, fallback) => {
    const keys = Object.keys(file);

    // Priority 1: Look for DaysSinceAc or similar DAYS column
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('day') && (lowerKey.includes('sinceac') || lowerKey.includes('access'))) {
        const val = parseFloat(file[key]);
        if (!isNaN(val) && val >= 0) {
          return val; // Return directly - this is already in days
        }
      }
    }

    // Priority 2: Look for YearsSinceAc or similar YEARS column
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('year') && (lowerKey.includes('sinceac') || lowerKey.includes('access'))) {
        const val = parseFloat(file[key]);
        if (!isNaN(val) && val >= 0) {
          return val * 365; // Convert years to days
        }
      }
    }

    // Priority 3: Parse AccessedDate column
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('accessed') || lowerKey.includes('lastopen')) {
        const dateStr = file[key];
        if (dateStr && typeof dateStr === 'string') {
          const parts = dateStr.split(/[\/\s:]+/);
          if (parts.length >= 3) {
            let month = parseInt(parts[0]);
            let day = parseInt(parts[1]);
            let year = parseInt(parts[2]);
            if (year < 100) year += 2000;
            const date = new Date(year, month - 1, day);
            if (!isNaN(date.getTime())) {
              const days = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
              if (days >= 0 && days < 20000) return days;
            }
          }
        }
      }
    }

    return fallback;
  };

  // Process each file
  data.forEach(file => {
    const sizeBytes = parseFloat(file.SizeBytes) || 0;
    const yearsSinceModified = parseFloat(file.YearsSinceModified) || 0;
    const daysSinceModified = parseFloat(file.DaysSinceModified) || 0;
    const daysSinceOpened = getDaysSinceOpened(file, daysSinceModified);
    const ext = (file.Extension || '').toLowerCase();

    processed.totalSizeBytes += sizeBytes;

    // Track for threshold calculations (both modified and opened)
    processed.files.push({
      sizeBytes,
      daysSinceModified,
      daysSinceOpened,
      monthsSinceModified: Math.floor(daysSinceModified / 30),
      monthsSinceOpened: Math.floor(daysSinceOpened / 30),
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

  // Sort files by age for cumulative calculations (by modified date)
  const filesByModified = [...processed.files].sort((a, b) => a.daysSinceModified - b.daysSinceModified);
  const filesByOpened = [...processed.files].sort((a, b) => a.daysSinceOpened - b.daysSinceOpened);

  // Calculate max age in months for both (capped at 15 years = 180 months)
  const MAX_MONTHS_CAP = 180; // 15 years max to keep charts readable
  if (processed.files.length > 0) {
    const maxDaysModified = filesByModified[filesByModified.length - 1].daysSinceModified;
    const maxDaysOpened = filesByOpened[filesByOpened.length - 1].daysSinceOpened;
    processed.maxMonthsAge = Math.min(MAX_MONTHS_CAP, Math.ceil(maxDaysModified / 30));
    processed.maxMonthsAgeOpened = Math.min(MAX_MONTHS_CAP, Math.ceil(maxDaysOpened / 30));
  }

  // Store both sorted arrays for threshold calculations
  processed.filesByModified = filesByModified;
  processed.filesByOpened = filesByOpened;

  // Calculate age histogram buckets
  processed.ageHistogram = calculateAgeHistogram(data);

  // Calculate cumulative migration curve data for both modes
  processed.cumulativeData = calculateCumulativeData(filesByModified, processed.totalSizeBytes, 'daysSinceModified');
  processed.cumulativeDataOpened = calculateCumulativeData(filesByOpened, processed.totalSizeBytes, 'daysSinceOpened');

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

function calculateCumulativeData(sortedFiles, totalSizeBytes, dayField = 'daysSinceModified') {
  if (sortedFiles.length === 0) return [];

  const data = [];
  const MAX_MONTHS_CAP = 180; // 15 years max
  const rawMaxMonths = Math.ceil(sortedFiles[sortedFiles.length - 1][dayField] / 30);
  const maxMonths = Math.min(MAX_MONTHS_CAP, rawMaxMonths);

  // Create data points for each month
  let fileIndex = 0;
  let cumulativeSize = 0;
  let cumulativeCount = 0;

  for (let month = 0; month <= maxMonths; month++) {
    const daysThreshold = month * 30;

    // Count files within this threshold
    while (fileIndex < sortedFiles.length && sortedFiles[fileIndex][dayField] <= daysThreshold) {
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

export function getThresholdStats(processedData, thresholdMonths, mode = 'modified') {
  const { files, totalSizeBytes } = processedData;
  const totalFiles = files.length;

  const daysThreshold = thresholdMonths * 30;
  const dayField = mode === 'opened' ? 'daysSinceOpened' : 'daysSinceModified';

  let migrateCount = 0;
  let migrateSize = 0;

  for (const file of files) {
    if (file[dayField] <= daysThreshold) {
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
