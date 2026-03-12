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

    let useGroq = false;
    let geminiStream = null;

    try {
        geminiStream = await ai.models.generateContentStream({
            model: "gemini-2.0-flash",
            contents: lastMessage,
            config: { systemInstruction: systemPrompt },
        });
    } catch (err) {
        console.warn("⚠️ Gemini failed, falling back to Groq:", err.message);
        useGroq = true;
    }

    if (useGroq) {
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
            return new Response("Both AI providers are unavailable. Please try again later.", {
                headers: { "Content-Type": "text/plain; charset=utf-8" },
            });
        }
    }

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of geminiStream) {
                    const text = chunk.text;
                    if (text) controller.enqueue(encoder.encode(text));
                }
            } catch (err) {
                console.error("Stream error:", err.message);
                controller.enqueue(encoder.encode("Stream interrupted. Please try again."));
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
}