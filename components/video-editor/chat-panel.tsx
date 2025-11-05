"use client"

import { useState } from "react"
import { Send } from "lucide-react"

interface Message {
  id: string
  text: string
  type: "user" | "ai"
}

interface ChatPanelProps {
  messages: Message[]
  onSendMessage: (message: string) => void
}

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input)
      setInput("")
      setIsProcessing(true)
      setTimeout(() => setIsProcessing(false), 1000)
    }
  }

  const suggestedPrompts = [
    "Make the video short and crisp.",
    "Another famous prompt - one",
    "Another famous prompt - two",
  ]

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-1">Hey User Name,</h1>
        <p className="text-sm text-slate-400">What do you want me to edit today?</p>
      </div>

      {/* Suggested Prompts */}
      <div className="mb-6 space-y-2">
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(prompt)}
            className="w-full px-4 py-2 text-left text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                msg.type === "user" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-100"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-lg text-sm bg-slate-800 text-slate-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Message */}
      {messages.length > 0 && (
        <div className="mb-4 px-3 py-2 text-xs text-slate-400 bg-slate-900 rounded-lg flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          Message processed successfully
        </div>
      )}

      {/* Input Area */}
      <div className="space-y-2">
        <p className="text-xs text-slate-400">Describe how you want to edit</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your prompt..."
            className="flex-1 px-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700"
          />
          <button
            onClick={handleSend}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            <Send className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
