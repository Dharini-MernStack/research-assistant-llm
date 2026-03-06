const Groq = require("groq-sdk");

async function askLLM(contextText, question) {
  const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const response = await client.chat.completions.create({
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

module.exports = { askLLM };