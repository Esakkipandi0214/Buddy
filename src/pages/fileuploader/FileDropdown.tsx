import { useState } from "react"
import { NextRouter } from "next/router"

const PAGE_SIZE = 10

// Define the type for each file item
interface FileItem {
  originalName: string
  url: string
  size: number // size in bytes
}

// Define the props for the component
interface FileDropdownProps {
  searchResults: FileItem[]
  router: NextRouter
  showDropdown: boolean
  setShowDropdown: (value: boolean) => void
}

const FileDropdown: React.FC<FileDropdownProps> = ({
  searchResults,
  router,
  showDropdown,
  setShowDropdown,
}) => {
  const [page, setPage] = useState<number>(0)
  const totalPages = Math.ceil(searchResults.length / PAGE_SIZE)

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1)
  }

  const handlePrev = () => {
    if (page > 0) setPage(page - 1)
  }

  const paginatedResults = searchResults.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  )

  return (
    <>
      {showDropdown && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1">
          <ul className="bg-white border border-gray-300 rounded-lg max-h-64 overflow-y-auto shadow-lg">
            {paginatedResults.map((file) => (
              <li
                key={file.url}
                onClick={() => {
                  router.push(file.url)
                  setShowDropdown(false)
                }}
                className="px-4 py-2 text-black hover:bg-indigo-100 cursor-pointer flex justify-between"
              >
                <span>{file.originalName}</span>
                <span className="text-sm text-black">
                  {(file.size / 1024).toFixed(2)} KB
                </span>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex justify-between mt-1 px-2">
              <button
                onClick={handlePrev}
                disabled={page === 0}
                className="px-2 py-1 text-sm border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={page === totalPages - 1}
                className="px-2 py-1 text-sm border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default FileDropdown
