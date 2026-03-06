const chunkText = (text, chunkSize = 2000, overlap = 200) => {
    const chunks = [];
    let i = 0;
    while (i < text.length) {
        chunks.push(text.slice(i, i + chunkSize));
        i += chunkSize - overlap; // overlap keeps context between chunks
    }
    return chunks;
};

module.exports = { chunkText };

module.exports = { chunkText };