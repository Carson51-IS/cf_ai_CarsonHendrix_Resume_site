export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  links: SocialLink[];
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface Project {
  name: string;
  description: string;
  url?: string;
  technologies: string[];
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type AppStep = 'upload' | 'template' | 'customize';

export interface AppState {
  step: AppStep;
  resumeText: string;
  resumeData: ResumeData | null;
  selectedTemplate: string;
  generatedHtml: string;
  chatHistory: ChatMessage[];
  sessionId: string;
  isLoading: boolean;
  error: string | null;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  previewColors: {
    bg: string;
    accent: string;
    text: string;
    secondary: string;
  };
  stylePrompt: string;
}
