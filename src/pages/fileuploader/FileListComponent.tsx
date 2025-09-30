import React, { Suspense } from 'react'

// Loader component
const Loader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="relative w-16 h-16">
      {/* Outer spinning ring */}
      <div className="absolute inset-0 border-4 border-t-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      {/* Middle spinning ring */}
      <div className="absolute inset-2 border-4 border-t-4 border-pink-500 border-t-transparent rounded-full animate-spin animation-delay-150"></div>
      {/* Inner spinning ring */}
      <div className="absolute inset-4 border-4 border-t-4 border-indigo-500 border-t-transparent rounded-full animate-spin animation-delay-300"></div>
    </div>
  </div>
)


interface FileItem {
  url: string
  originalName: string
  size: number
  uploadedAt: string
  fileType: string
}

interface FileListProps {
  files: FileItem[]
  handleDeleteClick: (file: FileItem) => void
}

const FileList: React.FC<FileListProps> = ({ files, handleDeleteClick }) => {
  return (
    <Suspense fallback={<Loader />}>
      <ul className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4">
        {files?.length > 0 ? (
          files?.map(file => (
            <li
              key={file.url}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-300"
            >
              <div className="flex-1">
                <p className="text-purple-700 font-medium break-words">{file.originalName}</p>
                <p className="text-sm text-gray-500">
                  Size: {(file.size / 1024).toFixed(2)} KB <br className="sm:hidden" />
                  Uploaded: {file.uploadedAt} <br className="sm:hidden" />
                  Type: {file.fileType}
                </p>
              </div>
              <div className="flex gap-2 sm:gap-4 mt-2 sm:mt-0 flex-wrap">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                  Download
                </a>
                <button
                  onClick={() => handleDeleteClick(file)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        ) : (
          <li className="col-span-full px-4 py-6 text-center text-gray-500 bg-gray-50 rounded-2xl shadow">
            No matching files found
          </li>
        )}
      </ul>
    </Suspense>
  )
}

export default FileList
