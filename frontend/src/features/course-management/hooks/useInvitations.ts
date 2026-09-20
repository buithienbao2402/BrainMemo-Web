import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendInvitation, revokeInvitation } from '../api/invitations.api';
import { courseDetailKeys } from './useCourseDetail';

export function useSendInvitation(courseId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (emailOrUsername: string) => sendInvitation(courseId, emailOrUsername),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: courseDetailKeys.invitations(courseId) });
        },
    });
}

export function useRevokeInvitation(courseId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (invitationId: number) => revokeInvitation(courseId, invitationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: courseDetailKeys.invitations(courseId) });
        },
    });
}