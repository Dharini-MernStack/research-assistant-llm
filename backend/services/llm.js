const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function askWithGemini(contextText, question) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: `You are a research assistant. Answer the question using the 
        provided document context. Be helpful and extract relevant information. 
        Only say 'Not found in document' if there is absolutely no related information.`,
    });

    const prompt = `Document Context:\n${contextText}\n\nQuestion:\n${question}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
}

async function askWithGroq(contextText, question) {
    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
                role: "system",
                content: `You are a research assistant. Answer the question using the provided document context. 
                Be helpful and extract relevant information even if it's not explicitly stated. 
                Only say 'Not found in document' if there is absolutely no related information.`,
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
        console.log("Trying Gemini...");
        const answer = await askWithGemini(contextText, question);
        console.log("Gemini responded successfully");
        return answer;
    } catch (err) {
        console.warn("Gemini failed, falling back to Groq:", err.message);
        const answer = await askWithGroq(contextText, question);
        console.log("Groq fallback responded successfully");
        return answer;
    }
}

module.exports = { askLLM };
