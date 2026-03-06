const { HfInference } = require("@huggingface/inference");
const { similaritySearch } = require("./vectorStore.js");

const hf = new HfInference(process.env.HF_API_KEY);

const retrieveRelevantChunks = async (question, topK = 3) => {
    const queryVector = Array.from(await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: question,
    }));

    // Returns [{chunk, chunkIndex, score}]
    const results = similaritySearch(queryVector, topK);

    return results;
};

module.exports = { retrieveRelevantChunks };