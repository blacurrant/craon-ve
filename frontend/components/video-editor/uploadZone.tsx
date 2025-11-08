"use client"

import { useState, useRef } from "react"
import { Upload, Film, AlertCircle } from "lucide-react"

interface UploadZoneProps {
  onFileSelect: (file: File) => void
}

const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska']
const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm', '.mkv']
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 100MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return `Invalid file type. Please upload: ${ALLOWED_EXTENSIONS.join(', ')}`
    }

    return null
  }

  const handleFile = (file: File) => {
    setError(null)
    
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    onFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          w-full h-full flex flex-col items-center justify-center
          border-2 border-dashed rounded-lg cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-slate-700 hover:border-slate-600 bg-slate-900/50 hover:bg-slate-900/70'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4 px-6">
          <div className={`
            p-4 rounded-full transition-colors
            ${isDragging ? 'bg-blue-500/20' : 'bg-slate-800'}
          `}>
            {isDragging ? (
              <Upload className="w-10 h-10 text-blue-400" />
            ) : (
              <Film className="w-10 h-10 text-slate-400" />
            )}
          </div>

          <div className="text-center">
            <p className="text-base font-medium text-white mb-1">
              {isDragging ? 'Drop video here' : 'Upload Video'}
            </p>
            <p className="text-sm text-slate-400">
              Drag & drop or click to browse
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Supported formats: MP4, MOV, AVI, WebM, MKV
            </p>
            <p className="text-xs text-slate-500">
              Maximum size: 100MB
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg max-w-md">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}