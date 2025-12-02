import React, { useState, useEffect } from 'react';

interface LoadingModalProps {
  isOpen: boolean;
  quotes: string[];
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen, quotes }) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    if (isOpen && quotes.length > 0) {
      const interval = setInterval(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
      }, 7000); // Change quote every 7 seconds

      return () => clearInterval(interval);
    }
  }, [isOpen, quotes.length]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-opacity duration-300">
      <div className="text-center text-zinc-900 p-8">
        {/* Spinner */}
        <svg className="animate-spin h-12 w-12 text-red-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        
        <h2 className="text-2xl font-bold mt-6">Đang kiến tạo kiệt tác...</h2>
        <p className="text-rose-600 mt-2">Vui lòng đợi trong giây lát.</p>

        <div className="mt-8 min-h-[60px] flex items-center justify-center">
            <p className="text-lg italic text-rose-700 transition-opacity duration-500">
                "{quotes[currentQuoteIndex]}"
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;