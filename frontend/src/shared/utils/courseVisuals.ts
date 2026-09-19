import defaultCourseCover from '@/assets/course-default-cover.png';
import { resolveMediaUrl } from './mediaUrl';

export function getCourseCoverUrl(coverImageUrl?: string | null): string {
    return resolveMediaUrl(coverImageUrl) ?? defaultCourseCover;
}

export function getCourseCoverBackground(coverImageUrl?: string | null): string {
    return `url("${getCourseCoverUrl(coverImageUrl)}") center/cover`;
}