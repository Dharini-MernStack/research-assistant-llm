"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ChatSection({ filename }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I've read the document. Ask me anything about it." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
const res = await axios.post(`https://research-assistant-backend-trsr.onrender.com/upload/ask`, {        filename,
        question: input,
      });

      const assistantMessage = {
        role: "assistant",
        text: res.data.answer,
        citations: res.data.citations,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "Something went wrong. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
        <p className="text-xs text-gray-400">Ask anything about the document</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"} rounded-2xl px-4 py-3 text-sm leading-relaxed`}>
              <p>{msg.text}</p>

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  <p className="text-xs text-gray-400 font-medium">Sources:</p>
                  {msg.citations.map((c, j) => (
                    <div key={j} className="text-xs text-gray-500 bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <span className="font-medium text-blue-500">Chunk {c.chunkIndex + 1}</span>
                      <span className="ml-2 text-gray-400">score: {c.score}</span>
                      <p className="mt-1 text-gray-400 truncate">{c.preview}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-400">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-400 transition"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}