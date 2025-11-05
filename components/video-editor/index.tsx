"use client"

import { useState } from "react"
import { ChatPanel } from "./chat-panel"
import { VideoPreview } from "./video-preview"
import { TimelineEditor } from "./timeline-editor"

export function VideoEditor() {
  const [messages, setMessages] = useState<Array<{ id: string; text: string; type: "user" | "ai" }>>([
    { id: "1", text: "Hey, Please add subtitles", type: "ai" },
  ])

  const handleSendMessage = (message: string) => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), text: message, type: "user" }])
  }

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Left Panel - Chat */}
      <div className="w-1/4 flex flex-col bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
        <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
      </div>

      {/* Right Panel - Video and Timeline */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Video Preview */}
        <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
          <VideoPreview />
        </div>

        {/* Timeline Editor */}
        <div className="h-48 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
          <TimelineEditor />
        </div>
      </div>
    </div>
  )
}
