import React from 'react';
import ScheduleOverview from './ScheduleOverview';
import DocumentOverview from './DocumentOverview';

const ScheduleAndDocumentOverview: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-700 to-red-600 p-4 sm:p-6 lg:p-10">
    

        {/* Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ScheduleOverview />

            <DocumentOverview />
      </div>
    </div>
  );
};

export default ScheduleAndDocumentOverview;
