import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imgSrc: string;
  onConfirm: (file: File, url: string) => void;
  onUseOriginal: () => void;
}

const aspectRatios = [
    { value: 16 / 9, label: 'Ngang' },
    { value: 4 / 3, label: 'Ngang' },
    { value: 1 / 1, label: 'Vuông' },
    { value: 3 / 4, label: 'Dọc' },
    { value: 9 / 16, label: 'Dọc' },
    { value: undefined, label: 'Tự do' },
];

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop, fileName: string): Promise<{file: File, url: string}> {
  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('Could not get canvas context'));
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        resolve({ file, url });
      },
      'image/jpeg',
      1 // quality
    );
  });
}


const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ isOpen, onClose, imgSrc, onConfirm, onUseOriginal }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(3/4);
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect || width / height,
            width,
            height
        ),
        width,
        height
    );
    setCrop(newCrop);
    setCompletedCrop(newCrop);
  }

  const handleConfirmCrop = async () => {
    if (completedCrop && imgRef.current) {
        try {
            const {file, url} = await getCroppedImg(imgRef.current, completedCrop, 'cropped-image.jpg');
            onConfirm(file, url);
        } catch (e) {
            console.error(e);
            alert("Không thể cắt ảnh, vui lòng thử lại.");
        }
    } else {
        alert("Vui lòng chọn vùng ảnh để cắt.");
    }
  }
  
  const handleSetAspect = (newAspect: number | undefined) => {
      setAspect(newAspect);
      if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                newAspect || width / height,
                width,
                height
            ),
            width,
            height
        );
        setCrop(newCrop);
        setCompletedCrop(newCrop);
      }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden p-4 md:p-6">
        <h3 className="text-xl font-bold text-red-700 mb-4 text-center">Tùy chỉnh ảnh gốc</h3>
        <div className="flex-grow min-h-0 flex items-center justify-center bg-rose-50 rounded-lg p-2">
           {imgSrc && (
             <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                className="max-h-[60vh]"
            >
                <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '60vh', objectFit: 'contain' }}/>
            </ReactCrop>
           )}
        </div>
         <div className="mt-4 flex flex-wrap justify-center gap-2">
            {aspectRatios.map(ar => (
                <button
                    key={ar.label + (ar.value || '')}
                    onClick={() => handleSetAspect(ar.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200
                        ${aspect === ar.value ? 'bg-red-500 border-red-500 text-white' : 'bg-rose-100 border-rose-200 text-rose-800 hover:bg-rose-200'}
                    `}
                >
                    {ar.label} {ar.value ? `(${ar.value === 1 ? '1:1' : ar.value.toFixed(2)})` : ''}
                </button>
            ))}
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={onUseOriginal} className="w-full sm:w-auto bg-zinc-200 text-zinc-800 font-bold py-3 px-6 rounded-xl hover:bg-zinc-300 transition-colors duration-200">
                Dùng ảnh gốc
            </button>
            <button onClick={handleConfirmCrop} className="w-full sm:w-auto bg-red-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-600 transition-colors duration-200">
                Xác nhận
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;