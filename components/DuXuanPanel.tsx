import React from 'react';
import { DU_XUAN_CATEGORIES } from '../constants';
import type { GeneratedImage } from '../types';

interface DuXuanPanelProps {
  selectedImage: GeneratedImage | null;
  onGenerate: (prompt: string) => void;
}

const DuXuanPanel: React.FC<DuXuanPanelProps> = ({ selectedImage, onGenerate }) => {
  const isButtonDisabled = !selectedImage;

  return (
    <div className="bg-rose-200 p-6 rounded-2xl shadow-md">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold text-zinc-900">✨ Du Xuân - Thay đổi bối cảnh ✨</h2>
        <p className={`text-sm mt-1 transition-colors duration-300 ${isButtonDisabled ? 'text-rose-600' : 'text-zinc-800'}`}>
            {isButtonDisabled
              ? "Chọn một ảnh từ kết quả ở trên để bắt đầu."
              : "Tuyệt vời! Bây giờ hãy chọn một địa điểm để đưa nàng đến."
            }
        </p>
      </div>

      <div className="space-y-5">
        {DU_XUAN_CATEGORIES.map((category) => (
          <div key={category.name}>
            <h3 className="text-md font-bold text-zinc-800 mb-3">{category.name}</h3>
            <div className="flex flex-wrap gap-2">
              {category.concepts.map((concept) => (
                <button
                  key={concept.key}
                  onClick={() => onGenerate(concept.prompt)}
                  disabled={isButtonDisabled}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-rose-200 focus:ring-red-500
                    ${isButtonDisabled
                      ? 'bg-white border-rose-300 text-rose-400 cursor-not-allowed'
                      : 'bg-white border-rose-300 text-rose-800 hover:bg-rose-100 hover:border-rose-400'
                    }`}
                >
                  {concept.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DuXuanPanel;