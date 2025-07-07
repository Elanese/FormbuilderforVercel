export interface GoogleForm {
  id: string;
  title: string;
  description: string;
  publishedUrl: string;
  editUrl: string;
  responseCount: number;
  createdTime: string;
  lastModifiedTime: string;
}

export interface FormResponse {
  id: string;
  timestamp: string;
  responses: Record<string, any>;
}

export interface FormQuestion {
  id: string;
  title: string;
  type: 'TEXT' | 'PARAGRAPH_TEXT' | 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'DROPDOWN' | 'LINEAR_SCALE' | 'DATE' | 'TIME';
  required: boolean;
  options?: string[];
}

export interface FormAnalytics {
  totalResponses: number;
  responseRate: number;
  averageCompletionTime: number;
  topQuestions: Array<{
    question: string;
    responseCount: number;
  }>;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}