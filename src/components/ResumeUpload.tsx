import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Upload, FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { ACCEPT_ATTR, extractTextFromFile } from '../utils/extractDocumentText';
import { readJsonOrThrow } from '../utils/apiFetch';
import type { ResumeData } from '../types';

export function ResumeUpload() {
  const { state, dispatch } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileReadError, setFileReadError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const busyRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFile = async (file: File) => {
    setFileReadError(null);
    setExtracting(true);
    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) {
        throw new Error(
          'No readable text was found in this file. Try another format or paste the text manually.',
        );
      }
      dispatch({ type: 'SET_RESUME_TEXT', payload: text });
      setFileName(file.name);
    } catch (err) {
      setFileReadError(
        err instanceof Error ? err.message : 'Could not read this file.',
      );
      setFileName(null);
    } finally {
      setExtracting(false);
    }
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
    if (!state.resumeText.trim() || busyRef.current) return;
    busyRef.current = true;
    setParsing(true);
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

      const data = await readJsonOrThrow<{
        resumeData?: ResumeData;
        error?: string;
      }>(res);

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
      setParsing(false);
      busyRef.current = false;
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

      {parsing ? (
        <div className="mt-8 flex flex-col items-center justify-center py-20 animate-fadeIn">
          <Loader2 className="w-14 h-14 text-brand-500 animate-spin mb-5" />
          <p className="text-xl font-semibold text-gray-800">
            Parsing your resume with AI...
          </p>
          <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
            Our AI is reading your resume and extracting your experience, skills,
            and projects. This usually takes 15–30 seconds.
          </p>
          <div className="mt-6 w-72 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full animate-[loading_2s_ease-in-out_infinite] w-2/3" />
          </div>
        </div>
      ) : (
        <>
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
                  PDF, Word (.docx), OpenDocument (.odt), RTF, HTML, Markdown, plain text
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_ATTR}
              onChange={handleFileChange}
              className="hidden"
            />
            {extracting && (
              <p className="text-sm text-brand-600 mt-3">Extracting text from file…</p>
            )}
          </div>

          {fileReadError && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {fileReadError}
            </div>
          )}

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

          {state.error && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {state.error}
            </div>
          )}

          <button
            onClick={handleParse}
            disabled={!state.resumeText.trim()}
            className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
          >
            <FileText className="w-5 h-5" />
            Parse Resume & Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
