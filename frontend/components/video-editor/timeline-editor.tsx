"use client"

import { useState } from "react"
import { Trash2, Volume2, CopyX as Copy2, Play, Pause, SkipBack, SkipForward } from "lucide-react"

export function TimelineEditor() {
  const [activeTab, setActiveTab] = useState("all-changes")
  const [isPlaying, setIsPlaying] = useState(false)
  const [playheadPosition, setPlayheadPosition] = useState(0)

  const prompts = [
    { id: 1, text: "Prompt edit 01......", isActive: true },
    { id: 2, text: "Prompt edit 02......", isActive: false },
  ]

  const frameIndices = Array.from({ length: 12 }, (_, i) => i)

  const editLayers = [
    { id: 1, startTime: 0.5, duration: 1.5, text: "hey this is rtvll", color: "bg-blue-900/60" },
    { id: 2, startTime: 2.5, duration: 1.2, text: "", color: "bg-purple-900/60" },
    // { id: 3, startTime: 4.0, duration: 0.8, text: "", color: "bg-slate-700/60" },
    // { id: 4, startTime: 5.5, duration: 1.0, text: "", color: "bg-blue-800/60" },
  ]

  const timeToPixels = (time: number) => time * 100

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100">
      {/* Top Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        {/* Tabs */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("all-changes")}
            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "all-changes"
                ? "text-white border-slate-400"
                : "text-slate-500 border-transparent hover:text-slate-400"
            }`}
          >
            All Changes
          </button>
          <button
            onClick={() => setActiveTab("raw-files")}
            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "raw-files"
                ? "text-white border-slate-400"
                : "text-slate-500 border-transparent hover:text-slate-400"
            }`}
          >
            Raw Files
          </button>
          <button
            onClick={() => setActiveTab("ai-changes")}
            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "ai-changes"
                ? "text-white border-slate-400"
                : "text-slate-500 border-transparent hover:text-slate-400"
            }`}
          >
            AI Changes
          </button>
        </div>

        {/* Video Info and Controls */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="text-red-500 w-2 h-2 rounded-full bg-red-500" />
            <span>24FPS</span>
            <span>00:00 / 04:38</span>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-slate-800 rounded transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 hover:bg-slate-800 rounded transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button className="p-1.5 hover:bg-slate-800 rounded transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Split Button */}
          <button className="px-3 py-1.5 text-sm border border-slate-600 rounded hover:bg-slate-800 transition-colors">
            Split
          </button>
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Edit History */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/30 overflow-y-auto flex flex-col">
          {/* Original Video Section */}
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-400">Original Video</p>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-slate-700 rounded transition-colors">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                </button>
                <button className="p-1 hover:bg-slate-700 rounded transition-colors">
                  <Copy2 className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Prompt Edits */}
          <div className="flex-1 overflow-y-auto">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className={`px-4 py-3 border-b border-slate-800 group cursor-pointer transition-colors hover:bg-slate-800/30 ${
                  prompt.isActive ? "bg-slate-800/50" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-300 flex-1 truncate">{prompt.text}</span>
                  <button className="p-1 hover:bg-slate-700 rounded transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Timecode Ruler */}
          <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800">
            <div className="flex text-xs text-slate-500 font-mono" style={{ columnGap: "100px" }}>
              <span>0:00</span>
              <span>0:50</span>
              <span>1:00</span>
              <span>1:50</span>
              <span>2:00</span>
              <span>2:50</span>
              <span>3:00</span>
            </div>
          </div>

          {/* Timeline Content */}
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            {/* Video Frames Strip */}
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/30 min-w-min">
              <div className="flex gap-1">
                {frameIndices.map((idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-16 h-12 bg-slate-800 rounded border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer overflow-hidden"
                  >
                    <img
                      src={`/video-frame.png?height=48&width=64`}
                      alt={`Frame ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Playhead Line */}
            <div className="relative">
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-50 pointer-events-none"
                style={{ left: `${timeToPixels(playheadPosition) + 16}px` }}
              />

              {/* Edit Layers */}
              <div className="px-4 py-4 space-y-3">
                {editLayers.map((layer) => (
                  <div key={layer.id} className="relative h-12">
                    <div
                      className={`absolute top-0 h-full ${layer.color} rounded border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer flex items-center px-2 group`}
                      style={{
                        left: `${timeToPixels(layer.startTime)}px`,
                        width: `${timeToPixels(layer.duration)}px`,
                        minWidth: "60px",
                      }}
                    >
                      {layer.text && <span className="text-xs text-slate-300 truncate">{layer.text}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
