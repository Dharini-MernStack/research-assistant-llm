const { HfInference } = require("@huggingface/inference");

const hf = new HfInference(process.env.HF_API_KEY);

const createEmbeddings = async (chunks) => {
    const embeddings = [];

    for (const chunk of chunks) {
        const result = await hf.featureExtraction({
            model: "sentence-transformers/all-MiniLM-L6-v2",
            inputs: chunk,
        });
        embeddings.push(Array.from(result));
    }

    console.log(`Created ${embeddings.length} embeddings`);
    return embeddings;
};

module.exports = { createEmbeddings };