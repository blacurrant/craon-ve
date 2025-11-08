"use client"

import { useState } from "react"
import { VideoPreview } from "./video-preview"
import { ChatPanel } from "./chat-panel"
import { TimelineEditor } from "./timeline-editor"
import { UploadZone } from "./uploadZone"
import videoApi, { SubtitleSegment, VideoUploadResponse } from "@/lib/videoApi"

interface Message {
  id: string
  text: string
  type: "user" | "ai"
}

export default function VideoEditor() {
  const [messages, setMessages] = useState<Message[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null)
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    setVideoFile(file)
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    
    // Add initial message
    addAiMessage(`Video "${file.name}" selected. Uploading...`)
    
    try {
      setIsProcessing(true)
      
      // Upload video to backend
      const response = await videoApi.uploadVideo(file, (progress) => {
        setUploadProgress(progress)
      })
      
      setUploadedFileId(response.file_id)
      setVideoDuration(response.duration)
      
      addAiMessage(
        `Video uploaded successfully! Duration: ${formatDuration(response.duration)}. Ready for editing.`
      )
    } catch (error: any) {
      addAiMessage(`Upload failed: ${error.message || 'Unknown error'}`)
      console.error('Upload error:', error)
    } finally {
      setIsProcessing(false)
      setUploadProgress(0)
    }
  }

  const handleSendMessage = async (message: string) => {
    addUserMessage(message)
    
    if (!uploadedFileId) {
      addAiMessage("Please upload a video first before applying edits.")
      return
    }

    setIsProcessing(true)

    try {
      // Parse the message to determine action
      const lowerMessage = message.toLowerCase()

      if (lowerMessage.includes("subtitle") || lowerMessage.includes("caption")) {
        await handleAddSubtitles(message)
      } else if (lowerMessage.includes("download")) {
        await handleDownload()
      } else {
        addAiMessage(
          "I can help you with:\n• Adding subtitles to your video\n• Downloading the processed video\n\nWhat would you like to do?"
        )
      }
    } catch (error: any) {
      addAiMessage(`Error: ${error.message || 'Something went wrong'}`)
      console.error('Processing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddSubtitles = async (message: string) => {
    try {
      // Extract subtitle text from message
      const subtitleText = extractSubtitleText(message)
      
      if (!subtitleText) {
        addAiMessage("Please specify the subtitle text you want to add.")
        return
      }

      addAiMessage(`Adding subtitle: "${subtitleText}"...`)

      // Use simple subtitles API (spans entire video)
      const response = await videoApi.addSimpleSubtitles({
        file_id: uploadedFileId!,
        text: subtitleText,
      })

      setProcessedVideoUrl(videoApi.getDownloadUrl(uploadedFileId!))

      addAiMessage(
        `✓ Subtitles added successfully! Your video is ready to download.`
      )
    } catch (error: any) {
      throw new Error(`Failed to add subtitles: ${error.message}`)
    }
  }

  const handleAddTimedSubtitles = async (subtitles: SubtitleSegment[]) => {
    try {
      addAiMessage(`Adding ${subtitles.length} timed subtitle(s)...`)

      const response = await videoApi.addSubtitles({
        file_id: uploadedFileId!,
        subtitles,
        style: {
          font_size: 24,
          font_color: "white",
          bg_color: "black@0.5",
        },
      })

      setProcessedVideoUrl(videoApi.getDownloadUrl(uploadedFileId!))

      addAiMessage(
        `✓ Subtitles added successfully! Your video is ready to download.`
      )
    } catch (error: any) {
      throw new Error(`Failed to add timed subtitles: ${error.message}`)
    }
  }

  const handleDownload = async () => {
    if (!processedVideoUrl) {
      addAiMessage("No processed video available. Please add subtitles first.")
      return
    }

    try {
      addAiMessage("Preparing download...")

      // Trigger download
      const link = document.createElement('a')
      link.href = processedVideoUrl
      link.download = `video_with_subtitles_${Date.now()}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      addAiMessage("✓ Download started!")
    } catch (error: any) {
      throw new Error(`Download failed: ${error.message}`)
    }
  }

  const handleCleanup = async () => {
    if (!uploadedFileId) return

    try {
      await videoApi.cleanupFiles(uploadedFileId)
      
      // Reset state
      setVideoFile(null)
      setVideoUrl(null)
      setUploadedFileId(null)
      setProcessedVideoUrl(null)
      setVideoDuration(0)
      
      addAiMessage("Files cleaned up successfully.")
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  }

  // Helper functions
  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text, type: "user" },
    ])
  }

  const addAiMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: (Date.now() + 1).toString(), text, type: "ai" },
    ])
  }

  const extractSubtitleText = (message: string): string => {
    // Try to extract text in quotes
    const quotedMatch = message.match(/["'](.+)["']/)
    if (quotedMatch) return quotedMatch[1]

    // Otherwise, remove common command words
    const cleanedMessage = message
      .toLowerCase()
      .replace(/add|subtitle|caption|to|the|video/gi, '')
      .trim()

    return cleanedMessage || ''
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex max-h-[92vh] bg-black">
      <div className="w-1/4 flex flex-col bg-slate-950 border border-slate-800 overflow-hidden">
        <ChatPanel 
          messages={messages} 
          onSendMessage={handleSendMessage}
          isProcessing={isProcessing}
          uploadProgress={uploadProgress}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-slate-950 border border-slate-800 overflow-hidden py-4 px-8">
          <VideoPreview 
            videoUrl={processedVideoUrl || videoUrl} 
            duration={videoDuration}
          />
        </div>

        <div className="bg-slate-950 border border-slate-800 overflow-hidden">
          {!videoFile ? (
            <div className="p-8 h-80">
              <UploadZone onFileSelect={handleFileSelect} />
            </div>
          ) : (
            <TimelineEditor 
              videoFile={videoFile}
              duration={videoDuration}
              onAddSubtitles={handleAddTimedSubtitles}
            />
          )}
        </div>
      </div>
    </div>
  )
}