import axiosInstance from './axiosInstance';
import type {
  Battle,
  BattleField,
  BattleMode,
  SubmitAnswerPayload,
  SubmitAnswerResponse,
  BattleSubmission,
  CodeAnalysis,
  CreateAnalysisPayload,
} from '../types/battle.types';

export const createBattle = async (
  field: BattleField,
  mode: BattleMode
): Promise<Battle> => {
  const response = await axiosInstance.post('/battles/match', { field, mode });
  return response.data;
};

export const submitAnswer = async (
  battleId: string,
  payload: SubmitAnswerPayload
): Promise<SubmitAnswerResponse> => {
  const response = await axiosInstance.post(
    `/battles/${battleId}/submit`,
    payload
  );
  return response.data;
};
// Pages and limit number item
export const getBattleHistory = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get('/battles/history', {
    params: { page, limit },
  });
  return response.data;
};

export const abandonBattle = async (battleId: string) => {
  const response = await axiosInstance.post(`/battles/${battleId}/abandon`);
  return response.data;
};
export const getBattleById = async (battleId: string): Promise<Battle> => {
  const response = await axiosInstance.get(`/battles/${battleId}`);
  return response.data;
};
export const getSubmissions = async (
  battleId: string
): Promise<BattleSubmission[]> => {
  const response = await axiosInstance.get(`/battles/${battleId}/submissions`);
  return response.data;
};

export const createAnalysis = async (
  payload: CreateAnalysisPayload
): Promise<CodeAnalysis> => {
  const response = await axiosInstance.post('/code-analysis', payload);
  return response.data;
};

export const getAnalysis = async (battleId: string): Promise<CodeAnalysis> => {
  const response = await axiosInstance.get(`/code-analysis/${battleId}`);
  return response.data;
};

export const cancelMatchmaking = async (battleId: string) => {
  const response = await axiosInstance.post(
    `/battles/${battleId}/cancel-match`
  );
  return response.data;
};
