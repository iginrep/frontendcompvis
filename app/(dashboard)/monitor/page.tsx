"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Square, User } from "lucide-react"

interface DetectionResult {
  user_id?: string
  visitor_id?: string
  distance: number
  bounding_box: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface ApiResponse {
  status: string
  results: DetectionResult[]
}

// Generate random MongoDB ObjectID
const generateObjectId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0')
  const randomHex = () => Math.floor(Math.random() * 16).toString(16)
  return timestamp + Array.from({ length: 16 }, randomHex).join('')
}

export default function MonitorPage() {
  const [isLive, setIsLive] = useState(false)
  const [currentDetections, setCurrentDetections] = useState<any[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isLiveRef = useRef<boolean>(false)

  // Fetch user name by ID
  const fetchUserName = async (userId: string): Promise<string> => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        return data.name || `User ${userId.substring(0, 8)}`
      }
    } catch (error) {
      console.error('Error fetching user name:', error)
    }
    return `User ${userId.substring(0, 8)}`
  }

  // Fetch visitor name by ID
  const fetchVisitorName = async (visitorId: string): Promise<string> => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/users/visitor/${visitorId}`)
      if (response.ok) {
        const data = await response.json()
        return data.name || `Visitor ${visitorId.substring(0, 8)}`
      }
    } catch (error) {
      console.error('Error fetching visitor name:', error)
    }
    return `Visitor ${visitorId.substring(0, 8)}`
  }

  // Capture and send frame to API
  const captureAndSendFrame = async () => {
    // Stop if camera is not live
    if (!isLiveRef.current) return
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // Set canvas to target resolution
    canvas.width = 1280
    canvas.height = 720

    // Draw current video frame
    ctx.drawImage(video, 0, 0, 1280, 720)

    // Convert to JPEG Base64 with 85% quality
    canvas.toBlob(
      async (blob) => {
        if (!blob) return

        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64String = (reader.result as string).split(',')[1]

          try {
            const response = await fetch('http://127.0.0.1:8000/face/uploadmany', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                class_id: generateObjectId(),
                image_base64: base64String,
              }),
            })

            if (response.ok) {
              const data: ApiResponse = await response.json()
              
              if (data.status === 'success' && data.results.length > 0) {
                drawBoundingBoxes(data.results)
                updateLogs(data.results)
              } else {
                clearBoundingBoxes()
                setCurrentDetections([])
              }
            }
          } catch (error) {
            console.error('API Error:', error)
          }
        }
        reader.readAsDataURL(blob)
      },
      'image/jpeg',
      0.85
    )
  }

  // Draw bounding boxes on overlay canvas
  const drawBoundingBoxes = (results: DetectionResult[]) => {
    if (!overlayCanvasRef.current || !videoRef.current) return

    const canvas = overlayCanvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Match canvas size to video display size
    const rect = video.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Calculate scale factors
    const scaleX = rect.width / 1280
    const scaleY = rect.height / 720

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    results.forEach((result) => {
      const { x, y, width, height } = result.bounding_box
      
      // Scale coordinates to match display size
      const scaledX = x * scaleX
      const scaledY = y * scaleY
      const scaledWidth = width * scaleX
      const scaledHeight = height * scaleY

      // Determine color and label
      let color = '#eab308' // Yellow default for visitor
      let label = ''
      
      if (result.user_id) {
        // Student: Green with similarity
        color = '#22c55e'
        label = `Similarity: ${result.distance.toFixed(3)}`
      } else if (result.visitor_id) {
        // Check if distance is NULL (new visitor)
        if (result.distance === null || result.distance === undefined) {
          // New visitor: Green with "NEW"
          color = '#22c55e'
          label = 'NEW'
        } else {
          // Known visitor: Yellow with similarity
          color = '#eab308'
          label = `Similarity: ${result.distance.toFixed(3)}`
        }
      }
      
      // Draw bounding box
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight)

      // Draw label
      ctx.fillStyle = color
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText(label, scaledX, scaledY - 5)
    })
  }

  const clearBoundingBoxes = () => {
    if (!overlayCanvasRef.current) return
    const ctx = overlayCanvasRef.current.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height)
    }
  }

  // Update current detections (not logs)
  const updateLogs = async (results: DetectionResult[]) => {
    const detections = await Promise.all(
      results.map(async (result, index) => {
        let name = ''
        let type = ''
        let distance = 'NULL'
        
        if (result.user_id) {
          const userName = await fetchUserName(result.user_id)
          name = userName
          type = 'Student'
          distance = result.distance.toFixed(3)
        } else if (result.visitor_id) {
          const visitorName = await fetchVisitorName(result.visitor_id)
          name = visitorName
          type = 'Visitor'
          // Check if distance exists (recognized visitor) or NULL (new visitor)
          distance = result.distance !== null && result.distance !== undefined ? result.distance.toFixed(3) : 'NULL'
        }

        return {
          id: index,
          name,
          type,
          distance,
        }
      })
    )

    setCurrentDetections(detections)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: false 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        isLiveRef.current = true
        setIsLive(true)
        
        // Start capturing frames every 2 seconds
        captureIntervalRef.current = setInterval(() => {
          captureAndSendFrame()
        }, 2000)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    // Set live ref to false immediately to stop any pending captures
    isLiveRef.current = false
    
    // Clear capture interval
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
      captureIntervalRef.current = null
    }
    
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    // Clear canvases and detections
    clearBoundingBoxes()
    setCurrentDetections([])
    
    setIsLive(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden flex flex-col items-center justify-center border-4 border-white shadow-xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: isLive ? 'block' : 'none' }}
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ display: isLive ? 'block' : 'none' }}
        />
        {isLive && (
          <div className="absolute top-4 left-4 z-10">
            <span className="text-white font-bold flex items-center gap-2 bg-black/50 px-3 py-2 rounded-lg">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              LIVE FEED ACTIVE
            </span>
          </div>
        )}
        {!isLive && (
          <div className="text-slate-400 flex flex-col items-center gap-4">
            <h2 className="text-6xl font-black tracking-tighter opacity-20">LIVE CAMERA</h2>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Camera Controls</p>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={isLive ? "outline" : "secondary"}
            className="h-12 text-sm font-semibold rounded-xl"
            onClick={startCamera}
            disabled={isLive}
          >
            <Play className="mr-2 h-4 w-4" /> Start Camera
          </Button>
          <Button
            variant={!isLive ? "outline" : "secondary"}
            className="h-12 text-sm font-semibold rounded-xl"
            onClick={stopCamera}
            disabled={!isLive}
          >
            <Square className="mr-2 h-4 w-4" /> Stop Camera
          </Button>
        </div>
        <p className="text-xs text-slate-400">Choose an option.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-4xl font-bold tracking-tight text-slate-900">Currently Detected</h2>
        <div className="space-y-3">
          {currentDetections.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <User className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No faces detected</p>
              <p className="text-sm">Start the camera to begin face detection</p>
            </div>
          ) : (
            currentDetections.map((detection) => (
              <Card key={detection.id} className="overflow-hidden border-slate-200/60 hover:border-slate-300 transition-colors">
                <CardContent className="p-4 flex gap-4 items-center">
                  <div className="h-20 w-20 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                    <User className="h-10 w-10 text-slate-300" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-bold text-lg text-slate-900">{detection.name}</h3>
                    <p className="text-sm text-slate-500 font-medium italic">
                      Distance: <span className="font-bold">{detection.distance}</span>
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={`font-bold px-3 py-0.5 border-none ${
                        detection.type === 'Student' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {detection.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div> 
  )
}