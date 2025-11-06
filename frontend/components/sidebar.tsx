"use client"

import type React from "react"

import { Plus, Sparkles, Video, Bot, Settings } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { id: "new-project", label: "New Project", icon: Plus },
  { id: "ai-agent", label: "AI Agent", icon: Sparkles },
  { id: "video", label: "Video", icon: Video },
  { id: "robots", label: "Robots", icon: Bot },
  { id: "settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("video")

  return (
    <aside className="w-20 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-4">
      {/* Logo/Brand could go here */}
      <div className="w-full" />

      {/* Navigation Items */}
      <nav className="flex flex-col gap-4 items-center justify-start">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className="flex flex-col items-center gap-2 group cursor-pointer transition-colors duration-200"
              title={item.label}
            >
              {/* Icon background on hover/active */}
              <div
                className={cn(
                  "p-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-cyan-500/20 text-cyan-400"
                    : " text-slate-400 group-hover:text-slate-300 group-hover:bg-slate-800/50 bg-slate-800/20",
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-xs whitespace-nowrap transition-colors duration-200",
                  isActive ? "text-cyan-400 font-medium" : "text-slate-500 group-hover:text-slate-400",
                )}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />
    </aside>
  )
}
