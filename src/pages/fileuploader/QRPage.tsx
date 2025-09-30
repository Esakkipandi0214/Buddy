"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase"
import { QRCodeCanvas } from "qrcode.react"

export default function QRPage() {
  const params = useSearchParams()
  const userId = params.get("userId")
  const fileId = params.get("fileId")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fileData, setFileData] = useState<any>(null)

  useEffect(() => {
    const fetchFile = async () => {
      if (!fileId) return
      const fileRef = doc(db, "userFiles", fileId)
      const snap = await getDoc(fileRef)
      if (snap.exists()) setFileData(snap.data())
    }
    fetchFile()
  }, [fileId])

  if (!fileData) return <p className="text-center mt-10">Loading...</p>

  const downloadUrl = `${window.location.origin}/download?userId=${userId}&fileId=${fileId}`

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Download via QR</h1>
      <QRCodeCanvas value={downloadUrl} size={200} />
      <p className="mt-4 text-gray-600">{fileData.originalName}</p>
      <a
        href={fileData.url}
        download
        className="mt-6 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
      >
        Download File
      </a>
    </div>
  )
}
