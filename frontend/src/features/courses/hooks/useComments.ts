import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchComments, postComment, updateComment, deleteComment } from '../api/comment.api';

export function useComments(courseId: number) {
  return useQuery({ queryKey: ['comments', courseId], queryFn: () => fetchComments(courseId), enabled: !!courseId });
}
export function usePostComment(courseId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (content: string) => postComment(courseId, content), onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', courseId] }) });
}
export function useUpdateComment(courseId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, content }: { id: number; content: string }) => updateComment(id, content), onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', courseId] }) });
}
export function useDeleteComment(courseId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => deleteComment(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', courseId] }) });
}