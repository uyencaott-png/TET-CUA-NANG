import React, { useCallback, useState } from 'react';
import ImageCropperModal from './ImageCropperModal';

interface ImageUploaderProps {
  onImageUpload: (file: File, previewUrl: string) => void;
  preview: string | null;
  isFaceLockEnabled: boolean;
  onToggleFaceLock: (enabled: boolean) => void;
  withFlowers: boolean;
  onToggleWithFlowers: (enabled: boolean) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  preview, 
  isFaceLockEnabled, 
  onToggleFaceLock,
  withFlowers,
  onToggleWithFlowers
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<{file: File, url: string} | null>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Định dạng file không hợp lệ. Vui lòng chọn JPG, PNG, hoặc WebP.');
        return;
      }
      if (file.size > 15 * 1024 * 1024) { // 15MB
        alert('Dung lượng file quá lớn. Vui lòng chọn ảnh nhỏ hơn 15MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageToCrop({ file, url: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile: File, previewUrl: string) => {
    onImageUpload(croppedFile, previewUrl);
    setImageToCrop(null); // Close modal
  };

  const handleUseOriginal = () => {
      if (imageToCrop) {
        onImageUpload(imageToCrop.file, imageToCrop.url);
        setImageToCrop(null);
      }
  };


  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, []);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };
  
  const triggerFileInput = () => {
    document.getElementById('file-input')?.click();
  }

  return (
    <div className="bg-rose-200 p-6 rounded-2xl shadow-md text-zinc-900">
      {imageToCrop && (
        <ImageCropperModal
          isOpen={!!imageToCrop}
          onClose={() => setImageToCrop(null)}
          imgSrc={imageToCrop.url}
          onConfirm={handleCropComplete}
          onUseOriginal={handleUseOriginal}
        />
      )}
      <h2 className="text-lg font-bold mb-4">1. Tải ảnh gốc của bạn</h2>
      <div 
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors duration-300 ${isDragging ? 'border-rose-400 bg-rose-100/80' : 'border-rose-300 bg-rose-100/50'} ${!preview ? 'cursor-pointer hover:border-rose-400' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={!preview ? triggerFileInput : undefined}
      >
        <input 
          type="file" 
          id="file-input" 
          className="hidden" 
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileInputChange}
        />
        {preview ? (
          <div className="flex flex-col items-center text-center">
            <img src={preview} alt="Xem trước" className="max-h-48 w-auto rounded-xl object-contain shadow-md mb-4" />
            <div className="flex gap-2">
                <button onClick={triggerFileInput} className="text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors">
                    Thay đổi ảnh
                </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-zinc-900/40" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 4v.01M28 8L20 16m0 0h8m-8 0V8m12 12v12a4 4 0 01-4 4H12a4 4 0 01-4-4V12a4 4 0 014-4h12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 text-sm text-zinc-800">
              Kéo thả hoặc <span className="font-semibold text-zinc-900">chọn ảnh</span>
            </p>
            <p className="mt-1 text-xs text-zinc-700">JPG, PNG, WebP (tối đa 15MB)</p>
            <p className="mt-1 text-xs text-zinc-700">Khuyến nghị ảnh rõ mặt, đủ sáng (≥ 1024px)</p>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-col items-center justify-center gap-3">
        {/* Face Lock Toggle */}
        <label htmlFor="face-lock-toggle" className="flex items-center cursor-pointer">
          <div className="relative">
            <input 
              type="checkbox" 
              id="face-lock-toggle" 
              className="sr-only" 
              checked={isFaceLockEnabled} 
              onChange={() => onToggleFaceLock(!isFaceLockEnabled)}
              aria-label="Phân tích nhân vật và khóa mặt"
            />
            <div className={`block w-14 h-8 rounded-full transition-colors ${isFaceLockEnabled ? 'bg-red-500' : 'bg-rose-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isFaceLockEnabled ? 'transform translate-x-6' : ''}`}></div>
          </div>
          <div className="ml-3 font-semibold">
            PHÂN TÍCH & KHÓA MẶT
          </div>
        </label>
        {/* Flower Toggle */}
        <label htmlFor="with-flowers-toggle" className="flex items-center cursor-pointer">
          <div className="relative">
            <input 
              type="checkbox" 
              id="with-flowers-toggle" 
              className="sr-only" 
              checked={withFlowers} 
              onChange={() => onToggleWithFlowers(!withFlowers)}
              aria-label="Thêm hoa vào ảnh"
            />
            <div className={`block w-14 h-8 rounded-full transition-colors ${withFlowers ? 'bg-red-500' : 'bg-rose-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${withFlowers ? 'transform translate-x-6' : ''}`}></div>
          </div>
          <div className="ml-3 font-semibold">
            CÓ HOA / KHÔNG CÓ HOA
          </div>
        </label>
      </div>
    </div>
  );
};

export default ImageUploader;