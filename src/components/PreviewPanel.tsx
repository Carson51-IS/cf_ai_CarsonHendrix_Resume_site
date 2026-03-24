import { useApp } from '../context/AppContext';
import { Download, ExternalLink, Code2, Copy, CheckCheck } from 'lucide-react';
import { useState } from 'react';

export function PreviewPanel() {
  const { state } = useApp();
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([state.generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([state.generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleCopyHtml = async () => {
    await navigator.clipboard.writeText(state.generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900 text-sm">Live Preview</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleCopyHtml}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy HTML"
          >
            {copied ? (
              <CheckCheck className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleOpenNewTab}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download HTML"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 bg-gray-50 p-2 min-h-0">
        {state.generatedHtml ? (
          <iframe
            srcDoc={state.generatedHtml}
            className="w-full h-full bg-white rounded-lg border border-gray-200"
            sandbox="allow-scripts allow-same-origin"
            title="Website Preview"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Your website preview will appear here
          </div>
        )}
      </div>
    </div>
  );
}
