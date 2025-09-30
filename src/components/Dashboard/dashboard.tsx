import React from 'react';
import ScheduleOverview from './ScheduleOverview';
import DocumentOverview from './DocumentOverview';

const ScheduleAndDocumentOverview: React.FC = () => {
  return (
    <div className="min-h-screen bg-white/50 p-4 sm:p-6 lg:p-10">
    

        {/* Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ScheduleOverview />

            <DocumentOverview />
      </div>
    </div>
  );
};

export default ScheduleAndDocumentOverview;
