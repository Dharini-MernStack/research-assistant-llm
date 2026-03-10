const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function askLLM(contextText, question) {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `You are a research assistant. Answer the question using the 
        provided document context. Be helpful and extract relevant information. 
        Only say 'Not found in document' if there is absolutely no related information.`,
    });

    const prompt = `Document Context:\n${contextText}\n\nQuestion:\n${question}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

module.exports = { askLLM };
