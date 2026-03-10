import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
    const { messages, context } = await req.json();

    const result = streamText({
     model: google("gemini-2.0-flash"),
        system: `You are a research assistant. Answer ONLY using the provided document context.
        If the answer is not in the document, say 'Not found in document.'
        
        Document Context:
        ${context}`,
        messages,
    });

    return result.toDataStreamResponse();
}
