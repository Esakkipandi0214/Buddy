import React, { useState, useEffect } from "react";
import { Files } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  FileSpreadsheet,
  File,
  FileVideo,
  Database,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase";

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
  pdf: "pdf",
  doc: "word",
  docx: "word",
  xls: "excel",
  xlsx: "excel",
  ppt: "powerpoint",
  pptx: "powerpoint",
  txt: "text",
};

const DocumentOverview: React.FC = () => {
  const [documentCounts, setDocumentCounts] = useState<{
    [key: string]: number;
  }>({});
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [storageLimit, setStorageLimit] = useState(0);
  const [usedStorage, setUsedStorage] = useState(0);

  const userUid = localStorage.getItem("userUid");

  useEffect(() => {
    if (!userUid) return;

    const fetchDocumentsAndStorage = async () => {
      try {
        // Fetch documents
        const q = query(
          collection(db, "userFiles"),
          where("userId", "==", userUid)
        );
        const querySnapshot = await getDocs(q);
        const documents: Document[] = querySnapshot.docs.map((doc) => {
          const data = doc.data() as Document;
          const fileExtension =
            data.originalName.split(".").pop()?.toLowerCase() || "";
          return {
            ...data,
            fileType: extensionToFileType[fileExtension] || "unknown",
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
        const totalUsed = documents.reduce(
          (sum, doc) => sum + (doc.size || 0),
          0
        );
        setUsedStorage(totalUsed);

        // Fetch user's storage limit from 'users' collection
        const userDoc = await getDoc(doc(db, "users", userUid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setStorageLimit(userData?.storageLimit || 0);
        }
      } catch (error) {
        console.error("Error fetching documents or storage: ", error);
      }
    };

    fetchDocumentsAndStorage();
  }, [userUid]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "word":
        return <FileText className="h-6 w-6 text-blue-500" />;
      case "excel":
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      case "pdf":
        return <File className="h-6 w-6 text-red-500" />;
      case "powerpoint":
        return <FileVideo className="h-6 w-6 text-orange-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
 <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md rounded-2xl transition-all duration-200 hover:shadow-lg hover:scale-[1.01]">
  <CardHeader className="pb-4 border-b border-gray-300">
    <CardTitle className="text-2xl sm:text-2xl font-semibold text-gray-800">
      Document Overview
    </CardTitle>
  </CardHeader>

  <CardContent className="mt-4">
    {/* Top row: Total Documents & Storage side by side on large screens */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {/* Total Documents */}
      <div className="flex items-center justify-center p-4 bg-gray-100 rounded-xl shadow-sm hover:shadow-md transition-transform duration-200">
        <Files className="h-6 w-6 mr-2 text-gray-600" />
        <span className="text-lg sm:text-sm font-medium text-gray-700">
          Total Documents: {totalDocuments}
        </span>
      </div>

      {/* Storage */}
      <div className="flex items-center justify-center p-4 bg-gray-100 rounded-xl shadow-sm hover:shadow-md transition-transform duration-200">
        <Database className="h-6 w-6 mr-2 text-gray-600" />
        <span className="text-base sm:text-sm font-medium text-gray-700">
          Storage: {formatBytes(usedStorage)} / {formatBytes(storageLimit)}
        </span>
      </div>
    </div>

    {/* Document Type Counts */}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {Object.entries(documentCounts).map(([type, count]) => (
        <div
          key={type}
          className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div className="text-gray-600">{getFileIcon(type)}</div>
          <span className="mt-2 text-sm sm:text-base font-medium text-gray-700">{count}</span>
          <span className="text-xs text-gray-500 capitalize">{type}</span>
        </div>
      ))}
    </div>
  </CardContent>
</Card>

  );
};

export default DocumentOverview;
