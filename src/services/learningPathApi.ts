export type CareerField = 'frontend' | 'backend' | 'fullstack';

export type LearningPathDto = {
  _id: string;
  title: string;
  description?: string;
  field: CareerField;
};

export type LearningPathNodeDto = {
  _id: string;
  roadmapId: string;
  milestoneOrder: number;
  order: number;
  title: string;
  description?: string;
  type: string;
  difficulty?: string;
  content?: {
    theory?: string;
    videoUrl?: string;
    questionIds?: string[];
    labExerciseId?: string;
  };
};

export type ProgressDto = {
  _id: string;
  nodeId: string;
  roadmapId: string;
  status: string;
  score?: number;
};

import { request } from './apiClient';

export async function getLearningPaths() {
  return request<LearningPathDto[]>('/learning-paths');
}

export async function getLearningPathByField(field: CareerField) {
  const learningPaths = await getLearningPaths();
  return learningPaths.find((path) => path.field === field) || null;
}

export async function getLearningPathNodes(pathId: string) {
  return request<LearningPathNodeDto[]>(`/learning-paths/${pathId}/nodes`);
}

export async function getMyProgress(pathId: string) {
  return request<ProgressDto[]>(`/learning-paths/${pathId}/my-progress`);
}

export async function updateNodeProgress(
  nodeId: string,
  payload: { status: string; quizScore?: number }
) {
  return request<ProgressDto>(`/learning-paths/nodes/${nodeId}/progress`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
