# 🔍 Research Assistant LLM

A full-stack AI-powered research assistant that lets you upload any PDF document and ask questions about it in natural language. Built on a **Retrieval-Augmented Generation (RAG)** architecture — it doesn't just summarize, it finds the most relevant sections of your document and generates precise, context-aware answers with citations.

---

## 🚀 Live Demo

🔗 **Frontend:** [https://research-assistant-frontend.onrender.com](https://research-assistant-frontend.onrender.com)  
🔗 **Backend:** [https://research-assistant-backend-trsr.onrender.com](https://research-assistant-backend-trsr.onrender.com)

> ⚡ First upload may take up to 60 seconds to wake the server (free tier cold start)

---

## 📸 Screenshots

### Upload PDF

### Chat Interface

### Answer with Citations


---

## 🧠 How It Works

```
PDF Upload → Text Extraction → Chunking → Embeddings → Vector Store
                                                              ↓
                                          Question → Embed → Similarity Search
                                                              ↓
                                                    Top Chunks → LLM → Answer + Citations
```

1. **Upload a PDF** — parsed using `pdf2json`
2. **Text is chunked** — split into overlapping 2000-character chunks
3. **Embeddings created** — using HuggingFace `sentence-transformers/all-MiniLM-L6-v2` (free)
4. **Stored in vector store** — in-memory cosine similarity search
5. **Ask a question** — question is embedded and compared against chunks
6. **Top chunks retrieved** — most relevant sections fetched
7. **LLM generates answer** — using Google Gemini via Vercel AI SDK (streaming)
8. **Citations returned** — shows exactly which chunks were used

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + Express |
| PDF Parsing | pdf2json |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` |
| Vector Store | In-memory cosine similarity |
| LLM | Google Gemini `gemini-1.5-flash` |
| AI SDK | Vercel AI SDK (`useChat` hook) |
| Streaming | Vercel AI SDK `streamText` |
| Frontend | Next.js + Tailwind CSS |
| File Handling | Multer |
| Deployment | Render (frontend + backend) |

> 💡 **Fully free** — no OpenAI credits needed. Uses Gemini + HuggingFace free tiers.

---

## 📁 Project Structure

```
research-assistant-llm/
├── backend/
│   ├── routes/
│   │   └── upload.js            # Upload + Ask endpoints
│   ├── services/
│   │   ├── llm.js               # Google Gemini integration
│   │   ├── embeddingService.js  # HuggingFace embeddings
│   │   ├── vectorStore.js       # In-memory vector store with cosine similarity
│   │   └── retriever.js         # Similarity search retriever
│   ├── utils/
│   │   └── chunking.js          # Text chunking with overlap
│   ├── uploads/                 # Uploaded PDFs stored here
│   └── server.js
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.js     # Next.js API route for streaming chat
│   │   ├── components/
│   │   │   ├── UploadSection.jsx # PDF upload UI
│   │   │   └── ChatSection.jsx  # Chat interface with useChat hook
│   │   ├── layout.js
│   │   └── page.js
│   └── lib/
│       └── api.js               # SDK layer for all backend API calls
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- Free [Google Gemini API key](https://aistudio.google.com)
- Free [HuggingFace API token](https://huggingface.co/settings/tokens)

### 1. Clone the repo
```bash
git clone https://github.com/Dharini-MernStack/research-assistant-llm.git
cd research-assistant-llm
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
HF_API_KEY=your_huggingface_token_here
```

Start backend:
```bash
node server.js
```
Backend runs on `http://localhost:5000`

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```
Frontend runs on `http://localhost:3000`

---

## 📡 API Usage

### Upload a PDF
```
POST http://localhost:5000/upload
Content-Type: multipart/form-data

Body (form-data):
  pdf      → your PDF file
  question → "Summarize this document" (optional)
```

**Response:**
```json
{
    "message": "Research complete",
    "filename": "1234567890-yourfile.pdf",
    "chunks": 8,
    "answer": "..."
}
```

### Ask a Question (RAG)
```
POST http://localhost:5000/upload/ask
Content-Type: application/json

{
    "filename": "1234567890-yourfile.pdf",
    "question": "What are the required skills?"
}
```

**Response:**
```json
{
    "question": "What are the required skills?",
    "answer": "The required skills are...",
    "citations": [
        {
            "chunkIndex": 3,
            "score": 0.87,
            "preview": "First 150 chars of the matching chunk..."
        }
    ]
}
```

### Streaming Chat (Vercel AI SDK)
```
POST /api/chat
Content-Type: application/json

{
    "messages": [...],
    "context": "relevant chunks from RAG"
}
```
Returns a **streaming response** powered by Vercel AI SDK + Google Gemini.

---

## ✅ Day 1 — RAG Foundation
- [x] PDF upload and storage
- [x] Text extraction with pdf2json
- [x] Text chunking with overlap (2000 chars, 200 overlap)
- [x] Embeddings with HuggingFace (free)
- [x] In-memory vector store with cosine similarity

## ✅ Day 2 — Retrieval & Q&A
- [x] Retriever with cosine similarity search
- [x] `/ask` endpoint with full RAG pipeline
- [x] Answer generation from relevant context only
- [x] Citation extraction showing source chunks with scores

## ✅ Day 3 — Frontend
- [x] Next.js frontend with Tailwind CSS
- [x] PDF upload UI with drag and drop
- [x] Auto summary after upload
- [x] Chat interface with message history
- [x] Citation display per message

## ✅ Day 4 — SDK & Streaming
- [x] Replaced Groq with Google Gemini SDK
- [x] Integrated Vercel AI SDK `useChat` hook
- [x] Real-time streaming responses
- [x] Next.js API route for chat (`/api/chat`)
- [x] SDK layer (`lib/api.js`) for all backend calls
- [x] Deployed on Render (frontend + backend)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

[MIT](LICENSE)

---

## 👨‍💻 Author

Built with ❤️ by [Dharini](https://github.com/Dharini-MernStack/research-assistant-llm-project)


> ⭐ If this project helped you, please give it a star!
