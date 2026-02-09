import { forwardRef } from 'react';
import BackgroundImage from './BackgroundImage';

// Icons
const AlertIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
    <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
  </svg>
);

const CloudIcon = () => (
  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArchiveIcon = () => (
  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="21 8 21 21 3 21 3 8" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="1" y="3" width="22" height="5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="10" y1="12" x2="14" y2="12" strokeLinecap="round"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round"/>
    <polyline points="12 5 19 12 12 19" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ============================================
// QUESTION SLIDE COMPONENT
// Simple, centered question to create storytelling rhythm
// ============================================
function QuestionSlide({ question, accentWord, slideId }) {
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
    <div className="slide slide-question">
      <BackgroundImage slideId={slideId} />
      <div className="slide-content">
        <h2 className="question-text">{questionContent}</h2>
      </div>
    </div>
  );
}

// ============================================
// SLIDE 1: TITLE
// ============================================
function TitleSlide() {
  return (
    <div className="slide slide-title">
      <BackgroundImage slideId="slide-title" />
      <div className="slide-content">
        <h1 className="title-main">StorageViz</h1>
        <p className="title-subtitle">File Migration Analysis</p>
        <p className="title-department">Accounting Department Pilot</p>
        <div className="title-meta">
          <span>February 2026</span>
        </div>
      </div>
      <div className="slide-scroll-hint">
        <span>Scroll to continue</span>
        <div className="scroll-arrow" />
      </div>
    </div>
  );
}

// ============================================
// SLIDE 2: QUESTION - What's happening?
// ============================================
function QuestionDrives() {
  return (
    <QuestionSlide
      question="What's happening with our shared drives?"
      accentWord="shared drives"
      slideId="slide-q-drives"
    />
  );
}

// ============================================
// SLIDE 3: THE CHALLENGE (Answer)
// ============================================
function ChallengeSlide() {
  return (
    <div className="slide slide-problem">
      <BackgroundImage slideId="slide-problem" />
      <div className="slide-content">
        <div className="slide-icon slide-icon-warning">
          <AlertIcon />
        </div>
        <h2>The Challenge</h2>
        <p className="slide-lead-large">Our shared drives are approaching capacity after 10+ years of accumulated files.</p>

        <div className="problem-grid-large">
          <div className="problem-item-large">
            <span className="problem-label-large">Organic Growth</span>
            <span className="problem-desc-large">Years of work have created deep folder structures that are hard to navigate</span>
          </div>
          <div className="problem-item-large">
            <span className="problem-label-large">No Retention Policy</span>
            <span className="problem-desc-large">Without automated cleanup, historical files accumulate alongside active ones</span>
          </div>
          <div className="problem-item-large">
            <span className="problem-label-large">Search Limitations</span>
            <span className="problem-desc-large">Current drives lack metadata tagging and full-text search capabilities</span>
          </div>
          <div className="problem-item-large">
            <span className="problem-label-large">Access Control</span>
            <span className="problem-desc-large">Granular permissions are difficult to manage with traditional file shares</span>
          </div>
        </div>

        <p className="slide-emphasis-large">SharePoint solves these — but we need a migration strategy.</p>
      </div>
    </div>
  );
}

// ============================================
// SLIDE 4: QUESTION - What's the plan?
// ============================================
function QuestionPlan() {
  return (
    <QuestionSlide
      question="What's the plan?"
      accentWord="plan"
      slideId="slide-q-plan"
    />
  );
}

// ============================================
// SLIDE 5: THE SOLUTION (Answer)
// ============================================
function SolutionSlide() {
  return (
    <div className="slide slide-solution">
      <BackgroundImage slideId="slide-solution" />
      <div className="slide-content">
        <h2>The Solution</h2>
        <p className="slide-lead-large">Three tiers of storage</p>

        <div className="solution-tiers-large">
          <div className="tier-large tier-sharepoint">
            <div className="tier-icon-large">
              <CloudIcon />
            </div>
            <h3>SharePoint</h3>
            <p className="tier-desc-large">Active files</p>
            <ul className="tier-benefits-large">
              <li>Collaboration</li>
              <li>Full-text search</li>
              <li>Version history</li>
            </ul>
          </div>

          <div className="tier-arrow-large">
            <ArrowIcon />
          </div>

          <div className="tier-large tier-cold">
            <div className="tier-icon-large">
              <ArchiveIcon />
            </div>
            <h3>Cold Storage</h3>
            <p className="tier-desc-large">Inactive files</p>
            <ul className="tier-benefits-large">
              <li>Very low cost</li>
              <li>Always retrievable</li>
              <li>Nothing deleted</li>
            </ul>
          </div>

          <div className="tier-arrow-large">
            <ArrowIcon />
          </div>

          <div className="tier-large tier-cleanup">
            <div className="tier-icon-large">
              <TrashIcon />
            </div>
            <h3>Cleanup</h3>
            <p className="tier-desc-large">Remove the noise</p>
            <ul className="tier-benefits-large">
              <li>Duplicates</li>
              <li>Temp files</li>
              <li>Empty files</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SLIDE 6: QUESTION - How much does storage cost?
// ============================================
function QuestionCost() {
  return (
    <QuestionSlide
      question="How much does storage actually cost?"
      accentWord="cost"
      slideId="slide-q-cost"
    />
  );
}

// ============================================
// SLIDE 7: THE COST DIFFERENCE (Answer)
// ============================================
function CostSlide() {
  return (
    <div className="slide slide-cost">
      <BackgroundImage slideId="slide-cost" />
      <div className="slide-content">
        <h2>The Cost Difference</h2>
        <p className="slide-lead-large">Same storage, very different prices</p>

        <div className="cost-comparison-new">
          <div className="cost-tier-row">
            <div className="cost-tier-info">
              <span className="cost-tier-name">SharePoint</span>
              <span className="cost-tier-rate">$0.20 / GB / month</span>
            </div>
            <div className="cost-tier-bar sharepoint-bar">
              <div className="cost-tier-fill" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="cost-tier-row">
            <div className="cost-tier-info">
              <span className="cost-tier-name">Azure Cool</span>
              <span className="cost-tier-rate">$0.01 / GB / month</span>
            </div>
            <div className="cost-tier-bar cool-bar">
              <div className="cost-tier-fill" style={{ width: '5%' }}></div>
            </div>
          </div>

          <div className="cost-tier-row">
            <div className="cost-tier-info">
              <span className="cost-tier-name">Azure Archive</span>
              <span className="cost-tier-rate">$0.002 / GB / month</span>
            </div>
            <div className="cost-tier-bar archive-bar">
              <div className="cost-tier-fill" style={{ width: '1%' }}></div>
            </div>
          </div>
        </div>

        <div className="cost-example">
          <h4>Example: Storing 50 GB for one year</h4>
          <div className="cost-example-grid">
            <div className="cost-example-item sharepoint">
              <span className="cost-example-service">SharePoint</span>
              <span className="cost-example-amount">$120</span>
            </div>
            <div className="cost-example-item cool">
              <span className="cost-example-service">Azure Cool</span>
              <span className="cost-example-amount">$6</span>
            </div>
            <div className="cost-example-item archive">
              <span className="cost-example-service">Azure Archive</span>
              <span className="cost-example-amount">$1.20</span>
            </div>
          </div>
        </div>

        <p className="slide-takeaway">Active files in SharePoint. Archive the rest at a fraction of the cost.</p>
      </div>
    </div>
  );
}

// ============================================
// SLIDE 8: QUESTION - How do we know which files go where?
// ============================================
function QuestionApproach() {
  return (
    <QuestionSlide
      question="How do we know which files go where?"
      accentWord="which files"
      slideId="slide-q-approach"
    />
  );
}

// ============================================
// SLIDE 9: THE APPROACH (Answer) - Passive voice, no "we"
// ============================================
function ApproachSlide() {
  return (
    <div className="slide slide-classification">
      <BackgroundImage slideId="slide-classification" />
      <div className="slide-content">
        <h2>The Approach</h2>

        <div className="classification-steps-large">
          <div className="classification-step-large">
            <div className="step-number-large">1</div>
            <div className="step-content-large">
              <h4>Every file was inventoried</h4>
              <p>140,000+ files cataloged with creation dates, modification dates, sizes, types, and automatic flags for duplicates.</p>
            </div>
          </div>

          <div className="classification-step-large">
            <div className="step-number-large">2</div>
            <div className="step-content-large">
              <h4>Waste was identified automatically</h4>
              <p>Scripts flagged duplicates, temp files, empty files, and outdated formats without manual review.</p>
            </div>
          </div>

          <div className="classification-step-large">
            <div className="step-number-large">3</div>
            <div className="step-content-large">
              <h4>A modeling tool was built</h4>
              <p>Pick any time-based cutoff and instantly see how many files migrate, how many archive, and what it costs.</p>
            </div>
          </div>

          <div className="classification-step-large">
            <div className="step-number-large">4</div>
            <div className="step-content-large">
              <h4>The decision is yours</h4>
              <p>The tool shows the tradeoffs. Leadership picks the threshold that makes sense.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SLIDE 10: QUESTION - What does that look like for our files?
// ============================================
function QuestionData() {
  return (
    <QuestionSlide
      question="What does that look like for our files?"
      accentWord="our files"
      slideId="slide-q-data"
    />
  );
}

// ============================================
// SLIDE 11: UPLOAD ZONE (Transition to data)
// ============================================
const UploadSlide = forwardRef(function UploadSlide({ onFileUpload, isDragOver, onDragOver, onDragLeave, onDrop, onClick, fileInputRef }, ref) {
  return (
    <div className="slide slide-upload" ref={ref}>
      <BackgroundImage slideId="slide-upload" />
      <div className="slide-content">
        <h2>Let's find out.</h2>
        <p className="slide-lead">Load the file inventory to see the analysis.</p>

        <div
          className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onClick}
        >
          <svg className="drop-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Drop your CSV file here</h3>
          <p>or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={onFileUpload}
          />
        </div>
      </div>
    </div>
  );
});

export {
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
  QuestionSlide,
};
