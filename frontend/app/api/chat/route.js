import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
    const { messages, context } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            try {
                const response = await ai.models.generateContentStream({
                    model: "gemini-2.0-flash",
                    contents: lastMessage,
                    config: {
                        systemInstruction: `You are a research assistant. Answer ONLY using the provided document context.
                        If the answer is not in the document, say "Not found in document."
                        Document Context: ${context}`,
                    },
                });

                for await (const chunk of response) {
                    const text = chunk.text;
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }
            } catch (err) {
                console.error("Streaming error:", err);
                controller.enqueue(encoder.encode("Sorry, something went wrong."));
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "Transfer-Encoding": "chunked",
        },
    });
}