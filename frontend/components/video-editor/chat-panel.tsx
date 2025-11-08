"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Loader2 } from "lucide-react"

interface Message {
  id: string
  text: string
  type: "user" | "ai"
}

interface ChatPanelProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isProcessing?: boolean
  uploadProgress?: number
}

export function ChatPanel({ 
  messages, 
  onSendMessage, 
  isProcessing = false,
  uploadProgress = 0 
}: ChatPanelProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isProcessing])

  const handleSend = () => {
    if (input.trim() && !isProcessing) {
      onSendMessage(input)
      setInput("")
    }
  }

  const suggestedPrompts = [
    'Add subtitle "Hello World"',
    'Add subtitle "Welcome to my video"',
    "Download video",
  ]

  return (
    <div className="flex flex-col h-full p-6 bg-gradient-to-b from-slate-950 to-slate-800">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-1">Hey User,</h1>
        <p className="text-sm text-slate-400">What do you want me to edit today?</p>
      </div>

      {/* {messages.length === 0 && ( */}
        <div className="flex mb-8 gap-2">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => !isProcessing && onSendMessage(prompt)}
              disabled={isProcessing}
              className="w-full p-4 text-left text-xs text-slate-300 bg-transparent border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {prompt}
            </button>
          ))}
        </div>
      {/* )} */}

      <div className="flex-1 overflow-y-auto mb-4 space-y-3 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-line ${
                msg.type === "user" 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-800 text-slate-100"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-lg text-sm bg-slate-800 text-slate-100 flex items-center gap-2">
              {uploadProgress > 0 && uploadProgress < 100 ? (
                <>
                  <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">{uploadProgress}%</span>
                </>
              ) : (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  <span>Processing...</span>
                </>
              )}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {messages.length > 0 && !isProcessing && (
        <div className="mb-4 px-3 py-2 text-xs text-slate-400 bg-slate-900 rounded-lg flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          Ready for next command
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs text-slate-400">Describe how you want to edit</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your prompt..."
            disabled={isProcessing}
            className="flex-1 px-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  )
}