"use client";

import { Play, Volume2, Maximize, Upload, Pause } from "lucide-react";
import { useRef, useState } from "react";

export function VideoPreview({ videoUrl }: { videoUrl: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setVolume(videoRef.current.muted ? 0 : videoRef.current.volume);
    }
  };

  if (!videoUrl) {
    return (
      <div className="relative w-full h-[50vh] from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Upload className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Upload a video to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center group">
      <video
       key={videoUrl}
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => setVolume(e.currentTarget.volume)}
      />

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex flex-col justify-between p-4">
        <div className="flex justify-end gap-2">
          <button className="p-2 rounded bg-white/10 hover:bg-white/20 backdrop-blur transition-colors">
            <Maximize className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex justify-center">
          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer hover:h-1.5 transition-all"
            onClick={(e) => {
              if (videoRef.current && duration) {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                videoRef.current.currentTime = pos * duration;
              }
            }}
          >
            <div
              className="h-full bg-white rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <button
            onClick={toggleMute}
            className="p-2 rounded hover:bg-white/10 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
