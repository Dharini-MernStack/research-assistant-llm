import UploadSection from "./components/UploadSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">🔍 Research Assistant</h1>
          <p className="text-gray-500 mt-2">Upload a PDF and ask questions about it using AI</p>
          <p className="text-xs text-gray-400 mt-1">
            Powered by Google Gemini · HuggingFace Embeddings · RAG Architecture
          </p>
        </div>

        <UploadSection />

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-10">
          ⚡ First upload may take 60 seconds to wake the server
        </p>
      </div>
    </main>
  );
}