const express = require("express");
const multer = require("multer");
const fs = require("fs");
const PDFParser = require("pdf2json");
const { askLLM } = require("../services/llm.js");
const { chunkText } = require("../utils/chunking.js");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

function extractTextFromPDF(filePath) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));
        pdfParser.on("pdfParser_dataReady", (pdfData) => {
            const text = pdfData.Pages.map(page =>
                page.Texts.map(t => decodeURIComponent(t.R.map(r => r.T).join(""))).join(" ")
            ).join("\n");
            resolve(text);
        });
        pdfParser.loadPDF(filePath);
    });
}

// Upload PDF and get initial summary
router.post("/", upload.single("pdf"), async (req, res) => {
    const filePath = req.file?.path;

    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("STEP 1: File received:", req.file.originalname);

        const text = await extractTextFromPDF(filePath);
        console.log("STEP 2: PDF parsed");

        const chunks = chunkText(text);
        console.log(`STEP 3: Chunked into ${chunks.length} chunks`);

        const question = req.body.question || "Summarize this document.";
        const limitedText = text.substring(0, 12000);

        const answer = await askLLM(limitedText, question);
        console.log("STEP 4: LLM responded");

        res.json({
            message: "Research complete",
            filename: req.file.filename,
            chunks: chunks.length,
            answer,
        });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Processing failed" });
    }
});

// Ask a question about an already uploaded PDF
router.post("/ask", async (req, res) => {
    const { filename, question } = req.body;

    if (!filename || !question) {
        return res.status(400).json({ error: "filename and question are required" });
    }

    const filePath = `uploads/${filename}`;

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    try {
        console.log("STEP 1: Loading file:", filename);

        const text = await extractTextFromPDF(filePath);
        console.log("STEP 2: PDF parsed");

        const chunks = chunkText(text);
        console.log(`STEP 3: Chunked into ${chunks.length} chunks`);

        const limitedText = text.substring(0, 12000);
        const answer = await askLLM(limitedText, question);
        console.log("STEP 4: LLM responded");

        res.json({ question, answer });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Processing failed" });
    }
});

module.exports = router;