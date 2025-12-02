import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import ConceptSelector from './components/ConceptSelector';
import CustomPromptInput from './components/CustomPromptInput';
import ResultGrid from './components/ResultGrid';
import LoadingModal from './components/LoadingModal';
import DuXuanPanel from './components/DuXuanPanel';
import { CONCEPT_CATEGORIES, LOADING_QUOTES } from './constants';
import { generatePortraits } from './services/geminiService';
import type { GeneratedImage } from './types';

const App: React.FC = () => {
  // State management
  const [uploadedImage, setUploadedImage] = useState<{ file: File, preview: string } | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>('tet_countryside_village');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isFaceLockEnabled, setIsFaceLockEnabled] = useState<boolean>(true);
  const [withFlowers, setWithFlowers] = useState<boolean>(true);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [finalPrompt, setFinalPrompt] = useState<string>('');
  const [selectedImageForDuXuan, setSelectedImageForDuXuan] = useState<GeneratedImage | null>(null);


  // Handlers
  const handleImageUpload = (file: File, previewUrl: string) => {
    setUploadedImage({ file, preview: previewUrl });
    setError(null); // Clear previous errors on new upload
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // remove data:image/jpeg;base64,
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = useCallback(async () => {
    if (!uploadedImage) {
      setError('Vui lòng tải ảnh gốc lên.');
      return;
    }
    if (!selectedConcept) {
      setError('Vui lòng chọn một concept.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]); // Clear previous images
    setSelectedImageForDuXuan(null); // Reset Du Xuan selection

    try {
      const allConcepts = CONCEPT_CATEGORIES.flatMap(category => category.concepts);
      const conceptPrompt = allConcepts.find(c => c.key === selectedConcept)?.prompt || '';
      
      const fullPrompt = `${conceptPrompt}${customPrompt ? `, ${customPrompt}` : ''}.`;
      setFinalPrompt(fullPrompt); // Save the prompt for the modal

      const imageBase64 = await fileToBase64(uploadedImage.file);
      
      const params = {
        prompt: fullPrompt,
        negativePrompt: 'blurry, grainy, deformed, distorted, ugly, disfigured, poorly drawn, extra limbs, bad anatomy, mutated, watermark, signature, text, multiple people',
        aspectRatio: '9:16' as const,
        imageBase64,
        mimeType: uploadedImage.file.type,
        numberOfImages: 2 as const,
        isFaceLockEnabled: isFaceLockEnabled,
        withFlowers: withFlowers,
      };

      const results = await generatePortraits(params);
      
      setGeneratedImages(results);
      

    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi không mong muốn.');
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, selectedConcept, customPrompt, isFaceLockEnabled, withFlowers]);

  const handleDuXuanGenerate = useCallback(async (duXuanPrompt: string) => {
    if (!selectedImageForDuXuan) {
      setError('Vui lòng chọn một ảnh đã tạo để bắt đầu Du Xuân.');
      return;
    }

    setIsLoading(true); // Reuse the main loader
    setError(null);
    setGeneratedImages([]); // Clear previous images to show loader in the grid
    
    try {
      // Fetch the generated image and convert it to a File object to get base64
      const response = await fetch(selectedImageForDuXuan.url);
      const blob = await response.blob();
      const file = new File([blob], "generated_image.jpg", { type: blob.type });

      const imageBase64 = await fileToBase64(file);

      const fullPrompt = duXuanPrompt;
      setFinalPrompt(fullPrompt); 

      const params = {
        prompt: fullPrompt,
        negativePrompt: 'blurry, grainy, deformed, distorted, ugly, disfigured, poorly drawn, extra limbs, bad anatomy, mutated, watermark, signature, text, multiple people, tiling, out of frame',
        aspectRatio: '9:16' as const,
        imageBase64,
        mimeType: file.type,
        numberOfImages: 2 as const,
        isFaceLockEnabled: true, // Always lock face for this feature
        withFlowers: false, // No extra flowers for background change
      };

      const results = await generatePortraits(params);
      setGeneratedImages(results);
      setSelectedImageForDuXuan(null); // Deselect after generation

    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tạo ảnh Du Xuân.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedImageForDuXuan]);


  const isGenerateDisabled = isLoading || !uploadedImage || !selectedConcept;

  return (
    <div className="min-h-screen text-zinc-900">
      <LoadingModal isOpen={isLoading} quotes={LOADING_QUOTES} />
      <header className="text-center pt-8 pb-4">
        <h1 className="text-5xl font-bold text-red-700 tracking-wider">Tết của Nàng</h1>
        <p className="text-rose-600 mt-2">Mong cả thê giới vẫn dịu dàng với Em</p>
      </header>
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Controls */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              preview={uploadedImage?.preview || null} 
              isFaceLockEnabled={isFaceLockEnabled}
              onToggleFaceLock={setIsFaceLockEnabled}
              withFlowers={withFlowers}
              onToggleWithFlowers={setWithFlowers}
            />
            <ConceptSelector selectedConcept={selectedConcept} onSelectConcept={setSelectedConcept} />
            <CustomPromptInput customPrompt={customPrompt} onCustomPromptChange={setCustomPrompt} />
            
            <div className="mt-2">
              {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
              <button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className={`w-full text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 text-lg
                  ${isGenerateDisabled 
                    ? 'bg-rose-200 text-rose-400 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-red-500/50'
                  }`}
              >
                {isLoading ? 'Đang tạo ảnh...' : 'Tạo 2 ảnh'}
              </button>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ResultGrid 
              isLoading={isLoading} 
              images={generatedImages} 
              prompt={finalPrompt}
              numberOfImages={2}
              selectedImage={selectedImageForDuXuan}
              onSelectImage={setSelectedImageForDuXuan}
            />
            {generatedImages.length > 0 && !isLoading && (
              <DuXuanPanel 
                selectedImage={selectedImageForDuXuan}
                onGenerate={handleDuXuanGenerate}
              />
            )}
          </div>
        </div>

        {/* Gift CTA Button */}
        <div className="mt-12 text-center">
          <a 
            href="https://zalo.me/g/xyoqhu430" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-lg py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a2.5 2.5 0 00-2.5 2.5V7h5V4.5A2.5 2.5 0 0010 2zM8.5 7V4.5a1.5 1.5 0 011.5-1.5A1.5 1.5 0 0111.5 4.5V7h-3z"/>
              <path d="M3 9.5A1.5 1.5 0 014.5 8h11A1.5 1.5 0 0117 9.5V16a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5zM4.5 9a.5.5 0 00-.5.5V16h12V9.5a.5.5 0 00-.5-.5h-11z"/>
              <path d="M7 11.5a1 1 0 100-2 1 1 0 000 2zM10 10.5a1 1 0 112 0 1 1 0 01-2 0zM13 11.5a1 1 0 100-2 1 1 0 000 2z"/>
            </svg>
            VÀO ĐÂY ĐỂ NHẬN THÊM NHIỀU QUÀ TẶNG AI
          </a>
        </div>

      </main>
    </div>
  );
};

export default App;