import { useState, useRef } from 'react';
import Papa from 'papaparse';

const UploadIcon = () => (
  <svg className="drop-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function LandingPage({ onDataLoaded }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 0 });
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setIsLoading(true);
    setLoadingProgress({ loaded: 0, total: 0 });

    const results = [];
    let rowCount = 0;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      chunk: (chunk, parser) => {
        results.push(...chunk.data);
        rowCount += chunk.data.length;
        setLoadingProgress({ loaded: rowCount, total: rowCount });
      },
      complete: () => {
        setIsLoading(false);
        onDataLoaded(results);
      },
      error: (error) => {
        setIsLoading(false);
        alert('Error parsing CSV: ' + error.message);
      },
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
        <div className="loading-text">Processing file inventory...</div>
        <div className="loading-progress">
          {loadingProgress.loaded.toLocaleString()} files parsed
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <div className="landing-logo">
        <h1>StorageViz</h1>
        <p>Migration Analysis Dashboard</p>
      </div>

      <div
        className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <UploadIcon />
        <h2>Drop your CSV file here</h2>
        <p>or click to browse</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
