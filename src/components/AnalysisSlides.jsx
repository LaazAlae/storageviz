import { forwardRef } from 'react';
import { formatNumber, formatCurrency } from '../utils/dataProcessor';

// ============================================
// ANALYSIS QUESTION SLIDES
// Full-viewport questions between analysis sections
// ============================================

function AnalysisQuestionSlide({ question, accentWord }) {
  let questionContent = question;
  if (accentWord && question.includes(accentWord)) {
    const parts = question.split(accentWord);
    questionContent = (
      <>
        {parts[0]}<span className="question-accent">{accentWord}</span>{parts[1]}
      </>
    );
  }

  return (
    <div className="page-section analysis-question-section">
      <div className="slide-content">
        <h2 className="question-text">{questionContent}</h2>
      </div>
    </div>
  );
}

export function QuestionCutoff() {
  return (
    <AnalysisQuestionSlide
      question="Where should the cutoff be?"
      accentWord="cutoff"
    />
  );
}

export function QuestionFullPicture() {
  return (
    <AnalysisQuestionSlide
      question="What's the full picture?"
      accentWord="full picture"
    />
  );
}

export function QuestionOptions() {
  return (
    <AnalysisQuestionSlide
      question="So, what are our options?"
      accentWord="options"
    />
  );
}

// ============================================
// OPTION SLIDES
// Three options for decision-making
// ============================================

// Icons for options (smaller size)
const PartialMigrationIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 16l2-2-2-2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FullMigrationIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12h8" strokeLinecap="round"/>
    <path d="M12 8v8" strokeLinecap="round"/>
  </svg>
);

const FreezeIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 9h6v6H9z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NextStepsIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" strokeLinecap="round"/>
    <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function OptionPartialMigration({ thresholdStats }) {
  // Calculate costs based on threshold data
  const hasData = thresholdStats && thresholdStats.migrate && thresholdStats.archive;

  const sharePointRate = 0.20; // $/GB/month
  const coolRate = 0.01; // $/GB/month
  const archiveRate = 0.002; // $/GB/month

  const sharePointGB = hasData ? thresholdStats.migrate.sizeGB : 0;
  const coldStorageGB = hasData ? thresholdStats.archive.sizeGB : 0;

  const sharePointMonthly = sharePointGB * sharePointRate;
  const coolMonthly = coldStorageGB * coolRate;
  const archiveMonthly = coldStorageGB * archiveRate;

  const totalMonthlyCool = sharePointMonthly + coolMonthly;
  const totalMonthlyArchive = sharePointMonthly + archiveMonthly;
  const totalAnnualCool = totalMonthlyCool * 12;
  const totalAnnualArchive = totalMonthlyArchive * 12;

  return (
    <div className="page-section option-section">
      <div className="section-inner">
        <div className="option-content">
          <div className="option-badge recommended">Recommended</div>
          <div className="option-icon option-icon-partial">
            <PartialMigrationIcon />
          </div>
          <h2>Option 1: Partial Migration + Cold Storage</h2>
          <p className="option-lead">
            Migrate active files to SharePoint. Archive inactive files to low-cost Azure storage.
          </p>

          {/* Cost Breakdown Card */}
          {hasData ? (
            <div className="option-cost-card">
              <div className="option-cost-row">
                <span className="option-cost-label">SharePoint ({sharePointGB.toFixed(1)} GB × $0.20)</span>
                <span className="option-cost-value">{formatCurrency(sharePointMonthly)}/mo</span>
              </div>
              <div className="option-cost-row">
                <span className="option-cost-label">Cool Storage ({coldStorageGB.toFixed(1)} GB × $0.01)</span>
                <span className="option-cost-value">{formatCurrency(coolMonthly)}/mo</span>
              </div>
              <div className="option-cost-row">
                <span className="option-cost-label">— or Archive ({coldStorageGB.toFixed(1)} GB × $0.002)</span>
                <span className="option-cost-value">{formatCurrency(archiveMonthly)}/mo</span>
              </div>
              <div className="option-cost-total">
                <span className="option-cost-total-label">Annual Cost (Cool)</span>
                <span className="option-cost-total-value">{formatCurrency(totalAnnualCool)}</span>
              </div>
              <div className="option-cost-total alt">
                <span className="option-cost-total-label">Annual Cost (Archive)</span>
                <span className="option-cost-total-value">{formatCurrency(totalAnnualArchive)}</span>
              </div>
            </div>
          ) : (
            <div className="option-cost-card placeholder">
              <p>Upload file inventory to see cost estimates</p>
            </div>
          )}

          <div className="option-benefits">
            <h4>Benefits</h4>
            <ul>
              <li>Lowest total cost of ownership</li>
              <li>Clean, organized SharePoint environment</li>
              <li>Historical files remain accessible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export const OptionFullMigration = forwardRef(function OptionFullMigration(
  { licensedUsers, onLicensedUsersChange, totalSizeGB },
  ref
) {
  // SharePoint storage calculation: 1 TB base + 10 GB per licensed user
  const baseStorageTB = 1;
  const perUserStorageGB = 10;
  const totalStorageGB = (baseStorageTB * 1024) + (licensedUsers * perUserStorageGB);
  const totalStorageTB = totalStorageGB / 1024;

  // Calculate full migration cost
  const hasData = totalSizeGB > 0;
  const sharePointRate = 0.20;
  const monthlySharePointCost = totalSizeGB * sharePointRate;
  const annualSharePointCost = monthlySharePointCost * 12;

  return (
    <div className="page-section option-section" ref={ref}>
      <div className="section-inner">
        <div className="option-content">
          <div className="option-icon option-icon-full">
            <FullMigrationIcon />
          </div>
          <h2>Option 2: Full Migration to SharePoint</h2>
          <p className="option-lead">
            Move everything to SharePoint. Simple approach, but higher ongoing costs.
          </p>

          {/* Cost Summary for Full Migration */}
          {hasData && (
            <div className="option-cost-card full-migration">
              <div className="option-cost-row">
                <span className="option-cost-label">All files ({totalSizeGB.toFixed(1)} GB × $0.20)</span>
                <span className="option-cost-value">{formatCurrency(monthlySharePointCost)}/mo</span>
              </div>
              <div className="option-cost-total">
                <span className="option-cost-total-label">Annual Cost</span>
                <span className="option-cost-total-value highlight-warning">{formatCurrency(annualSharePointCost)}</span>
              </div>
            </div>
          )}

          <div className="sharepoint-calculator">
            <h4>SharePoint Storage Calculator</h4>
            <p className="calculator-formula">
              Storage = 1 TB base + (10 GB × licensed users)
            </p>

            <div className="calculator-input-row">
              <label>Licensed Users</label>
              <div className="number-input-wrapper">
                <input
                  type="number"
                  className="cost-input"
                  value={licensedUsers}
                  onChange={(e) => onLicensedUsersChange(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <div className="number-input-steppers">
                  <button
                    className="stepper-btn"
                    onClick={() => onLicensedUsersChange(licensedUsers + 10)}
                  >
                    <svg viewBox="0 0 10 10"><path d="M2 6L5 3L8 6" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
                  </button>
                  <button
                    className="stepper-btn"
                    onClick={() => onLicensedUsersChange(Math.max(1, licensedUsers - 10))}
                  >
                    <svg viewBox="0 0 10 10"><path d="M2 4L5 7L8 4" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="calculator-result">
              <span className="calculator-result-label">Available Storage</span>
              <span className="calculator-result-value">{totalStorageTB.toFixed(2)} TB</span>
              <span className="calculator-result-detail">({totalStorageGB.toLocaleString()} GB)</span>
            </div>
            <p className="calculator-note">
              Note: This storage is shared between SharePoint and OneDrive.
            </p>
          </div>

          <div className="option-considerations">
            <h4>Considerations</h4>
            <ul>
              <li>Higher monthly storage costs</li>
              <li>May exceed SharePoint allocation</li>
              <li>Old files clutter search results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

export function OptionFreeze() {
  return (
    <div className="page-section option-section">
      <div className="section-inner">
        <div className="option-content">
          <div className="option-icon option-icon-freeze">
            <FreezeIcon />
          </div>
          <h2>Option 3: Freeze and Retire</h2>
          <p className="option-lead">
            Make current drives read-only. Start fresh in SharePoint.
          </p>

          <div className="option-details">
            <div className="option-detail-item">
              <span className="option-detail-label">Current drives</span>
              <span className="option-detail-value">→ Read-only archive</span>
            </div>
            <div className="option-detail-item">
              <span className="option-detail-label">New work</span>
              <span className="option-detail-value">→ SharePoint only</span>
            </div>
            <div className="option-detail-item">
              <span className="option-detail-label">Old files</span>
              <span className="option-detail-value">→ Access on demand</span>
            </div>
          </div>

          <div className="option-considerations">
            <h4>Considerations</h4>
            <ul>
              <li>Clean break, fresh start</li>
              <li>Users must request old files manually</li>
              <li>May disrupt workflows initially</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CLOSING SLIDE
// ============================================
export function WhatNextSlide() {
  return (
    <div className="page-section closing-section">
      <div className="section-inner">
        <div className="closing-content">
          <div className="closing-icon">
            <NextStepsIcon />
          </div>
          <h2>What happens next?</h2>

          <div className="next-steps-grid">
            <div className="next-step">
              <div className="next-step-number">1</div>
              <div className="next-step-content">
                <h4>Choose an approach</h4>
                <p>Review the three options and decide which migration strategy fits our needs.</p>
              </div>
            </div>

            <div className="next-step">
              <div className="next-step-number">2</div>
              <div className="next-step-content">
                <h4>Set the threshold</h4>
                <p>Adjust the cutoff date to balance cost savings with user convenience.</p>
              </div>
            </div>

            <div className="next-step">
              <div className="next-step-number">3</div>
              <div className="next-step-content">
                <h4>Generate file lists</h4>
                <p>Export the categorized inventory to guide the actual migration process.</p>
              </div>
            </div>

            <div className="next-step">
              <div className="next-step-number">4</div>
              <div className="next-step-content">
                <h4>Execute migration</h4>
                <p>Begin moving files to SharePoint and archiving inactive content.</p>
              </div>
            </div>
          </div>

          <p className="closing-tagline">
            Questions? Scroll back to explore the data.
          </p>
        </div>
      </div>
    </div>
  );
}
