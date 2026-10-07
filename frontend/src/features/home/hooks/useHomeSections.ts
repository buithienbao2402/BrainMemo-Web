// hooks/useHomeSections.ts
import { useQuery } from '@tanstack/react-query';
import { fetchNewestCourses, fetchCompletedCourses, fetchRecentlyUpdatedCourses } from '../api/home.api';
import { fetchTopCourses, fetchTopCreators } from '../api/leaderboard.api';

export const useTopCourses = (limit = 10) =>
    useQuery({ queryKey: ['home-top-courses', limit], queryFn: () => fetchTopCourses(limit), staleTime: 60_000 });
export const useTopCreators = (limit = 10) =>
    useQuery({ queryKey: ['home-top-creators', limit], queryFn: () => fetchTopCreators(limit), staleTime: 60_000 });
export const useNewestCourses = () => useQuery({ queryKey: ['home-newest'], queryFn: fetchNewestCourses });
export const useCompletedCourses = () => useQuery({ queryKey: ['home-completed'], queryFn: fetchCompletedCourses });
export const useRecentlyUpdatedCourses = () => useQuery({ queryKey: ['home-recent'], queryFn: fetchRecentlyUpdatedCourses });