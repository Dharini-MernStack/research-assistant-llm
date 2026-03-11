import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://research-assistant-backend-trsr.onrender.com";


const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const researchAssistant = {
    uploadPDF: async (file, question = "Summarize this document in 3 sentences.") => {
        const formData = new FormData();
        formData.append("pdf", file);
        formData.append("question", question);
        const res = await client.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },

    askQuestion: async (filename, question) => {
        const res = await client.post("/upload/ask", { filename, question });
        return res.data;
    },

    ping: async () => {
        const res = await client.get("/");
        return res.data;
    },
};



export default researchAssistant;