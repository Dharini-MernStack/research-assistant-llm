let storedChunks = [];
let storedVectors = [];

const cosineSimilarity = (a, b) => {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
};

const storeVectors = (chunks, vectors) => {
    storedChunks = chunks;
    storedVectors = vectors;
    console.log(`Stored ${vectors.length} vectors in memory`);
};

const similaritySearch = (queryVector, topK = 3) => {
    const scores = storedVectors.map((vec, i) => ({
        chunk: storedChunks[i],
        chunkIndex: i,
        score: parseFloat(cosineSimilarity(queryVector, vec).toFixed(4)),
    }));

    return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
};

module.exports = { storeVectors, similaritySearch };