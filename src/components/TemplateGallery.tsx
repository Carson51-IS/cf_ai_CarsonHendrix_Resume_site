import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { templates } from '../templates';
import { Check, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { readJsonOrThrow } from '../utils/apiFetch';
import { getExternalGenerateWorkerUrl } from '../config/externalWorker';
import type { AppState } from '../types';

async function generateViaPagesApi(
  state: AppState,
  stylePrompt: string | undefined,
): Promise<string> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeData: state.resumeData,
      templateId: state.selectedTemplate,
      stylePrompt,
      sessionId: state.sessionId,
    }),
  });
  const data = await readJsonOrThrow<{ html?: string; error?: string }>(res);
  if (!data.html) throw new Error(data.error || 'Failed to generate website');
  return data.html;
}

/** Matches standalone Worker: POST JSON { input } → { html }. */
async function generateViaExternalWorker(
  workerUrl: string,
  input: string,
): Promise<string> {
  const res = await fetch(workerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });
  const data = (await res.json()) as { html?: string; error?: string };
  if (!res.ok) {
    throw new Error(
      typeof data.error === 'string' ? data.error : `Worker HTTP ${res.status}`,
    );
  }
  if (!data.html || typeof data.html !== 'string') {
    throw new Error(data.error || 'Worker returned no html');
  }
  return data.html;
}

export function TemplateGallery() {
  const { state, dispatch } = useApp();
  const [generating, setGenerating] = useState(false);
  const busyRef = useRef(false);

  const handleGenerate = async () => {
    if (!state.selectedTemplate || busyRef.current) return;
    busyRef.current = true;
    setGenerating(true);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const template = templates.find((t) => t.id === state.selectedTemplate);
    const workerUrl = getExternalGenerateWorkerUrl();

    const inputPayload = [
      state.resumeText.trim() ||
        JSON.stringify(state.resumeData ?? {}, null, 2),
      '',
      'Selected template style (follow closely):',
      template?.stylePrompt ?? '',
    ].join('\n');

    try {
      let html: string;
      try {
        html = await generateViaPagesApi(state, template?.stylePrompt);
      } catch (pagesErr) {
        if (workerUrl) {
          console.warn(
            'Pages /api/generate failed, falling back to external Worker:',
            pagesErr,
          );
          html = await generateViaExternalWorker(workerUrl, inputPayload);
        } else {
          throw pagesErr;
        }
      }

      dispatch({ type: 'SET_GENERATED_HTML', payload: html });
      dispatch({ type: 'SET_STEP', payload: 'customize' });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          err instanceof Error
            ? err.message
            : 'Failed to generate website. Please try again.',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      setGenerating(false);
      busyRef.current = false;
    }
  };

  if (generating) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-24 animate-fadeIn">
        <Loader2 className="w-14 h-14 text-brand-500 animate-spin mb-5" />
        <p className="text-xl font-semibold text-gray-800">
          Generating your portfolio website...
        </p>
        <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
          The AI is building a fully styled, responsive website from your resume.
          This can take 30–60 seconds.
        </p>
        <div className="mt-6 w-72 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full animate-[loading_2s_ease-in-out_infinite] w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Choose a Style</h2>
        <p className="text-gray-500 mt-2">
          Select a template style and our AI will generate a custom portfolio
          website from your resume.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {templates.map((template) => {
          const isSelected = state.selectedTemplate === template.id;

          return (
            <button
              key={template.id}
              onClick={() =>
                dispatch({ type: 'SET_TEMPLATE', payload: template.id })
              }
              className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all hover:scale-[1.02] ${
                isSelected
                  ? 'border-brand-500 ring-4 ring-brand-100 shadow-lg'
                  : 'border-gray-200 hover:border-brand-300 hover:shadow-md'
              }`}
            >
              {/* Preview area */}
              <div
                className="h-40 p-5 relative overflow-hidden"
                style={{ backgroundColor: template.previewColors.bg }}
              >
                <div className="space-y-2">
                  <div
                    className="h-2.5 w-20 rounded-full"
                    style={{
                      backgroundColor: template.previewColors.accent,
                    }}
                  />
                  <div
                    className="h-1.5 w-28 rounded-full opacity-50"
                    style={{
                      backgroundColor: template.previewColors.text,
                    }}
                  />
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className="rounded-md p-2"
                        style={{
                          backgroundColor: template.previewColors.secondary,
                        }}
                      >
                        <div
                          className="h-1.5 w-full rounded-full opacity-40 mb-1"
                          style={{
                            backgroundColor: template.previewColors.text,
                          }}
                        />
                        <div
                          className="h-1 w-3/4 rounded-full opacity-25"
                          style={{
                            backgroundColor: template.previewColors.text,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-1 rounded-full opacity-30"
                        style={{
                          backgroundColor: template.previewColors.text,
                          width: `${90 - i * 20}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute inset-0 bg-brand-500/10 flex items-center justify-center">
                    <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {template.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {template.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {state.error && (
        <div className="mt-6 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {state.error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!state.selectedTemplate}
        className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
      >
        Generate Website
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
