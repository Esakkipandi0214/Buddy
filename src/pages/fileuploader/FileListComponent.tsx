'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

const Loader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-t-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-4 border-t-4 border-pink-500 border-t-transparent rounded-full animate-spin animation-delay-150"></div>
      <div className="absolute inset-4 border-4 border-t-4 border-indigo-500 border-t-transparent rounded-full animate-spin animation-delay-300"></div>
    </div>
  </div>
)

interface FileItem {
  docId?: string
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
  const [confirmDownloadUrl, setConfirmDownloadUrl] = useState<string | null>(null)
  const [qrFile, setQrFile] = useState<FileItem | null>(null)
  const [origin, setOrigin] = useState<string>('')

  // Set origin on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  const handleConfirmDownload = (file: FileItem) => {
    window.open(file.url, '_blank')
    setConfirmDownloadUrl(null)
  }

  return (
    <Suspense fallback={<Loader />}>
      <ul className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        {files?.length > 0 ? (
          files.map(file => (
            <li
              key={file.url}
              className="flex flex-col justify-start items-start lg:gap-2 p-4 bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-300"
            >
              <div className="flex-1">
                <p className="text-purple-700 font-medium break-words">{file.originalName}</p>
                <p className="text-sm text-gray-500">
                  Size: {(file.size / 1024).toFixed(2)} KB <br className="sm:hidden" />
                  Uploaded: {file.uploadedAt} <br className="sm:hidden" />
                  Type: {file.fileType}
                </p>
              </div>

              <div className="flex justify-start lg:justify-center  w-full lg:w-auto gap-2 pt-1 sm:gap-4 mt-2 sm:mt-0 flex-wrap">
                {confirmDownloadUrl === file.url ? (
                  <>
                    <button
                      onClick={() => handleConfirmDownload(file)}
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setConfirmDownloadUrl(null)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setConfirmDownloadUrl(file.url)}
                      className="bg-indigo-600 text-white px-2 py-1 md:px-4 md:py-2  rounded-lg hover:opacity-90 transition"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteClick(file)}
                      className="bg-red-500 text-white px-2 py-1 md:px-4 md:py-2  rounded-lg hover:opacity-90 transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setQrFile(file)}
                      className="bg-purple-600 text-white px-2 py-1 md:px-4 md:py-2 rounded-lg hover:opacity-90 transition"
                    >
                      QR
                    </button>
                  </>
                )}
              </div>
            </li>
          ))
        ) : (
          <li className="col-span-full px-2 md:px-4 py-3 md:py-6 text-center text-gray-500 bg-gray-50 rounded-2xl shadow">
            No matching files found
          </li>
        )}
      </ul>

      {/* QR Modal */}
      {qrFile && origin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-10 md:p-6 rounded-2xl shadow-lg flex flex-col items-center">
            <h2 className="text-lg text-black font-bold mb-4">{qrFile.originalName} QR</h2>
            <QRCodeCanvas
              id={`qr-${qrFile.docId}`}
              value={`${origin}/File-shared-download?fileId=${qrFile.docId}`}
              size={250}
              className=' flex md:hidden'
            />
            <QRCodeCanvas
              id={`qr-${qrFile.docId}`}
              value={`${origin}/File-shared-download?fileId=${qrFile.docId}`}
              size={200}
              className=' hidden md:flex'
            />
            <div className=" mt-9 md:mt-4 flex gap-4">
              <button
                onClick={() => setQrFile(null)}
                className="bg-gray-400 text-white px-5 text-lg md:text-3xl py-2 md:px-4 md:py-2 rounded-lg hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Suspense>
  )
}

export default FileList
