"use client";

import { useState, useEffect } from "react";
import {
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  QueryDocumentSnapshot,
  DocumentData,
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { app } from "../../firebase";
import Layout from "@/components/staticComponents/layout";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useRouter } from "next/router";
import FileList from "./FileListComponent";
// import FileDropdown from './FileDropdown'

const storage = getStorage(app);
const db = getFirestore(app);

type File = {
  url: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  userId?: string;
  fileType: string;
};

export default function FilesPage() {
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<File[]>([]);
  // const [showDropdown, setShowDropdown] = useState(false)
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filesPerPage] = useState(10);
  const [access, setAccess] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<File | null>(null);

  const router = useRouter();

  useEffect(() => {
    const userUid = localStorage.getItem("userUid");
    if (!userUid) {
      setAccess(false);
      router.push("/");
    } else {
      setAccess(true);
    }
  }, [router]);

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    paginateFiles();
  }, [allFiles, currentPage]);

  const acceptedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  // Map MIME types to friendly names
  const fileTypeNames: Record<string, string> = {
    "application/pdf": "PDF (.pdf)",
    "application/msword": "Word (.doc)",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Word (.docx)",
    "application/vnd.ms-excel": "Excel (.xls)",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "Excel (.xlsx)",
  };

  async function fetchFiles() {
    const userUid = localStorage.getItem("userUid");
    if (!userUid) return;

    try {
      const filesCollection = collection(db, "userFiles");
      const q = query(filesCollection, where("userId", "==", userUid));
      const querySnapshot = await getDocs(q);
      const filesData: File[] = querySnapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => ({
           docId: doc.id,  
          ...(doc.data() as File),
          uploadedAt: new Date(
            (doc.data() as File).uploadedAt
          ).toLocaleString(),
        })
      );
      setAllFiles(filesData);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch files.");
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const results = allFiles.filter((file) =>
      file.originalName.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  const paginateFiles = () => {
    const indexOfLast = currentPage * filesPerPage;
    const indexOfFirst = indexOfLast - filesPerPage;
    setFiles(allFiles.slice(indexOfFirst, indexOfLast));
  };

  const goToPage = (page: number) => setCurrentPage(page);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setError(null);

    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      setError("Please select a file.");
      setUploading(false);
      return;
    }

    if (!acceptedFileTypes.includes(file.type)) {
      const allowedTypes = acceptedFileTypes
        .map((type) => fileTypeNames[type])
        .join(", ");
      setError(`Invalid file type. Allowed types: ${allowedTypes}.`);
      setUploading(false);
      return;
    }

    const userUid = localStorage.getItem("userUid");
    if (!userUid) {
      setError("User not found.");
      setUploading(false);
      return;
    }

    // Check for duplicate file name
    const existing = allFiles.find((f) => f.originalName === file.name);
    if (existing) {
      setError("File with the same name already exists.");
      setUploading(false);
      return;
    }

    try {
      // Fetch user's storage limit and current used storage
      const userDoc = await getDoc(doc(db, "users", userUid));
      if (!userDoc.exists()) {
        setError("User storage data not found.");
        setUploading(false);
        return;
      }

      const userData = userDoc.data();
      const storageLimit = userData?.storageLimit || 0; // in bytes
      const usedStorage = userData?.usedStorage || 0; // in bytes

      // Define a maximum single file size (e.g., 5 MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // in bytes (5 MB)

      // Check if file is too large
      if (file.size > MAX_FILE_SIZE) {
        setError(
          `Upload failed. File size exceeds the maximum allowed size of ${formatBytes(
            MAX_FILE_SIZE
          )}.`
        );
        setUploading(false);
        return;
      }

      // Check if new file exceeds storage
      if (usedStorage + file.size > storageLimit) {
        setError(
          `Upload failed. You have exceeded your storage limit of ${formatBytes(
            storageLimit
          )}. You are currently using ${formatBytes(usedStorage)}.`
        );
        setUploading(false);
        return;
      }

      // Upload file to Firebase Storage
      const storageRef = ref(storage, `userFiles/${userUid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef);

      const fileMetadata = {
        url: fileURL,
        originalName: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        userId: userUid,
        fileType,
      };

      // Save file metadata in Firestore
      await addDoc(collection(db, "userFiles"), fileMetadata);

      // Update user's used storage
      await setDoc(
        doc(db, "users", userUid),
        {
          usedStorage: usedStorage + file.size,
        },
        { merge: true }
      );

      form.reset();
      setFileType("");
      setShowUploadModal(false);
      await fetchFiles();
    } catch (err) {
      console.error(err);
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  // Utility function to format bytes
  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  const handleDeleteClick = (file: File) => {
    setFileToDelete(file);
    setShowConfirm(true);
  };

  async function handleConfirmDelete() {
    if (!fileToDelete) return;

    const userUid = localStorage.getItem("userUid");
    if (!userUid) return;

    try {
      const fileRef = ref(
        storage,
        `userFiles/${userUid}/${fileToDelete.originalName}`
      );
      await deleteObject(fileRef);

      const filesCollection = collection(db, "userFiles");
      const q = query(
        filesCollection,
        where("originalName", "==", fileToDelete.originalName),
        where("userId", "==", userUid)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        await deleteDoc(querySnapshot.docs[0].ref);
      }

      await fetchFiles();
      // alert('File deleted successfully.')
      setShowConfirm(false);
    } catch (err) {
      console.error(err);
      setError("Failed to delete file.");
    }
  }

  const FinalFileResult =
    searchQuery.length > 0 && searchResults.length == 0
      ? []
      : searchResults.length > 0
      ? searchResults
      : files;

  return (
    <>
      <ConfirmModal
        isOpen={showConfirm}
        message={`Are you sure you want to delete "${fileToDelete?.originalName}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
      {access ? (
        <Layout>
          {/* Confirmation Modal */}

          <div className="container mx-auto p-4">
            <h1 className="text-3xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400">
              File Upload & Search
            </h1>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg mb-6 hover:opacity-90 transition"
            >
              Upload New File
            </button>

            {/* Upload Modal */}
            {showUploadModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
                  <button
                    onClick={() => {
                      setError("");
                      setShowUploadModal(false);
                    }}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg font-bold"
                  >
                    ✕
                  </button>
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Choose a file (PDF, Word, Excel)
                      </label>
                      <input
                        name="file"
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        required
                        className="border text-black border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        File Type
                      </label>
                      <input
                        type="text"
                        value={fileType}
                        onChange={(e) => setFileType(e.target.value)}
                        placeholder="Enter file type..."
                        className="border text-black border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white px-4 py-2 rounded-lg w-full hover:opacity-90 transition"
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </button>
                    {error && (
                      <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="mb-6 w-full lg:w-2/5 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Type to search..."
                className="w-full text-black rounded-xl border-2 border-indigo-300 py-3 px-4 pr-14 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                🔍
              </span>

              {/* <FileDropdown
                searchResults={searchResults}
                router={router}
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
              /> */}
            </div>

            {/* Paginated Files */}
            <FileList
              files={FinalFileResult}
              handleDeleteClick={handleDeleteClick}
            />

            {/* Pagination */}
            <div className="flex justify-center mt-6 gap-2">
              {Array.from(
                { length: Math.ceil(FinalFileResult.length / filesPerPage) },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded ${
                    page === currentPage
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </Layout>
      ) : (
        <div className="flex items-center justify-center h-screen bg-black">
          <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-green-400 to-purple-500 animate-pulse">
            Buddy...
          </p>
        </div>
      )}
    </>
  );
}
