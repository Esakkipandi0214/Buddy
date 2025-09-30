"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase"
import { FiDownload } from "react-icons/fi"

interface FileData {
  originalName: string
  size: number
  fileType: string
  uploadedAt: string
  url: string
}

export default function DownloadPage() {
  const [fileId, setFileId] = useState<string>("")
  const [fileData, setFileData] = useState<FileData>({} as FileData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get fileId from query string
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const id = searchParams.get("fileId")
    if (!id) {
      setError("No file ID provided")
      setLoading(false)
    } else {
      setFileId(id)
    }
  }, [])

  // Fetch file details
  useEffect(() => {
    if (!fileId) return
    const fetchFile = async () => {
      try {
        const fileRef = doc(db, "userFiles", fileId)
        const snap = await getDoc(fileRef)
        if (snap.exists()) {
          setFileData(snap.data() as FileData)
        } else {
          setError("File not found")
        }
      } catch (err) {
        console.error(err)
        setError("Failed to fetch file")
      } finally {
        setLoading(false)
      }
    }
    fetchFile()
  }, [fileId])

  if (loading)
    return (
    <div className="fixed inset-0 flex flex-col justify-center items-center z-50 bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-500 bg-opacity-30 backdrop-blur-md">
  {/* Spinner */}
  <div className="relative w-20 h-20 mb-6">
    <div className="absolute inset-0 border-4 border-t-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    <div className="absolute inset-2 border-4 border-t-4 border-pink-500 border-t-transparent rounded-full animate-spin animation-delay-150"></div>
    <div className="absolute inset-4 border-4 border-t-4 border-indigo-500 border-t-transparent rounded-full animate-spin animation-delay-300"></div>
  </div>

  {/* Loading Text */}
  <p className="text-white text-lg font-semibold animate-pulse text-center">
    Loading file details...
  </p>
  <p className="text-white text-sm mt-2 text-center">
    Please wait while we fetch your file securely.
  </p>
</div>

    )

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-500 p-6">
  <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full border-t-4 border-red-500">
    
    {/* Glow behind SVG */}
    <div className="absolute -top-6 w-20 h-20 rounded-full bg-red-500/20 animate-pulse"></div>

    {/* SVG Cross Icon */}
    <svg
  xmlns="http://www.w3.org/2000/svg"
  className="w-20 h-20 relative z-10"
  viewBox="0 0 100 100"
>
  {/* Circle background */}
  <circle
    cx="50"
    cy="50"
    r="48"
    fill="rgba(239, 68, 68, 0.2)" // soft red background
    stroke="#EF4444" // red border
    strokeWidth="4"
  />
  
  {/* Cross */}
  <line
    x1="30"
    y1="30"
    x2="70"
    y2="70"
    stroke="#EF4444"
    strokeWidth="6"
    strokeLinecap="round"
  />
  <line
    x1="30"
    y1="70"
    x2="70"
    y2="30"
    stroke="#EF4444"
    strokeWidth="6"
    strokeLinecap="round"
  />
</svg>


    <p className="text-red-500 text-2xl font-extrabold relative z-10 text-shadow-md">
      {error}
    </p>
    
    <p className="text-white/80 text-sm text-center relative z-10 leading-relaxed">
      The file could not be found or there was an error fetching it. <br />
      Please check the link or try again later.
    </p>

    <button 
      onClick={() => window.location.reload()} 
      className="mt-4 px-6 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-semibold shadow-lg transition-all transform hover:scale-105"
    >
      Retry
    </button>

  </div>
</div>


    )

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDownload = () => {
    if (!fileData) return
    // Open file in new tab
    window.open(fileData.url, "_blank")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-500 p-6">
      <div className="bg-white shadow-2xl rounded-3xl max-w-md w-full p-8 flex flex-col items-center border-t-8 border-purple-600">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">✨ File Details ✨</h1>

        <div className="w-full mb-6">
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Name:</span> {fileData.originalName}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Size:</span> {formatBytes(fileData.size)}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Type:</span> {fileData.fileType}
          </p>
          <p className="text-gray-700 mb-4">
            <span className="font-semibold">Uploaded:</span>{" "}
            {new Date(fileData.uploadedAt).toLocaleString()}
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-3 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-bold shadow-lg transform transition hover:scale-105 hover:shadow-2xl"
        >
          <FiDownload className="w-6 h-6" />
          Download
        </button>

        <p className="mt-4 text-white text-sm text-center">
          Click the button above to open your file in a new tab.
        </p>
      </div>
    </div>
  )
}
