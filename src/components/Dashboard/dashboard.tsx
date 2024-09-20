import React from 'react';
import ScheduleOverview from './ScheduleOverview';
import DocumentOverview from './DocumentOverview';

const ScheduleAndDocumentOverview: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#e5989b] p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <ScheduleOverview />
        <DocumentOverview />
      </div>
    </div>
  );
};

export default ScheduleAndDocumentOverview;
