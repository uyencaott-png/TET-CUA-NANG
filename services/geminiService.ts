import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio, GeneratedImage } from "../types";

interface GeneratePortraitsParams {
  prompt: string;
  negativePrompt: string;
  aspectRatio: AspectRatio;
  imageBase64: string;
  mimeType: string;
  numberOfImages: number;
  isFaceLockEnabled: boolean;
  withFlowers: boolean;
}

export const generatePortraits = async (params: GeneratePortraitsParams): Promise<GeneratedImage[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const faceLockInstruction = params.isFaceLockEnabled
    ? `It is absolutely CRITICAL and the HIGHEST PRIORITY to perfectly replicate the facial features, expression, and identity of the person in the provided photo. The face must be an exact match. Do not alter the person's face.`
    : `The absolute top priority is to maintain the exact facial features, hair, and identity of the person from the original photo. Do not change the person in any way.`;

  const flowerInstruction = params.withFlowers
    ? `The woman is elegantly holding, embracing, or positioned near a tasteful bouquet of flowers that complements the scene's aesthetic.`
    : `There are absolutely no flowers in the scene.`;
    
  const compositionInstruction = `The composition should be a beautiful medium close-up shot, focusing on the woman's face and upper body to capture her beauty, expression, and the intricate details of her attire.`;

  // A more instructive prompt for an image editing model
  const instructionPrompt = `Taking the person from the provided image, place them in a new setting described as follows: "${params.prompt}". 
${faceLockInstruction}
${compositionInstruction}
${flowerInstruction}
The final image must be hyper-realistic, with natural lighting, photorealistic textures, and a very high level of detail. It should look like a real, natural photograph, not a digital painting or illustration.
The final image should have an aspect ratio of ${params.aspectRatio}. 
Negative prompt (avoid these elements): ${params.negativePrompt}.`;

  const numberOfImagesToGenerate = params.numberOfImages;

  const generationPromises = Array.from({ length: numberOfImagesToGenerate }, () =>
    ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: params.imageBase64,
              mimeType: params.mimeType,
            },
          },
          {
            text: instructionPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    })
  );

  const results = await Promise.allSettled(generationPromises);

  const generatedImages: GeneratedImage[] = [];
  let firstError: Error | null = null;

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      const response = result.value;
      const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
      if (imagePart && imagePart.inlineData) {
        generatedImages.push({
          id: `gen-${i}-${new Date().getTime()}`,
          url: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
          seed: Math.floor(Math.random() * 1000000).toString(), // Seed is not returned, so generate a random one
        });
      } else {
        console.warn(`Image generation succeeded for iteration ${i + 1} but no image part was found.`);
      }
    } else { // status: 'rejected'
      console.error(`Error during image generation iteration ${i + 1}:`, result.reason);
      if (!firstError) {
        const error = result.reason as Error;
        const message = error.message.toLowerCase();
        if (message.includes('api key not valid')) {
          firstError = new Error("Lỗi xác thực: API key không hợp lệ. Vui lòng kiểm tra lại cấu hình.");
        } else if (message.includes('rate limit')) {
          firstError = new Error("Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi một lát rồi thử lại.");
        } else if (message.includes('safety')) {
            firstError = new Error("Yêu cầu của bạn đã bị chặn vì lý do an toàn. Vui lòng điều chỉnh lại prompt.");
        } else if (message.includes('billing')) {
            firstError = new Error("Đã xảy ra lỗi thanh toán. Vui lòng kiểm tra tài khoản Google Cloud của bạn.");
        }
        else {
          firstError = new Error(`Không thể tạo ảnh ở lần ${i + 1}. Đã có lỗi không xác định từ API.`);
        }
      }
    }
  });
  
  if (generatedImages.length === 0) {
    if (firstError) {
      throw firstError;
    }
    throw new Error("API không trả về ảnh nào. Vui lòng thử lại với một prompt hoặc ảnh khác.");
  }

  return generatedImages;
};