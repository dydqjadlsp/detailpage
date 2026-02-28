'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';

interface SectionImageUploadProps {
    imageUrl?: string;
    onUpload: (url: string) => void;
    onRemove: () => void;
    accentColor?: string;
}

export default function SectionImageUpload({
    imageUrl,
    onUpload,
    onRemove,
    accentColor = '#7C3AED',
}: SectionImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const uploadFile = useCallback(
        async (file: File) => {
            setError('');
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/upload/reference', {
                    method: 'POST',
                    body: formData,
                });
                const result = await res.json();

                if (result.ok && result.data?.url) {
                    onUpload(result.data.url);
                } else {
                    const errMsg =
                        typeof result.error === 'string'
                            ? result.error
                            : result.error?.message || '업로드에 실패했습니다';
                    setError(errMsg);
                }
            } catch {
                setError('네트워크 오류가 발생했습니다');
            } finally {
                setIsUploading(false);
            }
        },
        [onUpload],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file?.type.startsWith('image/')) {
                uploadFile(file);
            } else {
                setError('이미지 파일만 업로드 가능합니다');
            }
        },
        [uploadFile],
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
            e.target.value = '';
        },
        [uploadFile],
    );

    if (imageUrl) {
        return (
            <div className="relative group rounded-lg overflow-hidden border border-white/10">
                <img
                    src={imageUrl}
                    alt="참고 이미지"
                    className="w-full h-32 object-cover"
                />
                <button
                    type="button"
                    onClick={onRemove}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    aria-label="이미지 삭제"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/50 text-[10px] text-white/70">
                    참고 이미지 - AI가 스타일을 참고하여 생성합니다
                </div>
            </div>
        );
    }

    return (
        <div>
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                className={`
                    flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed
                    cursor-pointer transition-all text-center
                    ${isDragging
                        ? 'border-current bg-current/5'
                        : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                    }
                `}
                style={isDragging ? { borderColor: accentColor, color: accentColor } : undefined}
            >
                {isUploading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                        <span className="text-xs text-neutral-400">업로드 중...</span>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2 text-neutral-500">
                            <ImageIcon className="w-4 h-4" />
                            <Upload className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-neutral-500">
                            참고 이미지 드래그 또는 클릭
                        </span>
                        <span className="text-[10px] text-neutral-600">
                            PNG, JPG, WebP, GIF (최대 10MB)
                        </span>
                    </>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            {error && (
                <p className="mt-1 text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}
