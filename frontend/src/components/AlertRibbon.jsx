import React from 'react';

const AlertRibbon = ({ urgentNotice }) => {
  const text = urgentNotice 
    ? `CAMPUS ANNOUNCEMENT: ${urgentNotice.title} — ${urgentNotice.content}`
    : 'CAMPUS ANNOUNCEMENT: Mid-Term Examination Scheduling Changes Issued Safely Online. Please verify your portal for direct schedules.';

  return (
    <div className="alert-ribbon" role="alert">
      <span className="alert-badge">ALERT</span>
      <div className="alert-scroller">
        <span className="alert-text-scrolling">
          {text} &nbsp;&bull;&nbsp; {text} &nbsp;&bull;&nbsp; {text}
        </span>
      </div>
    </div>
  );
};

export default AlertRibbon;
