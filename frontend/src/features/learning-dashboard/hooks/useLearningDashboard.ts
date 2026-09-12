import { useQuery } from '@tanstack/react-query';
import { fetchLearningDashboard } from '../api/learning-dashboard.api';

export function useLearningDashboard() {
  return useQuery({
    queryKey: ['learning-dashboard'],
    queryFn: fetchLearningDashboard,
  });
}