import React, { useState, useEffect } from 'react';
import { Files } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileSpreadsheet, File, FileVideo } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase'; // Import your Firebase configuration

interface Document {
  id: string;
  originalName: string;
  fileType: string; // This should be derived from the file extension
  size: number;
  uploadedAt: string;
  url: string;
  userId: string;
}

// Extension to file type mapping
const extensionToFileType: { [key: string]: string } = {
  'pdf': 'pdf',
  'doc': 'word',
  'docx': 'word',
  'xls': 'excel',
  'xlsx': 'excel',
  'ppt': 'powerpoint',
  'pptx': 'powerpoint',
  'txt': 'text',
  // Add more mappings as needed
};

const DocumentOverview: React.FC = () => {
  const [documentCounts, setDocumentCounts] = useState<{ [key: string]: number }>({});
  const [totalDocuments, setTotalDocuments] = useState(0);
  const userUid = localStorage.getItem('userUid');

  useEffect(() => {
    // Fetch data from Firestore
    const fetchDocuments = async () => {
      if (!userUid) {
        console.error('No user UID found in local storage');
        return;
      }

      try {
        const q = query(collection(db, 'userFiles'), where('userId', '==', userUid));
        const querySnapshot = await getDocs(q);
        const documents: Document[] = querySnapshot.docs.map((doc) => {
          const data = doc.data() as Document;
          // Extract file extension and map to file type
          const fileExtension = data.originalName.split('.').pop()?.toLowerCase() || '';
          return {
            ...data,
            fileType: extensionToFileType[fileExtension] || 'unknown'
          };
        });

        const counts = documents.reduce((acc, doc) => {
          acc[doc.fileType] = (acc[doc.fileType] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        setDocumentCounts(counts);
        setTotalDocuments(documents.length);
      } catch (error) {
        console.error('Error fetching documents: ', error);
      }
    };

    fetchDocuments();
  }, [userUid]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'word':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'excel':
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      case 'pdf':
        return <File className="h-6 w-6 text-red-500" />;
      case 'powerpoint':
        return <FileVideo className="h-6 w-6 text-orange-500" />;
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
