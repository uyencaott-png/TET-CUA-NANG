import React, { useState } from 'react';
import type { GeneratedImage } from '../types';
import Modal from './Modal';

interface ResultGridProps {
  isLoading: boolean;
  images: GeneratedImage[];
  prompt: string;
  numberOfImages: number;
  selectedImage: GeneratedImage | null;
  onSelectImage: (image: GeneratedImage) => void;
}

const Skeleton: React.FC = () => (
  <div className="relative aspect-[9/16] bg-rose-200 rounded-xl overflow-hidden animate-pulse">
     <div className="w-full h-full bg-rose-100"></div>
  </div>
);


const ResultGrid: React.FC<ResultGridProps> = ({ isLoading, images, prompt, numberOfImages, selectedImage, onSelectImage }) => {
  const [modalState, setModalState] = useState<{ images: GeneratedImage[], index: number } | null>(null);

  const handleImageClick = (index: number) => {
    setModalState({ images, index });
  };

  const handleCloseModal = () => {
    setModalState(null);
  };

  const handleDownload = (e: React.MouseEvent, image: GeneratedImage) => {
    e.stopPropagation(); // Prevent opening modal
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: numberOfImages }).map((_, index) => (
            <Skeleton key={index} />
          ))}
        </div>
      );
    }

    if (images.length > 0) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => {
            const isSelected = selectedImage?.id === image.id;
            return (
              <div
                key={image.id}
                className="relative group overflow-hidden rounded-xl shadow-lg"
              >
                <div 
                  className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${isSelected ? 'ring-4 ring-red-500' : ''}`}
                  onClick={() => handleImageClick(index)}
                >
                  <img
                    src={image.url}
                    alt={`Generated art ${image.id}`}
                    className="w-full h-auto object-cover aspect-[9/16] transition-transform duration-300 group-hover:scale-105 allow-context-menu"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center rounded-xl">
                     <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 rounded-full bg-black/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                     </div>
                  </div>

                  {/* Quick Download Button */}
                  <button
                    onClick={(e) => handleDownload(e, image)}
                    className="absolute top-2 right-2 z-30 p-2 bg-white/90 text-zinc-900 rounded-full shadow-md hover:bg-white hover:text-red-600 transition-all duration-200 allow-context-menu"
                    title="Tải ảnh xuống"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                </div>
                <div className="absolute bottom-2 left-2 right-2 z-10">
                    <button 
                      onClick={() => onSelectImage(image)}
                      className={`w-full text-xs font-bold py-2 px-2 rounded-lg transition-all duration-200 shadow-md
                        ${isSelected
                          ? 'bg-red-600 text-white'
                          : 'bg-white/80 backdrop-blur-sm text-zinc-900 hover:bg-white'
                        }`}
                    >
                      {isSelected ? '✓ Đã chọn' : 'Du Xuân với ảnh này'}
                    </button>
                </div>
              </div>
            )
          })}
        </div>
      );
    }

    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center text-zinc-800 p-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-900/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-xl font-semibold text-zinc-900">Sẵn sàng tạo nên kiệt tác!</h3>
        <p className="mt-2 max-w-sm">
          Hãy tải lên ảnh của bạn, chọn một concept, và nhấn nút "Tạo ảnh" để xem điều kỳ diệu xảy ra.
        </p>
      </div>
    );
  };

  return (
    <div className="bg-rose-200 p-4 md:p-6 rounded-2xl shadow-md min-h-[calc(100vh-10rem)] flex flex-col">
      <h2 className="text-xl font-bold text-zinc-900 mb-4 text-center">Kết quả</h2>
      <div className="flex-grow">
        {renderContent()}
      </div>
      {modalState && (
        <Modal
          isOpen={!!modalState}
          onClose={handleCloseModal}
          images={modalState.images}
          initialIndex={modalState.index}
          prompt={prompt}
        />
      )}
    </div>
  );
};

export default ResultGrid;