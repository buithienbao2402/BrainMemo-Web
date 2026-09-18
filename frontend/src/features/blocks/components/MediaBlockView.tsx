import React from 'react';

export interface MediaBlockData {
    url: string;
    caption?: string;
    mediaType: 'IMAGE' | 'AUDIO' | 'VIDEO';
}

interface MediaBlockViewProps {
    data: MediaBlockData;
}

export const MediaBlockView: React.FC<MediaBlockViewProps> = ({ data }) => {
    const { url, caption, mediaType } = data;

    if (!url) return null;

    return (
        <div className="my-5 flex flex-col items-center justify-center w-full">
            <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-800 flex justify-center items-center">
                {mediaType === 'IMAGE' && (
                    <img
                        src={url}
                        alt={caption || 'Hình ảnh minh họa'}
                        className="max-h-[500px] w-auto max-w-full object-contain"
                        loading="lazy"
                    />
                )}

                {mediaType === 'AUDIO' && (
                    <div className="w-full p-4">
                        <audio controls src={url} className="w-full focus:outline-none">
                            Trình duyệt của bạn không hỗ trợ phát âm thanh.
                        </audio>
                    </div>
                )}

                {mediaType === 'VIDEO' && (
                    <video
                        controls
                        src={url}
                        className="w-full max-h-[500px] aspect-video bg-black focus:outline-none"
                    >
                        Trình duyệt của bạn không hỗ trợ phát video.
                    </video>
                )}
            </div>

            {caption && (
                <p className="mt-2 text-center text-sm italic text-slate-500 dark:text-slate-400">
                    {caption}
                </p>
            )}
        </div>
    );
};