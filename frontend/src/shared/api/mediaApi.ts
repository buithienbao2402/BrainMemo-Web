import axiosClient from './axiosClient';

export interface MediaUploadResponse {
    url: string;
    fileName: string;
    mediaType: 'IMAGE' | 'AUDIO' | 'VIDEO';
    fileSize: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const uploadMediaApi = async (file: File, mediaType: 'IMAGE' | 'AUDIO' | 'VIDEO'): Promise<MediaUploadResponse> => {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('MediaType', mediaType);

    const response = await axiosClient.post<ApiResponse<MediaUploadResponse>>(
        '/api/media/upload',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data.data;
};