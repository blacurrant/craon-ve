"use client"

import { useState } from "react"
import { Copy, Trash2 } from "lucide-react"

export function TimelineEditor() {
  const [activeTab, setActiveTab] = useState("all-changes")

  const prompts = [
    { id: 1, text: "Prompt edit 01.....", isActive: true },
    { id: 2, text: "Prompt edit 02.....", isActive: false },
  ]

  const frameIndices = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100">
      {/* Tabs */}
      <div className="flex items-center gap-4 px-4 pt-4 pb-2 border-b border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab("all-changes")}
          className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
            activeTab === "all-changes"
              ? "text-white border-b-2 border-blue-500"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          All Changes
        </button>
        <button
          onClick={() => setActiveTab("raw-files")}
          className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
            activeTab === "raw-files" ? "text-white border-b-2 border-blue-500" : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Raw Files
        </button>
        <button
          onClick={() => setActiveTab("ai-changes")}
          className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
            activeTab === "ai-changes" ? "text-white border-b-2 border-blue-500" : "text-slate-400 hover:text-slate-300"
          }`}
        >
          AI Changes
        </button>

        {/* Video Info */}
        <div className="ml-auto flex items-center gap-4 text-xs text-slate-400">
          <span>24FPS</span>
          <span>00:00 / 04:38</span>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Timecode Ruler */}
        <div className="px-4 pt-2 pb-1 border-b border-slate-800 bg-slate-900">
          <div className="flex gap-2 text-xs text-slate-500">
            <span>0:00</span>
            <span>0:30</span>
            <span>1:00</span>
            <span>1:30</span>
            <span>2:00</span>
            <span>2:30</span>
            <span>3:00</span>
          </div>
        </div>

        {/* Video Frames */}
        <div className="px-4 py-2">
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-400 mb-2">Original Video</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {frameIndices.map((idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-16 h-12 bg-slate-800 rounded border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                >
                  <img
                    src={`/video-frame.png?height=48&width=64&query=video frame ${idx}`}
                    alt={`Frame ${idx}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Edits */}
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="flex items-center gap-2 group">
                <div
                  className={`flex-1 px-3 py-2 rounded text-sm flex items-center justify-between ${
                    prompt.isActive ? "bg-blue-950 border border-blue-600" : "bg-slate-900 border border-slate-700"
                  }`}
                >
                  <span className="text-slate-300">{prompt.text}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-slate-800 rounded">
                      <Copy className="w-3 h-3 text-slate-400" />
                    </button>
                    <button className="p-1 hover:bg-slate-800 rounded">
                      <Trash2 className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scrubber */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-900">
        <div className="h-1 bg-slate-800 rounded-full cursor-pointer hover:h-1.5 transition-all">
          <div className="h-full w-1/4 bg-white rounded-full relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
