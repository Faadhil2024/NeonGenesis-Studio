export interface EnhancedPrompt {
  subject: string;
  detailed_description: string;
  artistic_style: string;
  lighting: string;
  mood: string;
  technical_details: string;
}

export interface GenerationResult {
  imageUrl?: string;
  generatedText?: string;
}

export enum AppMode {
  GENERATE = 'GENERATE',
  EDIT = 'EDIT'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text?: string;
  image?: string;
  isJsonPrompt?: boolean;
}