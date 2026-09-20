// hooks/useHomeSections.ts
import { useQuery } from '@tanstack/react-query';
import { fetchNewestCourses, fetchCompletedCourses, fetchRecentlyUpdatedCourses } from '../api/home.api';
import { fetchLeaderboard } from '../api/leaderboard.api';

export const useLeaderboard = (limit = 10) =>
    useQuery({ queryKey: ['home-leaderboard', limit], queryFn: () => fetchLeaderboard(limit), staleTime: 60_000 });
export const useNewestCourses = () => useQuery({ queryKey: ['home-newest'], queryFn: fetchNewestCourses });
export const useCompletedCourses = () => useQuery({ queryKey: ['home-completed'], queryFn: fetchCompletedCourses });
export const useRecentlyUpdatedCourses = () => useQuery({ queryKey: ['home-recent'], queryFn: fetchRecentlyUpdatedCourses });