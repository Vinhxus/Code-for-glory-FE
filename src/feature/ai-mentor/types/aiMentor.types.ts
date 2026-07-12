export const AIMentorStyle = {
  INDIRECT: 'indirect',
  STEP_BY_STEP: 'step_by_step',
  CONCEPT_EXPLANATION: 'concept_explanation',
  DIRECT: 'direct',
} as const;
export type AIMentorStyle = (typeof AIMentorStyle)[keyof typeof AIMentorStyle];

export const AIMentorTone = {
  STRICT: 'strict',
  FRIENDLY: 'friendly',
  ENCOURAGING: 'encouraging',
  CUSTOM: 'custom',
} as const;
export type AIMentorTone = (typeof AIMentorTone)[keyof typeof AIMentorTone];

export const AIMessageRole = {
  SYSTEM: 'system',
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;
export type AIMessageRole = (typeof AIMessageRole)[keyof typeof AIMessageRole];

// ===== API Request DTOs =====

export interface CreateSessionDto {
  nodeId?: string;
  questionId?: string;
  exerciseId?: string;
  battleId?: string;
  style?: AIMentorStyle;
  tone?: AIMentorTone;
  contextSummary?: string;
}

export interface SendMessageDto {
  content: string;
}

export interface GetSessionsQuery {
  page?: number;
  limit?: number;
}

// ===== API Response Types =====

export interface AiChatMessage {
  _id: string;
  sessionId: string;
  role: AIMessageRole;
  content: string;
  tokenUsed: number;
  feedbackScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AiChatSession {
  _id: string;
  userId: string;
  nodeId?: string;
  questionId?: string;
  exerciseId?: string;
  battleId?: string;
  style: AIMentorStyle;
  tone: AIMentorTone;
  model: string;
  totalTokensUsed: number;
  messageCount: number;
  isClosed: boolean;
  title?: string;
  contextSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionDetailResponse {
  session: AiChatSession;
  messages: AiChatMessage[];
}

export interface SendMessageResponse {
  userMessage: AiChatMessage;
  assistantMessage: AiChatMessage;
}

export interface PaginatedSessions {
  sessions: AiChatSession[];
  total: number;
  page: number;
  limit: number;
}
