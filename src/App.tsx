import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { StepIndicator } from './components/StepIndicator';
import { ResumeUpload } from './components/ResumeUpload';
import { TemplateGallery } from './components/TemplateGallery';
import { ChatInterface } from './components/ChatInterface';
import { PreviewPanel } from './components/PreviewPanel';

function AppContent() {
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <StepIndicator />

      <main className="flex-1 px-4 sm:px-6 py-6">
        {state.step === 'upload' && <ResumeUpload />}
        {state.step === 'template' && <TemplateGallery />}
        {state.step === 'customize' && (
          <div className="h-[calc(100vh-10rem)] flex gap-4 max-w-7xl mx-auto animate-fadeIn">
            <div className="w-[380px] flex-shrink-0">
              <ChatInterface />
            </div>
            <div className="flex-1 min-w-0">
              <PreviewPanel />
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-100">
        Built with Cloudflare Workers AI &bull; Llama 3.3
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
