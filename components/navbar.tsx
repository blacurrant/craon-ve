"use client"

import { Share2, Settings, Menu, X, Upload, ArrowUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const appName = "Craon"
  const videoTitle = "User Name's Video"
  const date = "Aug 22, 2025"

  return (
    <nav className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 gap-4">
      {/* Left Section - App Name */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-white">{appName}</h1>
      </div>

      {/* Center Section - Title */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-slate-300">
            {videoTitle} • <span className="text-slate-500">{date}</span>
          </p>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-3">
        {/* Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
          title="Menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Close Button - actually a minimize/back */}
        <button
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-700" />

        {/* Share Button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-slate-300 hover:text-slate-100 hover:bg-slate-800/50"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm">Share</span>
        </Button>

        {/* Upload Icon */}
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors duration-200">
          <Upload className="w-4 h-4" />
        </button>

        {/* Grid/View Icon */}
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors duration-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Upgrade Button */}
        <Button
          variant="outline"
          size="sm"
          className="text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-slate-100 bg-transparent"
        >
          Upgrade
        </Button>

        {/* Export Button - Primary CTA */}
        <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-medium">
          <ArrowUp className="w-4 h-4 mr-1" />
          Export
        </Button>

        {/* Settings Icon */}
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors duration-200">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </nav>
  )
}
