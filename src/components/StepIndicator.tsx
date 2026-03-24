import { useApp } from '../context/AppContext';
import { FileText, LayoutTemplate, MessageSquare, Check } from 'lucide-react';
import type { AppStep } from '../types';

const steps: { key: AppStep; label: string; icon: typeof FileText }[] = [
  { key: 'upload', label: 'Upload Resume', icon: FileText },
  { key: 'template', label: 'Choose Template', icon: LayoutTemplate },
  { key: 'customize', label: 'Customize', icon: MessageSquare },
];

const stepOrder: AppStep[] = ['upload', 'template', 'customize'];

export function StepIndicator() {
  const { state, dispatch } = useApp();
  const currentIdx = stepOrder.indexOf(state.step);

  const handleStepClick = (step: AppStep) => {
    const targetIdx = stepOrder.indexOf(step);
    if (targetIdx < currentIdx) {
      dispatch({ type: 'SET_STEP', payload: step });
    }
  };

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {steps.map((step, idx) => {
          const isActive = state.step === step.key;
          const isCompleted = idx < currentIdx;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => handleStepClick(step.key)}
                disabled={idx > currentIdx}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : isCompleted
                    ? 'text-brand-600 hover:bg-brand-50 cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : isCompleted
                      ? 'bg-brand-100 text-brand-600'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-24 h-px mx-2 ${
                    idx < currentIdx ? 'bg-brand-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
