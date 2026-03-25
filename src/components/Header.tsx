import { useApp } from '../context/AppContext';
import { RotateCcw } from 'lucide-react';

export function Header() {
  const { dispatch } = useApp();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">cf</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              cf-ai
            </h1>
            <p className="text-xs text-gray-500">
              Turn your resume into a portfolio website
            </p>
          </div>
        </div>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </button>
      </div>
    </header>
  );
}
