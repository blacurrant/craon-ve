"use client"

import { Share2, Settings, Menu, X, Upload, ArrowUp, MoreHorizontal, Sun, ShieldQuestion, FileQuestion, CircleHelp, Zap, User } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const appName = "Craon"
  const videoTitle = "User Name's Video"
  const date = "Aug 22, 2025"

  return (
    <nav className="h-16 bg-[#212130] border-b border-slate-800 flex items-center justify-between px-6 gap-4">
      {/* Left Section - App Name */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl tracking-widest font-semibold text-white">{appName}</h1>
      </div>

      {/* Center Section - Title */}
      <div className="w-fit flex-1 flex items-center justify-start ">
        <div className="text-center bg-black/30 px-4 py-2 rounded-lg">
          <p className="text-sm text-slate-300">
            {videoTitle} • <span className="text-slate-500">{date}</span>
          </p>
        </div>
        <div className="ml-4 flex items-center gap-3">
          <MoreHorizontal size={18} className="text-white" />
          <div className="w-px h-6 bg-slate-700/30" />
          <Sun size={18} className="text-white" />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-3">

        {/* Divider */}

        {/* Share Button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 bg-black/30"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm">Share</span>
        </Button>

        <button
          className="p-2 bg-black/30 text-white hover:text-slate-200 hover:bg-slate-800/50 rounded-full transition-colors duration-200"
          title="Close"
        >
          <User className="w-5 h-5" />
        </button>

        {/* Upgrade Button */}
        <Button
          variant="outline"
          size="sm"
          className="text-slate-300 border-white hover:bg-slate-800 hover:text-slate-100 bg-transparent"
        >
          <Zap size={14} />
          Upgrade
        </Button>

        {/* Export Button - Primary CTA */}
        <Button size="sm" className="bg-white hover:bg-cyan-600 text-slate-950 font-medium flex item-center gap-2">
          <ArrowUp className="w-4 h-4" />
          Export
        </Button>

        {/* Settings Icon */}
        <button className="p-2 text-white hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors duration-200">
          <CircleHelp size={22} />
        </button>
      </div>
    </nav>
  )
}
