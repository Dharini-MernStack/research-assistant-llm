"use client";
import { useState } from "react";
import axios from "axios";
import ChatSection from "./ChatSection";

export default function UploadSection() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("question", "Summarize this document in 3 sentences.");

    try {
const res = await axios.post(`https://research-assistant-backend-trsr.onrender.com/upload`, formData);      setSummary(res.data.answer);
    } catch (err) {
      setError("Upload failed. Make sure the backend is running.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Upload Card */}
      {!uploadedFile && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload PDF</h2>

          {/* Drop Zone */}
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
            <span className="text-4xl mb-2">📄</span>
            <span className="text-gray-500 text-sm">
              {file ? file.name : "Click to select a PDF"}
            </span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-4 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {uploading ? "Uploading & Processing..." : "Upload & Analyze"}
          </button>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>
      )}

      {/* Summary + Chat */}
      {uploadedFile && (
        <div>
          {/* Document Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">📄 {file.name}</h2>
              <button
                onClick={() => { setUploadedFile(null); setFile(null); setSummary(""); }}
                className="text-sm text-gray-400 hover:text-red-500 transition"
              >
                ✕ Remove
              </button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{summary}</p>
          </div>

          {/* Chat */}
          <ChatSection filename={uploadedFile} />
        </div>
      )}
    </div>
  );
}