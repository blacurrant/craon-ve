"use client"

import { Play, Volume2, Maximize } from "lucide-react"

export function VideoPreview() {
  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center group">
      {/* Video Placeholder with gradient background */}
      <div className="relative w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-orange-400 flex items-center justify-center overflow-hidden">
        {/* VR Headset Image Placeholder */}
        <div className="absolute inset-0 opacity-90">
          <img src="/person-wearing-vr-headset-in-colorful-neon-environ.jpg" alt="Video preview" className="w-full h-full object-cover" />
        </div>

        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex flex-col justify-between p-4">
          {/* Top Controls */}
          <div className="flex justify-end gap-2">
            <button className="p-2 rounded bg-white/10 hover:bg-white/20 backdrop-blur transition-colors">
              <Maximize className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Center Play Button */}
          <div className="flex justify-center">
            <button className="p-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur transition-colors group/play">
              <Play className="w-6 h-6 text-white fill-white" />
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer hover:h-1.5 transition-all">
              <div className="h-full w-1/3 bg-white rounded-full" />
            </div>
            <span className="text-xs text-white">0:30 / 4:38</span>
            <button className="p-2 rounded hover:bg-white/10 transition-colors">
              <Volume2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
