import defaultCourseCover from '@/assets/course-default-cover.png';

export function getCourseCoverUrl(coverImageUrl?: string | null): string {
  return coverImageUrl || defaultCourseCover;
}

export function getCourseCoverBackground(coverImageUrl?: string | null): string {
  return `url(${getCourseCoverUrl(coverImageUrl)}) center/cover`;
}