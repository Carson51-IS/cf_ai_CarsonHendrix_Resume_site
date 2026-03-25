import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { AppState, AppStep, ChatMessage, ResumeData } from '../types';

type Action =
  | { type: 'SET_STEP'; payload: AppStep }
  | { type: 'SET_RESUME_TEXT'; payload: string }
  | { type: 'SET_RESUME_DATA'; payload: ResumeData }
  | { type: 'SET_TEMPLATE'; payload: string }
  | { type: 'SET_GENERATED_HTML'; payload: string }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_CHAT_HISTORY'; payload: ChatMessage[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

function getOrCreateSessionId(): string {
  const key = 'cf_ai_session_id';
  const stored = localStorage.getItem(key);
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}

const initialState: AppState = {
  step: 'upload',
  resumeText: '',
  resumeData: null,
  selectedTemplate: '',
  generatedHtml: '',
  chatHistory: [],
  sessionId: getOrCreateSessionId(),
  isLoading: false,
  error: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_RESUME_TEXT':
      return { ...state, resumeText: action.payload };
    case 'SET_RESUME_DATA':
      return { ...state, resumeData: action.payload, error: null };
    case 'SET_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };
    case 'SET_GENERATED_HTML':
      return { ...state, generatedHtml: action.payload, error: null };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case 'SET_CHAT_HISTORY':
      return { ...state, chatHistory: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'RESET':
      localStorage.removeItem('cf_ai_session_id');
      return { ...initialState, sessionId: crypto.randomUUID() };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
