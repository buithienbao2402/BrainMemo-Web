import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { LearningDashboardSummary } from '../types/learning-dashboard.types';

export async function fetchLearningDashboard(): Promise<LearningDashboardSummary> {
  const { data } = await apiClient.get<ApiResponse<LearningDashboardSummary>>('/learning/dashboard');
  return data.data;
}