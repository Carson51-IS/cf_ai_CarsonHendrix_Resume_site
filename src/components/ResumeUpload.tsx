import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Upload, FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export function ResumeUpload() {
  const { state, dispatch } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFile = async (file: File) => {
    const text = await file.text();
    dispatch({ type: 'SET_RESUME_TEXT', payload: text });
    setFileName(file.name);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) await readFile(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await readFile(file);
  };

  const handleParse = async () => {
    if (!state.resumeText.trim()) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: state.resumeText,
          sessionId: state.sessionId,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      if (data.resumeData) {
        dispatch({ type: 'SET_RESUME_DATA', payload: data.resumeData });
        dispatch({ type: 'SET_STEP', payload: 'template' });
      } else {
        throw new Error(data.error || 'Failed to parse resume');
      }
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to parse resume. Please try again.',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Upload Your Resume
        </h2>
        <p className="text-gray-500 mt-2">
          Paste or upload your resume and our AI will transform it into a stunning portfolio website.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-brand-500 bg-brand-50 scale-[1.01]'
            : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload
          className={`w-10 h-10 mx-auto mb-3 transition-colors ${
            dragActive ? 'text-brand-500' : 'text-gray-400'
          }`}
        />
        {fileName ? (
          <>
            <p className="text-sm font-medium text-brand-600">{fileName}</p>
            <p className="text-xs text-gray-500 mt-1">
              Click or drop to replace
            </p>
          </>
        ) : (
          <>
            <p className="text-base font-medium text-gray-700">
              Drop your resume here or click to upload
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports .txt and .md files
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="px-4 text-sm text-gray-400">or paste your resume</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Text area */}
      <textarea
        value={state.resumeText}
        onChange={(e) =>
          dispatch({ type: 'SET_RESUME_TEXT', payload: e.target.value })
        }
        placeholder={`Paste your resume content here...\n\nExample:\nJohn Doe\nSoftware Engineer\njohn@example.com\n\nExperience:\n- Senior Developer at Acme Corp (2020-2024)\n  Built scalable web applications...\n\nSkills: React, TypeScript, Node.js, Python`}
        className="w-full h-64 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent font-mono text-sm leading-relaxed"
      />

      {/* Error message */}
      {state.error && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {state.error}
        </div>
      )}

      {/* Parse button */}
      <button
        onClick={handleParse}
        disabled={!state.resumeText.trim() || state.isLoading}
        className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
      >
        {state.isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Parsing Resume with AI...
          </>
        ) : (
          <>
            <FileText className="w-5 h-5" />
            Parse Resume & Continue
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}
