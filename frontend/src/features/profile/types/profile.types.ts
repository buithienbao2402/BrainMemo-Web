export interface UserProfile {
  userId: number;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  notificationEnabled: boolean;
  themeMode: 'LIGHT' | 'DARK';
}

export interface UpdateProfilePayload {
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  notificationEnabled: boolean;
  themeMode: 'LIGHT' | 'DARK';
}