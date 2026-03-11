const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Tool declaration — Gemini will decide when to call this
const retrieveContextTool = {
    name: "retrieve_document_context",
    description: "Retrieves the most relevant sections from the uploaded document based on a search query. Always call this tool before answering any question about the document.",
    parametersJsonSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "The search query to find relevant document sections",
            },
        },
        required: ["query"],
    },
};

async function askWithGemini(question) {
    const { retrieveRelevantChunks } = require("./retriever.js");

    // Step 1: Ask Gemini — it will call the tool
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: question,
        config: {
            systemInstruction: `You are a research assistant with access to a document retrieval tool. 
            Always use retrieve_document_context to search the document before answering.
            Only say "Not found in document" if the tool returns no relevant content.`,
            tools: [{ functionDeclarations: [retrieveContextTool] }],
        },
    });

    // Step 2: Handle tool call
    const functionCall = response.functionCalls?.[0];

    if (functionCall?.name === "retrieve_document_context") {
        console.log("🔧 Tool called — query:", functionCall.args.query);

        // Step 3: Execute retriever
        const results = await retrieveRelevantChunks(functionCall.args.query, 5);
        const context = results.map((r) => r.chunk).join("\n\n");
        console.log(`📄 Retrieved ${results.length} chunks`);

        // Step 4: Send tool result back to Gemini
        const finalResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                { role: "user", parts: [{ text: question }] },
                { role: "model", parts: [{ functionCall: { name: functionCall.name, args: functionCall.args } }] },
                { role: "user", parts: [{ functionResponse: { name: functionCall.name, response: { context } } }] },
            ],
            config: {
                systemInstruction: `You are a research assistant. Answer based on the retrieved document context only.
                Only say "Not found in document" if there is truly no relevant information.`,
            },
        });

        return finalResponse.text;
    }

    return response.text;
}

async function askWithGroq(contextText, question) {
    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
                role: "system",
                content: `You are a research assistant. Answer using the provided document context.
                Only say 'Not found in document' if there is no relevant information.`,
            },
            {
                role: "user",
                content: `Document Context:\n${contextText}\n\nQuestion:\n${question}`,
            },
        ],
        temperature: 0.3,
    });
    return response.choices[0].message.content;
}

async function askLLM(contextText, question) {
    try {
        console.log("🤖 Trying Gemini with tool calling...");
        const answer = await askWithGemini(question);
        console.log("✅ Gemini responded");
        return answer;
    } catch (err) {
        console.warn("⚠️ Gemini failed, falling back to Groq:", err.message);
        return await askWithGroq(contextText, question);
    }
}

module.exports = { askLLM };