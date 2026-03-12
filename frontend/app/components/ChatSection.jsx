"use client";
import { useState, useRef, useEffect } from "react";
import researchAssistant from "../../lib/api";

export default function ChatSection({ filename }) {
    const [messages, setMessages] = useState([
        { id: "welcome", role: "assistant", content: "Hi! I've read the document. Ask me anything about it." },
    ]);
    const [userInput, setUserInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;

    const question = userInput.trim();
    setUserInput("");
    setIsLoading(true);

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: question }]);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
        let context = "";
        try {
            const data = await researchAssistant.askQuestion(filename, question);
            context = data?.citations?.map((c) => c.preview).join("\n\n") || "";
        } catch (err) {
            if (err?.response?.status === 404 || err?.response?.status === 500) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantId
                            ? { ...msg, content: "⚠️ Session expired — the server restarted and lost your document. Please re-upload your PDF to continue." }
                            : msg
                    )
                );
                setIsLoading(false);
                return;
            }
            console.error("Error fetching context:", err);
        }

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [{ role: "user", content: question }],
                context,
            }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantId ? { ...msg, content: fullText } : msg
                )
            );
        }
    } catch (err) {
        console.error("Stream error:", err);
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === assistantId
                    ? { ...msg, content: "Something went wrong. Please try again." }
                    : msg
            )
        );
    } finally {
        setIsLoading(false);
    }
};
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
            <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
                <p className="text-xs text-gray-400">Ask anything about the document · Powered by Gemini</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"} rounded-2xl px-4 py-3 text-sm leading-relaxed`}>
                            {msg.content || (
                                <span className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </span>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-400 transition"
                />
                <button
                    onClick={handleSend}
                    disabled={!userInput.trim() || isLoading}
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    Send
                </button>
            </div>
        </div>
    );
}