import React, { useState, useEffect, useCallback } from 'react';
import type { GeneratedImage } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: GeneratedImage[];
  initialIndex: number;
  prompt: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, images, initialIndex, prompt }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const image = images[currentIndex];

    const handlePrev = useCallback(() => {
        setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
            if (images.length > 1) {
                if (event.key === 'ArrowLeft') {
                    handlePrev();
                } else if (event.key === 'ArrowRight') {
                    handleNext();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, handlePrev, handleNext, images.length]);


    const handleDownload = () => {
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        if (isMobile) {
            // On mobile, open the image in a new tab for easier saving
            window.open(image.url, '_blank');
        } else {
            // On desktop, trigger a direct download
            const link = document.createElement('a');
            link.href = image.url;
            link.download = `tet-cua-nang-${image.id}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleShare = async () => {
        try {
            // Convert data URL to blob
            const response = await fetch(image.url);
            const blob = await response.blob();
            const file = new File([blob], `tet-cua-nang-${image.id}.jpg`, { type: blob.type });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Tết của Nàng',
                    text: 'Ảnh được tạo bởi App Tết của Nàng.',
                });
            } else {
                alert('Trình duyệt của bạn không hỗ trợ tính năng chia sẻ này.');
            }
        } catch (error) {
            console.error('Lỗi khi chia sẻ:', error);
            // alert('Không thể chia sẻ ảnh vào lúc này.');
        }
    };
    
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Close the modal only if the backdrop itself is clicked, not its children
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const NavButton: React.FC<{ direction: 'prev' | 'next'; onClick: () => void }> = ({ direction, onClick }) => (
        <button
            onClick={onClick}
            className={`absolute top-1/2 -translate-y-1/2 ${direction === 'prev' ? 'left-2 md:left-4' : 'right-2 md:right-4'} z-10 p-2 bg-black bg-opacity-40 rounded-full text-white hover:bg-opacity-60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white`}
            aria-label={direction === 'prev' ? 'Ảnh trước' : 'Ảnh kế tiếp'}
        >
            {direction === 'prev' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            )}
        </button>
    );

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
            >
                <div className="flex-shrink-0 md:w-2/3 bg-rose-50 flex items-center justify-center p-4 relative overflow-hidden allow-context-menu">
                    {images.length > 1 && <NavButton direction="prev" onClick={handlePrev} />}
                    <img 
                        src={image.url} 
                        alt="Enlarged view" 
                        className="object-contain w-full h-full max-w-full max-h-full allow-context-menu"
                        draggable={false}
                    />
                    {images.length > 1 && <NavButton direction="next" onClick={handleNext} />}
                     {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            {currentIndex + 1} / {images.length}
                        </div>
                    )}
                </div>
                <div className="flex flex-col p-6 w-full md:w-1/3 text-zinc-900">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-red-700">Chi tiết ảnh</h3>
                        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 text-3xl leading-none">&times;</button>
                    </div>
                    <div className="mt-4 space-y-4 flex-grow overflow-y-auto pr-2">
                        <div>
                            <h4 className="text-sm font-semibold text-rose-600">Prompt</h4>
                            <p className="text-xs text-zinc-700 bg-rose-100 p-2 rounded-md mt-1 break-words">{prompt}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-rose-600">Seed</h4>
                            <p className="text-xs text-zinc-700 bg-rose-100 p-2 rounded-md mt-1 break-words">{image.seed}</p>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                         <button onClick={handleDownload} className="w-full bg-zinc-200 text-zinc-800 font-bold py-3 px-4 rounded-xl hover:bg-zinc-300 transition-colors duration-200 flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Tải ảnh xuống
                        </button>
                        <button onClick={handleShare} className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                             <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                           </svg>
                           Chia sẻ ảnh
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;