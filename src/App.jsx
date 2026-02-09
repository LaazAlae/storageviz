import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import {
  TitleSlide,
  QuestionDrives,
  ChallengeSlide,
  QuestionPlan,
  SolutionSlide,
  QuestionCost,
  CostSlide,
  QuestionApproach,
  ApproachSlide,
  QuestionData,
  UploadSlide,
} from './components/Presentation';
import {
  QuestionCutoff,
  QuestionFullPicture,
  QuestionOptions,
  OptionPartialMigration,
  OptionFullMigration,
  OptionFreeze,
  WhatNextSlide,
} from './components/AnalysisSlides';
import StatCards from './components/StatCards';
import MigrationCurve from './components/MigrationCurve';
import AgeHistogram from './components/AgeHistogram';
import FileTypeBreakdown from './components/FileTypeBreakdown';
import WastePanel from './components/WastePanel';
import CostSimulator from './components/CostSimulator';
import BackgroundImage from './components/BackgroundImage';
import { processCSVData, getThresholdStats, formatNumber } from './utils/dataProcessor';
import './index.css';

// Presentation slide count (11 slides with Q&A rhythm)
const PRESENTATION_SLIDES = 11;

// Analysis section IDs - ordered for presentation flow with Q&A rhythm
const ANALYSIS_SECTIONS = [
  'section-overview',       // Overview + file type breakdown
  'section-q-cutoff',       // Question: Where should the cutoff be?
  'section-threshold',      // Migration threshold slider
  'section-cost',           // Cost simulator
  'section-q-fullpicture',  // Question: What's the full picture?
  'section-histogram',      // File age distribution
  'section-waste',          // Waste summary
  'section-q-options',      // Question: What are our options?
  'section-option-1',       // Option 1: Partial Migration
  'section-option-2',       // Option 2: Full Migration
  'section-option-3',       // Option 3: Freeze and Retire
  'section-whatnext',       // What happens next?
];

