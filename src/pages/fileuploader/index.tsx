'use client'

import { useState, useEffect } from 'react'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getFirestore, collection, addDoc, query, where, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { app } from '../../firebase' // Adjust the import path as necessary
import Layout from '@/components/staticComponents/layout'

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

  useEffect(() => {
    fetchFiles(searchQuery)
  }, [searchQuery]) // Fetch files whenever searchQuery changes

  async function fetchFiles(queryText?: string) {
    const userUid = localStorage.getItem('userUid')
    if (!userUid) {
      setError('User ID not found.')
      return
    }

    setSearching(true)
    setError(null)
    try {
      const filesCollection = collection(db, 'userFiles')
      const q = queryText
        ? query(filesCollection, where('originalName', '>=', queryText), where('originalName', '<=', queryText + '\uf8ff'))
        : filesCollection

      const querySnapshot = await getDocs(q)
      const filesData: File[] = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        ...(doc.data() as File),
        uploadedAt: new Date((doc.data() as File).uploadedAt).toLocaleString(),
      }))
      setFiles(filesData)
    } catch (err) {
      setError('Failed to fetch files. Please try again.')
      console.error('Error fetching files:', err)
    } finally {
      setSearching(false)
    }
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

      await fetchFiles(searchQuery) // Fetch files with the current search query
      form.reset()
      setFileType('') // Reset file type state after upload
    } catch (err) {
      setError('Failed to upload file. Please try again.')
      console.error('Error uploading file:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Layout>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">File Upload and Search</h1>

      <form onSubmit={handleUpload} className="mb-4 space-y-4">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Choose a file to upload
          </label>
          <input
            id="file-upload"
            name="file"
            type="file"
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
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300 w-full sm:w-auto"
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
          <li key={file.url} className="border p-2 rounded flex flex-col sm:flex-row items-center justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <p className="text-blue-500">
                {file.originalName}
              </p>
              <p className="text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4">
                Size: {(file.size / 1024).toFixed(2)} KB | Uploaded: {file.uploadedAt} | Type: {file.fileType}
              </p>
            </div>
            <a
              href={file.url}
              download
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2 sm:mt-0 hover:bg-blue-700"
            >
              Download
            </a>
          </li>
        ))}
        {files.length === 0 && !searching && (
          <li>No files found.</li>
        )}
      </ul>
    </div>
    </Layout>
  )
}
