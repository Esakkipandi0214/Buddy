import React, { useState, useEffect } from 'react';
import { Files } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileSpreadsheet, File } from 'lucide-react';

interface Document {
  id: number;
  name: string;
  type: string;
}

const DocumentOverview: React.FC = () => {
  const [documentCounts, setDocumentCounts] = useState<{ [key: string]: number }>({});
  const [totalDocuments, setTotalDocuments] = useState(0);

  useEffect(() => {
    // Dummy data for documents
    const documents: Document[] = [
      { id: 1, name: 'Project Proposal', type: 'word' },
      { id: 2, name: 'Financial Report', type: 'excel' },
      { id: 3, name: 'User Manual', type: 'pdf' },
      { id: 4, name: 'Meeting Minutes', type: 'word' },
      { id: 5, name: 'Data Analysis', type: 'excel' },
      { id: 6, name: 'Contract', type: 'pdf' },
      { id: 7, name: 'Presentation', type: 'powerpoint' },
    ];

    const counts = documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    setDocumentCounts(counts);
    setTotalDocuments(documents.length);
  }, []);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'word':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'excel':
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      case 'pdf':
        return <File className="h-6 w-6 text-red-500" />;
      case 'powerpoint':
        return <File className="h-6 w-6 text-orange-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Document Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div className="col-span-2 sm:col-span-3 md:col-span-5 flex items-center justify-center p-4 bg-primary text-primary-foreground rounded-lg shadow">
            <Files className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">Total Documents: {totalDocuments}</span>
          </div>
          {Object.entries(documentCounts).map(([type, count]) => (
            <div key={type} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow">
              {getFileIcon(type)}
              <span className="mt-2 text-lg font-semibold">{count}</span>
              <span className="text-sm text-gray-500 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentOverview;
