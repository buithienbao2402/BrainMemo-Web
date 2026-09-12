import React, { useState } from 'react';
import { uploadMediaApi, type MediaUploadResponse } from '@/shared/api/mediaApi';
import type { MediaBlockData } from './MediaBlockView';

interface MediaBlockEditorProps {
    initialData?: MediaBlockData;
    onSave: (data: MediaBlockData) => void;
    onCancel: () => void;
}

export const MediaBlockEditor: React.FC<MediaBlockEditorProps> = ({
    initialData,
    onSave,
    onCancel,
}) => {
    const [mediaType, setMediaType] = useState<'IMAGE' | 'AUDIO' | 'VIDEO'>(initialData?.mediaType || 'IMAGE');
    const [url, setUrl] = useState<string>(initialData?.url || '');
    const [caption, setCaption] = useState<string>(initialData?.caption || '');
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const acceptMap: Record<string, string> = {
        IMAGE: 'image/png, image/jpeg, image/webp, image/gif',
        AUDIO: 'audio/mp3, audio/wav, audio/ogg, audio/m4a, audio/mpeg',
        VIDEO: 'video/mp4, video/webm, video/quicktime',
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) {
            setErrorMessage('Kích thước tệp không được vượt quá 100MB.');
            return;
        }

        try {
            setIsUploading(true);
            setErrorMessage('');
            const res: MediaUploadResponse = await uploadMediaApi(file, mediaType);
            setUrl(res.url);
        } catch (err: unknown) {
            const errorResponse = err as { response?: { data?: { message?: string } } };
            setErrorMessage(errorResponse?.response?.data?.message || 'Tải lên media thất bại, vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = () => {
        if (!url) {
            setErrorMessage('Vui lòng chọn và tải tệp lên trước khi lưu.');
            return;
        }
        onSave({ url, caption, mediaType });
    };

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Cấu hình Media Block
                </span>

                <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                    {(['IMAGE', 'AUDIO', 'VIDEO'] as const).map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => {
                                setMediaType(type);
                                setUrl('');
                                setErrorMessage('');
                            }}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${mediaType === type
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            {type === 'IMAGE' ? '🖼️ Hình ảnh' : type === 'AUDIO' ? '🎵 Âm thanh' : '🎬 Video'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                {isUploading ? (
                    <div className="flex flex-col items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Đang tải tệp lên máy chủ...</span>
                    </div>
                ) : url ? (
                    <div className="w-full space-y-3 flex flex-col items-center">
                        {mediaType === 'IMAGE' && (
                            <img src={url} alt="Preview" className="max-h-56 rounded-md object-contain shadow-sm" />
                        )}
                        {mediaType === 'AUDIO' && (
                            <audio controls src={url} className="w-full max-w-md" />
                        )}
                        {mediaType === 'VIDEO' && (
                            <video controls src={url} className="max-h-56 max-w-full rounded-md shadow-sm" />
                        )}
                        <label className="cursor-pointer text-xs font-medium text-blue-600 hover:underline">
                            Chọn tệp khác thay thế
                            <input
                                type="file"
                                className="hidden"
                                accept={acceptMap[mediaType]}
                                onChange={handleFileSelect}
                            />
                        </label>
                    </div>
                ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            📁
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Nhấn để tải lên tệp {mediaType.toLowerCase()}
                        </span>
                        <span className="text-xs text-slate-400">Dung lượng tối đa: 100MB</span>
                        <input
                            type="file"
                            className="hidden"
                            accept={acceptMap[mediaType]}
                            onChange={handleFileSelect}
                        />
                    </label>
                )}
            </div>

            {errorMessage && (
                <p className="text-xs text-red-500 font-medium">{errorMessage}</p>
            )}

            <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Chú thích media (Caption)
                </label>
                <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Ví dụ: Sơ đồ luồng hoạt động..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                    Hủy
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isUploading || !url}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
                >
                    Lưu Block
                </button>
            </div>
        </div>
    );
};