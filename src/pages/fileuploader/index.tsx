'use client'

import { useState, useEffect } from 'react'
import { getStorage, ref, uploadBytes,deleteObject, getDownloadURL } from 'firebase/storage'
import { getFirestore, collection, addDoc, query, where, getDocs,deleteDoc, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { app } from '../../firebase' // Adjust the import path as necessary
import Layout from '@/components/staticComponents/layout'
import { useRouter } from 'next/router';

// Initialize Firebase services
const storage = getStorage(app)
const db = getFirestore(app)

type File = {
  url: string
  originalName: string
  size: number
  uploadedAt: string
  userId?: string // Optional userId field for type consistency
  fileType: string // New field for file type
}

export default function FilesPage() {
  const [files, setFiles] = useState<File[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileType, setFileType] = useState('') // New state for file type
  const router = useRouter();
  const [access,setAccess]=useState<boolean>(false)

  useEffect(() => {
  
    redirect();
  }, [router]);
  
  const redirect = ()=>{
    const userUid = localStorage.getItem('userUid');
    if(!userUid){
      setAccess(false)
      router.push("/")
    }
    setAccess(true)
  
  }

  // Accepted file types (PDF, Word, Excel)
  const acceptedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

  useEffect(() => {
    fetchFiles()
  }, []) // Fetch files on mount

  useEffect(() => {
    if (files.length > 0) {
      applySearchFilter()
    }
  }, [searchQuery]) // Apply search filter whenever searchQuery changes

  async function fetchFiles() {
    const userUid = localStorage.getItem('userUid')
    if (!userUid) {
      setError('User ID not found.')
      return
    }

    setSearching(true)
    setError(null)
    try {
      const filesCollection = collection(db, 'userFiles')
      
      // Fetch all files for the user (without file name filter)
      const q = query(filesCollection, where('userId', '==', userUid))
      const querySnapshot = await getDocs(q)
      const filesData: File[] = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        ...(doc.data() as File),
        uploadedAt: new Date((doc.data() as File).uploadedAt).toLocaleString(),
      }))

      setFiles(filesData) // Set files after fetching
    } catch (err) {
      setError('Failed to fetch files. Please try again.')
      console.error('Error fetching files:', err)
    } finally {
      setSearching(false)
    }
  }

  function applySearchFilter() {
    if (!searchQuery) {
      // If no search query, reset to all files
      fetchFiles()
      return
    }

    const filteredFiles = files.filter(file =>
      file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFiles(filteredFiles)
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setUploading(true)
    setError(null)

    const form = event.currentTarget
    const fileInput = form.elements.namedItem('file') as HTMLInputElement
    const file = fileInput.files?.[0]

    if (!file) {
      setError('Please select a file to upload.')
      setUploading(false)
      return
    }

    // Validate file type
    if (!acceptedFileTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a PDF, Word, or Excel file.')
      setUploading(false)
      return
    }

    const userUid = localStorage.getItem('userUid')
    if (!userUid) {
      setError('User ID not found.')
      setUploading(false)
      return
    }

    try {
      const storageRef = ref(storage, `userFiles/${userUid}/${file.name}`)
      await uploadBytes(storageRef, file)
      const fileURL = await getDownloadURL(storageRef)
      const fileMetadata = {
        url: fileURL,
        originalName: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        userId: userUid,
        fileType // Include file type in metadata
      }

      await addDoc(collection(db, 'userFiles'), fileMetadata)

      await fetchFiles() // Fetch files after upload
      form.reset()
      setFileType('') // Reset file type state after upload
    } catch (err) {
      setError('Failed to upload file. Please try again.')
      console.error('Error uploading file:', err)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(file: File) {
    const userUid = localStorage.getItem('userUid')
    if (!userUid) {
      setError('User ID not found.')
      return
    }

    try {
      // Delete file from Firebase Storage
      const fileRef = ref(storage, `userFiles/${userUid}/${file.originalName}`)
      await deleteObject(fileRef)

      // Delete file document from Firestore
      const filesCollection = collection(db, 'userFiles')
      const q = query(filesCollection, where('originalName', '==', file.originalName), where('userId', '==', userUid))
      const querySnapshot = await getDocs(q)

      // Assuming the originalName is unique per user
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        await deleteDoc(docRef)
      }

      // Refresh the file list
      await fetchFiles()
      alert("File Deleted sucessfully...")
    } catch (err) {
      setError('Failed to delete file. Please try again.')
      console.error('Error deleting file:', err)
    }
  }

  return (
  <>{access ?
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">File Upload and Search</h1>

        <form onSubmit={handleUpload} className="mb-4 space-y-4">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Choose a file to upload (PDF, Word, Excel)
            </label>
            <input
              id="file-upload"
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx" // Restrict file types
              required
              className="border p-2 w-full sm:w-auto"
              aria-label="File to upload"
            />
          </div>
          <div>
            <label htmlFor="file-type" className="block text-sm font-medium text-gray-700 mb-2">
              File Type
            </label>
            <input
              id="file-type"
              type="text"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              placeholder="Enter file type..."
              className="border p-2 w-full sm:w-auto"
              aria-label="File type"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="bg-[#6d6875] text-white px-4 py-2 rounded disabled:bg-blue-300 w-full sm:w-auto"
            aria-busy={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>

        <div className="mb-4">
          <label htmlFor="file-search" className="block text-sm font-medium text-gray-700 mb-2">
            Search files
          </label>
          <input
            id="file-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter file name..."
            className="border p-2 w-full"
            aria-label="Search query for files"
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <ul className="space-y-2" aria-live="polite">
          {files.map((file) => (
            <li key={file.url} className="border bg-[#edf2f4] border-transparent p-2 rounded flex flex-col sm:flex-row items-center justify-between">
              <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <p className="text-blue-500">
                  {file.originalName}
                </p>
                <p className="text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4">
                  Size: {(file.size / 1024).toFixed(2)} KB | Uploaded: {file.uploadedAt} | Type: {file.fileType}
                </p>
              </div>
              <div className=' flex gap-6'>
              <a
  href={file.url}
  target="_blank" // This opens the link in a new tab
  rel="noopener noreferrer" // This prevents potential security risks
  className="bg-[#6d6875] text-white px-4 py-2 rounded mt-2 sm:mt-0 hover:bg-blue-700"
>
  Download
</a><button
                      onClick={() => handleDelete(file)}
                      className="bg-red-500 text-white px-4 py-2 rounded mt-2 sm:mt-0 "
                      aria-label={`Delete ${file.originalName}`}
                    >
                      Delete
                    </button>
              </div>
             
            </li>
          ))}
          {files.length === 0 && !searching && (
            <li>No files found.</li>
          )}
        </ul>
      </div>
    </Layout>:<div className="flex items-center bg-black justify-center h-screen">
  <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-green-400 to-purple-500 animate-pulse">
    Buddy...
  </p>
</div>
    }
    </>
  )
}
