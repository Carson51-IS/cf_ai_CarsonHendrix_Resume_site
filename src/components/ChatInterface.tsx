import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Loader2, Bot, User, ImagePlus } from 'lucide-react';
import { readJsonOrThrow } from '../utils/apiFetch';

const SUGGESTIONS = [
  'Make the design more creative and unique',
  'Change the color scheme to blue and teal',
  'Make the hero section more impactful',
  'Add hover animations to all cards',
  'Upload a profile photo',
  'Redesign the skills section to look more visual',
];

export function ChatInterface() {
  const { state, dispatch } = useApp();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatHistory]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || state.isLoading) return;

    setInput('');
    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: { role: 'user', content: message },
    });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          currentHtml: state.generatedHtml,
          chatHistory: state.chatHistory,
          sessionId: state.sessionId,
        }),
      });

      const data = await readJsonOrThrow<{
        explanation?: string;
        html?: string;
        error?: string;
      }>(res);

      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: {
          role: 'assistant',
          content: data.explanation || 'Done! Check the preview.',
        },
      });

      if (data.html) {
        dispatch({ type: 'SET_GENERATED_HTML', payload: data.html });
      }
    } catch {
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: {
          role: 'assistant',
          content:
            'Sorry, something went wrong. Please try again.',
        },
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const slotHint = input.trim() || 'Use this image where it fits best (profile photo or a project)';
      const message = `Here is an image I want to add to my website. ${slotHint}\n\n[IMAGE_DATA_URL]: ${dataUrl}`;
      setInput('');
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: { role: 'user', content: `📷 Image uploaded: ${slotHint}` },
      });
      dispatch({ type: 'SET_LOADING', payload: true });

      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          currentHtml: state.generatedHtml,
          chatHistory: state.chatHistory,
          sessionId: state.sessionId,
        }),
      })
        .then((res) =>
          readJsonOrThrow<{ explanation?: string; html?: string; error?: string }>(res),
        )
        .then((data) => {
          dispatch({
            type: 'ADD_CHAT_MESSAGE',
            payload: {
              role: 'assistant',
              content: data.explanation || 'Image added! Check the preview.',
            },
          });
          if (data.html) {
            dispatch({ type: 'SET_GENERATED_HTML', payload: data.html });
          }
        })
        .catch(() => {
          dispatch({
            type: 'ADD_CHAT_MESSAGE',
            payload: {
              role: 'assistant',
              content: 'Sorry, I could not process that image. Try a smaller file or a JPEG/PNG.',
            },
          });
        })
        .finally(() => {
          dispatch({ type: 'SET_LOADING', payload: false });
        });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">AI Assistant</h3>
        <p className="text-xs text-gray-500">
          Describe changes to your website
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {state.chatHistory.length === 0 && (
          <div className="text-center text-gray-400 py-6">
            <Bot className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm mb-4">
              Tell me how you'd like to customize your website.
            </p>
            <div className="space-y-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="block w-full text-left px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  &ldquo;{s}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {state.chatHistory.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${
              msg.role === 'user' ? 'justify-end' : ''
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-brand-600" />
              </div>
            )}
            <div
              className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {state.isLoading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-brand-600" />
            </div>
            <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a change or type where to place an image..."
            rows={1}
            className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm max-h-24"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={state.isLoading}
            className="p-2.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0 border border-gray-200"
            title="Upload an image (profile photo, project screenshot, etc.)"
          >
            <ImagePlus className="w-4 h-4" />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || state.isLoading}
            className="p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
