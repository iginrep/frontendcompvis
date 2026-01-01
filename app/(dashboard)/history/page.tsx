"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, User } from "lucide-react"

interface AttendeeData {
  _id: string
  timestamp: string
  full_name: string
  category: "Mahasiswa" | "Visitor"
}

interface ApiResponse {
  scenario: string
  start_time: string
  end_time: string
  total_attendance: number
  attendees: AttendeeData[]
}

export default function HistoryPage() {
  const [filterMode, setFilterMode] = useState<"subject" | "room">("subject")
  const [activeLogType, setActiveLogType] = useState<"student" | "visitor">("student")
  const [studentPage, setStudentPage] = useState(1)
  const [visitorPage, setVisitorPage] = useState(1)
  
  // Form states for Room & Schedule filter
  const [roomNumber, setRoomNumber] = useState("")
  const [specificDate, setSpecificDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  
  // Hardcoded class ObjectId mapping (temporary solution)
  // TODO: Replace with dynamic API call when backend endpoint is ready
  const classIdMap: Record<string, string> = {
    "101": "694f3f10825e7bcbbe801d12", // ObjectId from MongoDB Attendance collection
  }
  
  // API response data
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch attendance data
  const fetchAttendanceData = async () => {
    if (!roomNumber || !specificDate || !startTime || !endTime) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get class_id from hardcoded mapping
      const class_id = classIdMap[roomNumber]
      
      if (!class_id) {
        throw new Error(`Class "${roomNumber}" not found. Available classes: ${Object.keys(classIdMap).join(", ")}`)
      }

      // Build URL with query parameters
      const url = new URL("http://localhost:8000/attendance/attendance/report/by-manual")
      url.searchParams.append("class_id", class_id)
      url.searchParams.append("specific_date", specificDate)
      url.searchParams.append("start_time_str", startTime)
      url.searchParams.append("end_time_str", endTime)

      console.log("Fetching attendance with URL:", url.toString())

      const response = await fetch(url, {
        method: "GET",
      })

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to fetch attendance data" }))
        console.error("Error response:", errorData)
        throw new Error(errorData.detail || `Server error: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      console.log("Received data:", data)
      console.log("Attendees array:", data.attendees)
      console.log("Attendees length:", data.attendees?.length || 0)
      
      // Check if attendees exist but might be in different format
      if (!data.attendees || data.attendees.length === 0) {
        console.warn("No attendees found in response. Full response:", JSON.stringify(data, null, 2))
      }
      
      setApiData(data)
    } catch (err) {
      console.error("Error fetching attendance:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setApiData(null)
    } finally {
      setLoading(false)
    }
  }

  // Filter attendees by category
  const mahasiswaData = apiData?.attendees.filter((a) => a.category === "Mahasiswa") || []
  const visitorData = apiData?.attendees.filter((a) => a.category === "Visitor") || []

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Filter Attendance Data</h1>
          <div className="flex justify-center">
            <div className="inline-flex p-1 bg-slate-200/50 rounded-xl">
              <button
                onClick={() => setFilterMode("subject")}
                className={cn(
                  "px-6 py-2 text-sm font-bold rounded-lg transition-all",
                  filterMode === "subject"
                    ? "bg-slate-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                By Subject
              </button>
              <button
                onClick={() => setFilterMode("room")}
                className={cn(
                  "px-6 py-2 text-sm font-bold rounded-lg transition-all",
                  filterMode === "room" ? "bg-slate-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-900",
                )}
              >
                By Room & Sc...
              </button>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-sm bg-white p-8 space-y-8 rounded-3xl">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">Attendance Filter</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filterMode === "subject" ? (
              <>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-900">Subject Name</Label>
                  <Input placeholder="Select Subject" className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                  <p className="text-xs text-slate-400 font-medium">Choose from the available subjects</p>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-900">Date</Label>
                  <Input
                    placeholder="Select Date"
                    type="date"
                    className="h-12 rounded-xl bg-slate-50 border-slate-200"
                  />
                  <p className="text-xs text-slate-400 font-medium">Format: MM/DD/YYYY</p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-900">Class/Room Name</Label>
                  <Input 
                    placeholder="Enter Class Name (e.g., 101)" 
                    className="h-12 rounded-xl bg-slate-50 border-slate-200"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 font-medium">Enter class name to fetch attendance</p>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-900">Date</Label>
                  <Input
                    placeholder="Select Date"
                    type="date"
                    className="h-12 rounded-xl bg-slate-50 border-slate-200"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 font-medium">Format: YYYY-MM-DD</p>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-900">Start Time</Label>
                  <Input
                    placeholder="HH:MM"
                    type="time"
                    className="h-12 rounded-xl bg-slate-50 border-slate-200"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 font-medium">Enter the start time</p>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-900">End Time</Label>
                  <Input
                    placeholder="HH:MM"
                    type="time"
                    className="h-12 rounded-xl bg-slate-50 border-slate-200"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 font-medium">Enter the end time</p>
                </div>
              </>
            )}
          </div>
          {filterMode === "room" && (
            <div className="flex justify-end pt-4">
              <Button
                onClick={fetchAttendanceData}
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl"
              >
                {loading ? "Loading..." : "Search Attendance"}
              </Button>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
        </Card>
      </div>

      {filterMode === "room" && apiData && (
        <>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-slate-100 rounded-xl p-6 space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Search Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Scenario:</span>
                  <span className="font-bold text-slate-900 ml-2">{apiData.scenario}</span>
                </div>
                <div>
                  <span className="text-slate-600">Total Attendance:</span>
                  <span className="font-bold text-slate-900 ml-2">{apiData.total_attendance}</span>
                </div>
                <div>
                  <span className="text-slate-600">Start Time:</span>
                  <span className="font-bold text-slate-900 ml-2">
                    {new Date(apiData.start_time).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">End Time:</span>
                  <span className="font-bold text-slate-900 ml-2">
                    {new Date(apiData.end_time).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Search Results</h2>
            <div className="flex justify-center mb-8">
              <div className="inline-flex p-1 bg-slate-200/50 rounded-xl">
                <button
                  onClick={() => setActiveLogType("student")}
                  className={cn(
                    "px-8 py-3 text-sm font-bold rounded-lg transition-all",
                    activeLogType === "student"
                      ? "bg-slate-950 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  Mahasiswa ({mahasiswaData.length})
                </button>
                <button
                  onClick={() => setActiveLogType("visitor")}
                  className={cn(
                    "px-8 py-3 text-sm font-bold rounded-lg transition-all",
                    activeLogType === "visitor"
                      ? "bg-slate-950 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  Visitor ({visitorData.length})
                </button>
              </div>
            </div>
            <div className="grid gap-4">
              {activeLogType === "student" ? (
                <LogSummaryCard
                  title="Mahasiswa Logs"
                  description="Here are the attendance records for Mahasiswa."
                  tags={["Time", "Photo", "Name"]}
                />
              ) : (
                <LogSummaryCard
                  title="Visitor Logs"
                  description="Here are the attendance records for Visitors."
                  tags={["Time", "Photo", "Name"]}
                />
              )}
            </div>
          </div>

          <div className="space-y-8">
            {activeLogType === "student" ? (
              <AttendanceTableDynamic
                title="Mahasiswa Attendance Records"
                headers={["MAHASISWA NAME", "TIME IN", "ID"]}
                data={mahasiswaData}
                currentPage={studentPage}
                onPageChange={setStudentPage}
              />
            ) : (
              <AttendanceTableDynamic
                title="Visitor Records"
                headers={["VISITOR NAME", "TIME IN", "ID"]}
                data={visitorData}
                currentPage={visitorPage}
                onPageChange={setVisitorPage}
              />
            )}
          </div>
        </>
      )}

      {filterMode === "subject" && (
        <>
          <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Search Results</h2>
            <div className="flex justify-center mb-8">
              <div className="inline-flex p-1 bg-slate-200/50 rounded-xl">
                <button
                  onClick={() => setActiveLogType("student")}
                  className={cn(
                    "px-8 py-3 text-sm font-bold rounded-lg transition-all",
                    activeLogType === "student"
                      ? "bg-slate-950 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  Student Logs
                </button>
                <button
                  onClick={() => setActiveLogType("visitor")}
                  className={cn(
                    "px-8 py-3 text-sm font-bold rounded-lg transition-all",
                    activeLogType === "visitor"
                      ? "bg-slate-950 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  Visitor Logs
                </button>
              </div>
            </div>
            <div className="grid gap-4">
              {activeLogType === "student" ? (
                <LogSummaryCard
                  title="Student Logs"
                  description="Here are the attendance records for students."
                  tags={["Time", "Photo", "Name"]}
                />
              ) : (
                <LogSummaryCard
                  title="Guest / Visitor Logs"
                  description="Here are the attendance records for guests and visitors."
                  tags={["Time", "Photo", "Name", "Purpose"]}
                />
              )}
            </div>
          </div>

          <div className="space-y-8">
            {activeLogType === "student" ? (
              <AttendanceTable
                title="Student Attendance Records"
                headers={["STUDENT NAME", "TIME IN", "STUDENT ID"]}
                data={[
                  { name: "Andi Saputra", time: "07:58 AM", id: "10115023" },
                  { name: "Budi Santoso", time: "08:00 AM", id: "10115024" },
                  { name: "Citra Lestari", time: "07:55 AM", id: "10115025" },
                  { name: "Dewi Kartika", time: "08:05 AM", id: "10115026" },
                ]}
                currentPage={studentPage}
                onPageChange={setStudentPage}
              />
            ) : (
              <AttendanceTable
                title="Guest/Visitors Records"
                headers={["GUEST/VISITOR NAME", "TIME IN"]}
                data={[
                  { name: "Visitor 1", time: "09:15 AM" },
                  { name: "Visitor 2", time: "10:30 AM" },
                  { name: "Visitor 3", time: "11:45 AM" },
                  { name: "Visitor 4", time: "13:20 PM" },
                ]}
                currentPage={visitorPage}
                onPageChange={setVisitorPage}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

function LogSummaryCard({ title, description, tags }: { title: string; description: string; tags: string[] }) {
  return (
    <Card className="border border-slate-200 shadow-sm p-6 flex gap-6 items-center rounded-2xl">
      <div className="h-20 w-20 bg-slate-100 rounded-lg flex-shrink-0" />
      <div className="space-y-2">
        <h3 className="font-bold text-xl text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 font-medium">{description}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-slate-100 text-slate-500 font-bold px-3 py-0.5 border-none text-[10px] uppercase"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-2 text-[10px] font-bold text-slate-400">
          <div className="h-3 w-3 rounded-full bg-slate-300" />
          ATTENDANCE SYSTEM
        </div>
      </div>
    </Card>
  )
}

function AttendanceTableDynamic({
  title,
  headers,
  data,
  currentPage,
  onPageChange,
}: {
  title: string
  headers: string[]
  data: AttendeeData[]
  currentPage: number
  onPageChange: (page: number) => void
}) {
  const itemsPerPage = 10
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (data.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
        <div className="bg-slate-100 rounded-xl p-12 text-center">
          <p className="text-slate-500 font-medium">No attendance records found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
      <div className="bg-[#1e293b] rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700/50">
              {headers.map((header) => (
                <th key={header} className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {currentData.map((row, i) => (
              <tr key={row._id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-slate-700">
                      <AvatarImage src={`/avatar-${i}.jpg`} />
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-slate-100 text-lg">{row.full_name}</span>
                  </div>
                </td>
                <td className="px-8 py-4 text-slate-300 text-lg font-medium">{formatTime(row.timestamp)}</td>
                <td className="px-8 py-4 text-slate-300 text-lg font-medium">{row._id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 font-bold hover:bg-blue-50"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(4, totalPages) }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === currentPage ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-xs font-bold rounded-lg",
                    p === currentPage ? "bg-blue-600 text-white" : "text-slate-400",
                  )}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </Button>
              ))}
              {totalPages > 4 && (
                <>
                  <span className="px-2 text-slate-300">...</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-xs font-bold text-slate-400"
                    onClick={() => onPageChange(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 font-bold hover:bg-blue-50"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function AttendanceTable({
  title,
  headers,
  data,
  currentPage,
  onPageChange,
}: {
  title: string
  headers: string[]
  data: any[]
  currentPage: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
      <div className="bg-[#1e293b] rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700/50">
              {headers.map((header) => (
                <th key={header} className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-slate-700">
                      <AvatarImage src={`/student-.jpg?height=40&width=40&query=student-${i}`} />
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-slate-100 text-lg">{row.name}</span>
                  </div>
                </td>
                <td className="px-8 py-4 text-slate-300 text-lg font-medium">{row.time}</td>
                {row.id && <td className="px-8 py-4 text-slate-300 text-lg font-medium">{row.id}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center pt-4">
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 font-bold hover:bg-blue-50"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((p) => (
              <Button
                key={p}
                variant={p === currentPage ? "default" : "ghost"}
                size="icon"
                className={cn(
                  "h-8 w-8 text-xs font-bold rounded-lg",
                  p === currentPage ? "bg-blue-600 text-white" : "text-slate-400",
                )}
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            ))}
            <span className="px-2 text-slate-300">...</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-xs font-bold text-slate-400"
              onClick={() => onPageChange(12)}
            >
              12
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 font-bold hover:bg-blue-50"
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"
