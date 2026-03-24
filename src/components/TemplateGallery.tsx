import { useApp } from '../context/AppContext';
import { templates } from '../templates';
import { Check, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export function TemplateGallery() {
  const { state, dispatch } = useApp();

  const handleGenerate = async () => {
    if (!state.selectedTemplate) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const template = templates.find((t) => t.id === state.selectedTemplate);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData: state.resumeData,
          templateId: state.selectedTemplate,
          stylePrompt: template?.stylePrompt,
          sessionId: state.sessionId,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      if (data.html) {
        dispatch({ type: 'SET_GENERATED_HTML', payload: data.html });
        dispatch({ type: 'SET_STEP', payload: 'customize' });
      } else {
        throw new Error(data.error || 'Failed to generate website');
      }
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
    }
  };

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
                {/* Mini layout preview */}
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

                {/* Selected overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-brand-500/10 flex items-center justify-center">
                    <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
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
        disabled={!state.selectedTemplate || state.isLoading}
        className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
      >
        {state.isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Your Website...
          </>
        ) : (
          <>
            Generate Website
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}
