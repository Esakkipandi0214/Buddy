import React, { useState, useEffect } from 'react';
import { Files } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileSpreadsheet, File, FileVideo } from 'lucide-react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

interface Document {
  id: string;
  originalName: string;
  fileType: string;
  size: number;
  uploadedAt: string;
  url: string;
  userId: string;
}

const extensionToFileType: { [key: string]: string } = {
  'pdf': 'pdf',
  'doc': 'word',
  'docx': 'word',
  'xls': 'excel',
  'xlsx': 'excel',
  'ppt': 'powerpoint',
  'pptx': 'powerpoint',
  'txt': 'text',
};

const DocumentOverview: React.FC = () => {
  const [documentCounts, setDocumentCounts] = useState<{ [key: string]: number }>({});
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [storageLimit, setStorageLimit] = useState(0);
  const [usedStorage, setUsedStorage] = useState(0);

  const userUid = localStorage.getItem('userUid');

  useEffect(() => {
    if (!userUid) return;

    const fetchDocumentsAndStorage = async () => {
      try {
        // Fetch documents
        const q = query(collection(db, 'userFiles'), where('userId', '==', userUid));
        const querySnapshot = await getDocs(q);
        const documents: Document[] = querySnapshot.docs.map((doc) => {
          const data = doc.data() as Document;
          const fileExtension = data.originalName.split('.').pop()?.toLowerCase() || '';
          return {
            ...data,
            fileType: extensionToFileType[fileExtension] || 'unknown'
          };
        });

        // Count documents by type
        const counts = documents.reduce((acc, doc) => {
          acc[doc.fileType] = (acc[doc.fileType] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        setDocumentCounts(counts);
        setTotalDocuments(documents.length);

        // Calculate used storage from documents
        const totalUsed = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
        setUsedStorage(totalUsed);

        // Fetch user's storage limit from 'users' collection
        const userDoc = await getDoc(doc(db, 'users', userUid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setStorageLimit(userData?.storageLimit || 0);
        }

      } catch (error) {
        console.error('Error fetching documents or storage: ', error);
      }
    };

    fetchDocumentsAndStorage();
  }, [userUid]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'word': return <FileText className="h-6 w-6 text-blue-500" />;
      case 'excel': return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      case 'pdf': return <File className="h-6 w-6 text-red-500" />;
      case 'powerpoint': return <FileVideo className="h-6 w-6 text-orange-500" />;
      default: return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg border border-white/30 shadow-2xl rounded-3xl transition-all duration-300 hover:shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:scale-[1.01]">
      <CardHeader className="pb-4 border-b border-purple-200">
        <CardTitle className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 text-transparent bg-clip-text">
          Document Overview
        </CardTitle>
      </CardHeader>

      <CardContent className="mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {/* Total Documents */}
          <div className="col-span-2 sm:col-span-3 md:col-span-5 flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white rounded-xl shadow-lg hover:scale-105 transition-transform duration-200">
            <Files className="h-6 w-6 mr-2" />
            <span className="text-lg sm:text-xl font-bold">
              Total Documents: {totalDocuments} | Storage: {formatBytes(usedStorage)} / {formatBytes(storageLimit)}
            </span>
          </div>

          {/* Document Type Counts */}
          {Object.entries(documentCounts).map(([type, count]) => (
            <div
              key={type}
              className="flex flex-col items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <div className="text-purple-600">{getFileIcon(type)}</div>
              <span className="mt-2 text-lg sm:text-xl font-bold text-purple-800">{count}</span>
              <span className="text-sm sm:text-base text-gray-600 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentOverview;
