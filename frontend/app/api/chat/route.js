import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
    const { messages, context } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    const systemPrompt = `You are a research assistant. Answer ONLY using the provided document context.
    If the answer is not in the document, say "Not found in document."
    Document Context: ${context}`;

    // Try Gemini streaming first
    try {
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    const response = await ai.models.generateContentStream({
                        model: "gemini-2.0-flash",
                        contents: lastMessage,
                        config: { systemInstruction: systemPrompt },
                    });

                    for await (const chunk of response) {
                        const text = chunk.text;
                        if (text) controller.enqueue(encoder.encode(text));
                    }
                } catch (err) {
                    // Gemini failed inside stream — fall through to Groq
                    throw err;
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });

    } catch (geminiErr) {
        console.warn("⚠️ Gemini streaming failed, falling back to Groq:", geminiErr.message);

        // Groq fallback — non-streaming but returns same format
        try {
            const response = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: lastMessage },
                ],
                temperature: 0.3,
            });

            const text = response.choices[0].message.content;
            return new Response(text, {
                headers: { "Content-Type": "text/plain; charset=utf-8" },
            });

        } catch (groqErr) {
            console.error("❌ Both Gemini and Groq failed:", groqErr.message);
            return new Response("Sorry, both AI providers are unavailable. Please try again later.", {
                headers: { "Content-Type": "text/plain; charset=utf-8" },
            });
        }
    }
}