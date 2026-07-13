import axiosInstance from '../../battle/services/axiosInstance.ts';
import { AI_MENTOR_API } from '../constants/aiMentor.constants.ts';
import type {
  CreateSessionDto,
  SendMessageDto,
  GetSessionsQuery,
  AiChatSession,
  SessionDetailResponse,
  SendMessageResponse,
  PaginatedSessions,
} from '../types/aiMentor.types.ts';

// POST /ai-mentor/sessions
export async function createSession(
  dto: CreateSessionDto
): Promise<AiChatSession> {
  const res = await axiosInstance.post<AiChatSession>(
    AI_MENTOR_API.SESSIONS,
    dto
  );
  return res.data as AiChatSession;
}

// GET /ai-mentor/sessions?page=&limit=
export async function getSessions(
  query?: GetSessionsQuery
): Promise<PaginatedSessions> {
  const res = await axiosInstance.get<PaginatedSessions>(
    AI_MENTOR_API.SESSIONS,
    { params: query }
  );
  return res.data as PaginatedSessions;
}

// GET /ai-mentor/sessions/:sessionId
export async function getSessionDetail(
  sessionId: string
): Promise<SessionDetailResponse> {
  const res = await axiosInstance.get<SessionDetailResponse>(
    AI_MENTOR_API.SESSION_DETAIL(sessionId)
  );
  return res.data as SessionDetailResponse;
}

// PATCH /ai-mentor/sessions/:sessionId/close
export async function closeSession(sessionId: string): Promise<AiChatSession> {
  const res = await axiosInstance.patch<AiChatSession>(
    AI_MENTOR_API.CLOSE_SESSION(sessionId)
  );
  return res.data as AiChatSession;
}

// POST /ai-mentor/sessions/:sessionId/messages
export async function sendMessage(
  sessionId: string,
  dto: SendMessageDto
): Promise<SendMessageResponse> {
  const res = await axiosInstance.post<SendMessageResponse>(
    AI_MENTOR_API.SEND_MESSAGE(sessionId),
    dto
  );
  return res.data as SendMessageResponse;
}
