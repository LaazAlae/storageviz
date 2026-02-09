import { formatBytes, formatNumber } from '../utils/dataProcessor';

const CopyIcon = () => (
  <svg className="waste-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const TempIcon = () => (
  <svg className="waste-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
  </svg>
);

const EmptyIcon = () => (
  <svg className="waste-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

const LegacyIcon = () => (
  <svg className="waste-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TrashIcon = () => (
  <svg className="waste-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

export default function WastePanel({ data }) {
  const { duplicates, tempFiles, emptyFiles, legacyFormats } = data;

  const totalRecoverable =
    duplicates.sizeBytes +
    tempFiles.sizeBytes +
    emptyFiles.sizeBytes +
    legacyFormats.sizeBytes;

  const totalCount =
    duplicates.count +
    tempFiles.count +
    emptyFiles.count +
    legacyFormats.count;

  return (
    <div className="section">
      <div className="section-header">
        <h2>Waste Summary</h2>
        <span className="section-badge">Cleanup candidates</span>
      </div>

      <div className="waste-panel">
        <div className="waste-card">
          <div className="waste-card-header">
            <CopyIcon />
            <span className="waste-card-title">Duplicate Files</span>
          </div>
          <div className="waste-card-values">
            <span className="waste-count">{formatNumber(duplicates.count)}</span>
            <span className="waste-size">{formatBytes(duplicates.sizeBytes)}</span>
          </div>
          <p className="waste-card-explanation">
            Files with "-copy", "(1)", or "backup" in the filename — likely copies of existing files.
          </p>
        </div>

        <div className="waste-card">
          <div className="waste-card-header">
            <TempIcon />
            <span className="waste-card-title">Temp Files</span>
          </div>
          <div className="waste-card-values">
            <span className="waste-count">{formatNumber(tempFiles.count)}</span>
            <span className="waste-size">{formatBytes(tempFiles.sizeBytes)}</span>
          </div>
          <p className="waste-card-explanation">
            Temporary files (names starting with ~ or ending in .tmp) created by applications and never cleaned up.
          </p>
        </div>

        <div className="waste-card">
          <div className="waste-card-header">
            <EmptyIcon />
            <span className="waste-card-title">Empty Files</span>
          </div>
          <div className="waste-card-values">
            <span className="waste-count">{formatNumber(emptyFiles.count)}</span>
            <span className="waste-size">{formatBytes(emptyFiles.sizeBytes)}</span>
          </div>
          <p className="waste-card-explanation">
            Files with zero bytes — effectively blank files taking up directory space.
          </p>
        </div>

        <div className="waste-card">
          <div className="waste-card-header">
            <LegacyIcon />
            <span className="waste-card-title">Legacy Formats</span>
          </div>
          <div className="waste-card-values">
            <span className="waste-count">{formatNumber(legacyFormats.count)}</span>
            <span className="waste-size">{formatBytes(legacyFormats.sizeBytes)}</span>
          </div>
          <p className="waste-card-explanation">
            Older Office formats (.xls, .doc, .ppt) that have modern equivalents (.xlsx, .docx, .pptx).
          </p>
        </div>

        <div className="waste-card total">
          <div className="waste-card-header">
            <TrashIcon />
            <span className="waste-card-title">Total Recoverable Space</span>
          </div>
          <div className="waste-card-values">
            <span className="waste-count">{formatNumber(totalCount)} files</span>
            <span className="waste-size">{formatBytes(totalRecoverable)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
