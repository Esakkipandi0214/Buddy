import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, FileText, FileSpreadsheet, File, Files } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Dummy data for schedules
const schedules = [
  { id: 1, time: '09:00', title: 'Team Meeting', duration: '1 hour' },
  { id: 2, time: '11:00', title: 'Client Call', duration: '30 minutes' },
  { id: 3, time: '13:00', title: 'Lunch Break', duration: '1 hour' },
  { id: 4, time: '14:30', title: 'Project Review', duration: '1.5 hours' },
  { id: 5, time: '16:30', title: 'Coffee Break', duration: '15 minutes' },
  { id: 6, time: '17:00', title: 'End of Day Wrap-up', duration: '30 minutes' },
]

// Dummy data for documents
const documents = [
  { id: 1, name: 'Project Proposal', type: 'word' },
  { id: 2, name: 'Financial Report', type: 'excel' },
  { id: 3, name: 'User Manual', type: 'pdf' },
  { id: 4, name: 'Meeting Minutes', type: 'word' },
  { id: 5, name: 'Data Analysis', type: 'excel' },
  { id: 6, name: 'Contract', type: 'pdf' },
  { id: 7, name: 'Presentation', type: 'powerpoint' },
]

const getFileIcon = (type: string) => {
  switch (type) {
    case 'word':
      return <FileText className="h-6 w-6 text-blue-500" />
    case 'excel':
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />
    case 'pdf':
      return <File className="h-6 w-6 text-red-500" />
    case 'powerpoint':
      return <File className="h-6 w-6 text-orange-500" />
    default:
      return <File className="h-6 w-6 text-gray-500" />
  }
}

export default function ScheduleAndDocumentOverview() {
  const [currentDate, setCurrentDate] = useState('')
  const [documentCounts, setDocumentCounts] = useState<{[key: string]: number}>({})
  const [totalDocuments, setTotalDocuments] = useState(0)

  useEffect(() => {
    const now = new Date()
    setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

    const counts = documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1
      return acc
    }, {} as {[key: string]: number})
    setDocumentCounts(counts)
    setTotalDocuments(documents.length)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Today&apos;s Schedule</CardTitle>
            <Badge variant="outline" className="flex items-center">
              <CalendarIcon className="mr-1 h-4 w-4" />
              {currentDate}
            </Badge>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {schedules.map((event) => (
                <div key={event.id} className="mb-4 last:mb-0">
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {event.time}
                    </Badge>
                    <div>
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Document Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <div className="col-span-2 sm:col-span-3 md:col-span-5 flex items-center justify-center p-4 bg-primary text-primary-foreground rounded-lg shadow">
                <Files className="h-6 w-6 mr-2" />
                <span className="text-lg font-semibold">Total Documents: {totalDocuments}</span>
              </div>
              {Object.entries(documentCounts).map(([type, count]) => (
                <div key={type} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow">
                  {getFileIcon(type)}
                  <span className="mt-2 text-lg font-semibold">{count}</span>
                  <span className="text-sm text-gray-500 capitalize">{type}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}