import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { VideoEditor } from "@/components/video-editor"

export default function Page() {
  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Video Editor */}
        <div className="flex-1 overflow-hidden">
          <VideoEditor />
        </div>
      </div>
    </div>
  )
}