export default function App() {
  const [rawData, setRawData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [threshold, setThreshold] = useState(24);
  const [licensedUsers, setLicensedUsers] = useState(50);

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadSlideRef = useRef(null);

  const processedData = useMemo(() => {
    if (!rawData) return null;
    const processed = processCSVData(rawData);
    // Set initial threshold
    setThreshold(Math.min(24, processed.maxMonthsAge));
    return processed;
  }, [rawData]);

  const thresholdStats = useMemo(() => {
    if (!processedData) return null;
    return getThresholdStats(processedData, threshold);
  }, [processedData, threshold]);

  const totalSlides = processedData
    ? PRESENTATION_SLIDES + ANALYSIS_SECTIONS.length
    : PRESENTATION_SLIDES;

  // Handle file upload
  const handleFile = useCallback((file) => {
    if (!file || !file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setIsLoading(true);
    setLoadingProgress(0);

    const results = [];
    let rowCount = 0;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      chunk: (chunk) => {
        results.push(...chunk.data);
        rowCount += chunk.data.length;
        setLoadingProgress(rowCount);
      },
      complete: () => {
        setIsLoading(false);
        setRawData(results);
        // Scroll to first analysis section
        setTimeout(() => {
          setCurrentSlide(PRESENTATION_SLIDES);
        }, 100);
      },
      error: (error) => {
        setIsLoading(false);
        alert('Error parsing CSV: ' + error.message);
      },
    });
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // Scroll to specific slide
  const scrollToSlide = useCallback((index) => {
    const clampedIndex = Math.max(0, Math.min(totalSlides - 1, index));
    setCurrentSlide(clampedIndex);

    const container = containerRef.current;
    if (!container) return;

    const slideHeight = window.innerHeight;
    container.scrollTo({
      top: clampedIndex * slideHeight,
      behavior: 'smooth',
    });
  }, [totalSlides]);

  // Handle scroll to update current slide indicator
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const slideHeight = window.innerHeight;
      const scrollTop = container.scrollTop;
      const newSlide = Math.round(scrollTop / slideHeight);
      if (newSlide !== currentSlide && newSlide >= 0 && newSlide < totalSlides) {
        setCurrentSlide(newSlide);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentSlide, totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollToSlide(currentSlide + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToSlide(currentSlide - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        scrollToSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollToSlide(totalSlides - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, scrollToSlide, totalSlides]);

  // Reset handler
  const handleReset = useCallback(() => {
    setRawData(null);
    setThreshold(24);
    scrollToSlide(0);
  }, [scrollToSlide]);

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
        <div className="loading-text">Processing file inventory...</div>
        <div className="loading-progress">
          {loadingProgress.toLocaleString()} files parsed
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" ref={containerRef}>
      {/* Dot indicators */}
      <div className="slide-indicators">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            className={`slide-indicator ${i === currentSlide ? 'active' : ''} ${i >= PRESENTATION_SLIDES ? 'analysis' : ''}`}
            onClick={() => scrollToSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Presentation Slides - Q&A Rhythm */}
      <TitleSlide />
      <QuestionDrives />
      <ChallengeSlide />
      <QuestionPlan />
      <SolutionSlide />
      <QuestionCost />
      <CostSlide />
      <QuestionApproach />
      <ApproachSlide />
      <QuestionData />
      <UploadSlide
        ref={uploadSlideRef}
        isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onFileUpload={handleFileChange}
        fileInputRef={fileInputRef}
      />

      {/* Analysis Sections (only render if data is loaded) */}
      {processedData && (
        <>
          {/* Overview Section - includes stat cards and file type breakdown */}
          <div className="page-section" id="section-overview">
            <BackgroundImage slideId="section-overview" />
            <div className="section-inner">
              <header className="dashboard-header">
                <div className="dashboard-title">
                  <h1>Analysis Results</h1>
                  <span>{formatNumber(processedData.totalFiles)} files analyzed</span>
                </div>
                <button className="reset-button" onClick={handleReset}>
                  Start Over
                </button>
              </header>
              <StatCards data={processedData} thresholdStats={thresholdStats} />
              <FileTypeBreakdown data={processedData} inline />
            </div>
          </div>

          {/* Question: Where should the cutoff be? */}
          <QuestionCutoff />

          {/* Migration Threshold Section */}
          <div className="page-section" id="section-threshold">
            <BackgroundImage slideId="section-threshold" />
            <div className="section-inner">
              <MigrationCurve
                data={processedData.cumulativeData}
                threshold={threshold}
                onThresholdChange={setThreshold}
                maxMonths={processedData.maxMonthsAge}
                totalFiles={processedData.totalFiles}
                totalSizeBytes={processedData.totalSizeBytes}
                thresholdStats={thresholdStats}
              />
            </div>
          </div>

          {/* Cost Simulator Section */}
          <div className="page-section" id="section-cost">
            <BackgroundImage slideId="section-cost-sim" />
            <div className="section-inner">
              <CostSimulator thresholdStats={thresholdStats} />
            </div>
          </div>

          {/* Question: What's the full picture? */}
          <QuestionFullPicture />

          {/* Age Distribution Section */}
          <div className="page-section" id="section-histogram">
            <BackgroundImage slideId="section-histogram" />
            <div className="section-inner">
              <AgeHistogram data={processedData.ageHistogram} />
            </div>
          </div>

          {/* Waste Summary Section */}
          <div className="page-section" id="section-waste">
            <BackgroundImage slideId="section-waste" />
            <div className="section-inner">
              <WastePanel data={processedData} />
            </div>
          </div>

          {/* Question: What are our options? */}
          <QuestionOptions />

          {/* Option 1: Partial Migration + Cold Storage */}
          <OptionPartialMigration thresholdStats={thresholdStats} />

          {/* Option 2: Full Migration to SharePoint */}
          <OptionFullMigration
            licensedUsers={licensedUsers}
            onLicensedUsersChange={setLicensedUsers}
          />

          {/* Option 3: Freeze and Retire */}
          <OptionFreeze />

          {/* Closing: What happens next? */}
          <WhatNextSlide />
        </>
      )}
    </div>
  );
}
