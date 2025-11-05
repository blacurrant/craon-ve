"use client"

import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"

export function ExportPanel() {
  return (
    <div className="flex gap-2 p-4 border-t border-slate-800">
      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
        <Download className="w-4 h-4" />
        Export
      </Button>
      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
        <Share2 className="w-4 h-4" />
        Share
      </Button>
    </div>
  )
}
