import axiosInstance from './axiosInstance';
import type {
  Battle,
  BattleField,
  BattleMode,
  SubmitAnswerPayload,
  SubmitAnswerResponse,
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
