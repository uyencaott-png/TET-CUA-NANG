import React from 'react';

interface CustomPromptInputProps {
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
}

const CustomPromptInput: React.FC<CustomPromptInputProps> = ({ customPrompt, onCustomPromptChange }) => {
  return (
    <div className="bg-rose-200 p-6 rounded-2xl shadow-md">
      <h2 className="text-lg font-bold text-zinc-900 mb-4">3. Thêm chi tiết (tùy chọn)</h2>
      <textarea
        value={customPrompt}
        onChange={(e) => onCustomPromptChange(e.target.value)}
        placeholder="Ví dụ: mặc váy dạ hội đỏ, tóc xoăn dài, đeo trang sức kim cương..."
        className="w-full h-24 p-3 bg-white border border-rose-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 text-sm text-zinc-900 resize-none placeholder-zinc-500"
        aria-label="Custom prompt details"
      />
    </div>
  );
};

export default CustomPromptInput;