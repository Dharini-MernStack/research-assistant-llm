# 🔬 RAG Research Assistant

An AI-powered research assistant that lets you upload any PDF and have a real conversation with it. Built with a full RAG (Retrieval-Augmented Generation) pipeline, Gemini tool calling, and real-time streaming — all on a free tier stack.

**Live Demo:**
- 🌐 Frontend: https://research-assistant-frontend-i7da.onrender.com
- ⚙️ Backend: https://research-assistant-backend-trsr.onrender.com

---


---

## ✨ Features

### 🧠 RAG Pipeline (Retrieval-Augmented Generation)
- Upload any PDF and the backend automatically parses, chunks, and embeds it
- Uses HuggingFace `all-MiniLM-L6-v2` for semantic embeddings
- In-memory vector store with cosine similarity search
- Only the most relevant document chunks are sent to the LLM — no hallucination from unrelated context

### 🔧 Gemini Tool Calling
- Gemini doesn't just answer questions — it **decides** when to call the `retrieve_document_context` tool
- The LLM autonomously triggers document retrieval based on the user's question
- Tool results are fed back to Gemini for a grounded, accurate final answer
- Logged in backend: `🔧 Tool called`, `📄 Retrieved N chunks`, `✅ Gemini responded`

### ⚡ Real-Time Streaming with `@google/genai`
- Uses the official Google GenAI JS SDK (`@google/genai`) for streaming responses
- Answers stream in word-by-word, just like the Gemini interface
- Bouncing dots animation while the model is thinking
- Progressive text rendering using `ReadableStream` and `getReader()`

### 🔄 Automatic Fallback to Groq
- If Gemini hits its free-tier rate limit, the backend automatically falls back to **Groq (LLaMA 3.1)**
- Zero downtime — users never see an error
- Logged transparently: `⚠️ Gemini failed, falling back to Groq`

### 📄 PDF Parsing & Smart Chunking
- Parses PDFs using `pdf2json` with `decodeURIComponent` for clean text
- Regex fix for spaced characters (e.g., `P y t h o n → Python`)
- Overlapping chunks (2000 chars with 200 char overlap) for better context continuity

### 📌 Citation Support
- Every answer includes source citations with chunk index, similarity score, and a 150-char preview
- Frontend displays citations alongside the answer so users can verify sources

### 💬 Vercel AI SDK Integration
- Frontend uses `@ai-sdk/react` and `streamText` for the chat interface
- `/api/chat` is a Next.js route handler that streams directly from Gemini
- Context from RAG retrieval is injected into every streamed response

---

## 🏗️ Architecture

```
User uploads PDF
      ↓
pdf2json parses → chunks (2000 chars, 200 overlap)
      ↓
HuggingFace all-MiniLM-L6-v2 creates embeddings
      ↓
In-memory vector store (cosine similarity)
      ↓
User asks question
      ↓
Gemini calls retrieve_document_context tool (Tool Calling)
      ↓
Retriever embeds query → similarity search → top 5 chunks
      ↓
Tool result returned to Gemini
      ↓
Gemini streams final answer → Frontend renders progressively
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + Express (CommonJS) |
| PDF Parsing | pdf2json |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` |
| Vector Store | In-memory cosine similarity |
| LLM (Primary) | Google Gemini `gemini-2.0-flash` via `@google/genai` |
| LLM (Fallback) | Groq `llama-3.1-8b-instant` |
| AI SDK | Vercel AI SDK (`@ai-sdk/react`, `streamText`) |
| Frontend | Next.js 14 + Tailwind CSS |
| File Handling | Multer |
| Deployment | Render (free tier) |

---

## 📁 Project Structure

```
research-assistant-llm/
├── backend/
│   ├── routes/
│   │   └── upload.js          ← PDF upload + /ask endpoint
│   ├── services/
│   │   ├── llm.js             ← Gemini tool calling + Groq fallback
│   │   ├── embeddingService.js← HuggingFace embeddings
│   │   ├── vectorStore.js     ← In-memory cosine similarity
│   │   └── retriever.js       ← Query embedding + similarity search
│   ├── utils/
│   │   └── chunking.js        ← Overlapping text chunking
│   ├── uploads/               ← Uploaded PDFs (gitignored)
│   └── server.js              ← Express app entry point
├── frontend/
│   ├── app/
│   │   ├── api/chat/
│   │   │   └── route.js       ← @google/genai streaming route
│   │   ├── components/
│   │   │   ├── UploadSection.jsx ← PDF upload UI
│   │   │   └── ChatSection.jsx   ← Streaming chat UI
│   │   └── page.js
│   └── lib/
│       └── api.js             ← Axios client for backend
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Free API keys: [Gemini](https://aistudio.google.com) · [HuggingFace](https://huggingface.co/settings/tokens) · [Groq](https://console.groq.com)

### Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
HF_API_KEY=your_huggingface_token
GROQ_API_KEY=your_groq_api_key
```

```bash
node server.js
# → Server running on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
npm run dev
# → http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload PDF, returns summary + filename |
| `POST` | `/upload/ask` | RAG Q&A with citations |
| `GET` | `/` | Health check |
| `POST` | `/api/chat` | Gemini streaming (Next.js route) |

### Example: Upload PDF
```bash
curl -X POST https://research-assistant-backend-trsr.onrender.com/upload \
  -F "pdf=@document.pdf" \
  -F "question=Summarize this document"
```

### Example: Ask a Question
```bash
curl -X POST https://research-assistant-backend-trsr.onrender.com/upload/ask \
  -H "Content-Type: application/json" \
  -d '{"filename": "1234-doc.pdf", "question": "What are the key findings?"}'
```

---

## 🌐 Deployment (Render)

### Backend Service
| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Env Vars | `GEMINI_API_KEY`, `HF_API_KEY`, `GROQ_API_KEY` |

### Frontend Service
| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Env Vars | `GEMINI_API_KEY`, `NEXT_PUBLIC_API_URL` |

> ⚠️ Free tier services sleep after 15 min inactivity. First request takes 30–60s to wake.

---

## 🔑 Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `GEMINI_API_KEY` | Backend + Frontend | Gemini LLM & streaming |
| `HF_API_KEY` | Backend | HuggingFace embeddings |
| `GROQ_API_KEY` | Backend | Fallback LLM |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend base URL |

---

## 🧩 How Tool Calling Works

When a user asks a question, here's what happens under the hood:

1. **User message** → sent to Gemini with a tool definition for `retrieve_document_context`
2. **Gemini decides** to call the tool with a search query (e.g., `"SAP Finance certification"`)
3. **Retriever executes** — embeds the query, runs cosine similarity against stored vectors
4. **Top 5 chunks** returned as tool result to Gemini
5. **Gemini generates** a grounded answer using only the retrieved context
6. **Response streams** back to the frontend word by word

```
Backend logs:
🤖 Trying Gemini with tool calling...
🔧 Tool called — query: "key findings section 3"
📄 Retrieved 5 chunks
✅ Gemini responded
```

---

## 📝 License

MIT — free to use, modify, and deploy.

---

Built with ❤️ using Node.js, Next.js, Google Gemini, HuggingFace, and Vercel AI SDK.