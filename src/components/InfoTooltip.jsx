import { useState } from 'react';

export default function InfoTooltip({ text }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="info-tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span className="info-tooltip-trigger">?</span>
      {isVisible && (
        <div className="info-tooltip-content">
          {text}
        </div>
      )}
    </div>
  );
}
