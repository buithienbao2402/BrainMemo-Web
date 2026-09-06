// hooks/useHomeSections.ts
import { useQuery } from '@tanstack/react-query';
import { fetchNewestCourses, fetchCompletedCourses, fetchRecentlyUpdatedCourses } from '../api/home.api';

export const useNewestCourses = () => useQuery({ queryKey: ['home-newest'], queryFn: fetchNewestCourses });
export const useCompletedCourses = () => useQuery({ queryKey: ['home-completed'], queryFn: fetchCompletedCourses });
export const useRecentlyUpdatedCourses = () => useQuery({ queryKey: ['home-recent'], queryFn: fetchRecentlyUpdatedCourses });