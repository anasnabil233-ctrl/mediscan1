
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, AnalysisOptions } from "../types";

export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeMedicalImage = async (base64Image: string, mimeType: string, options?: AnalysisOptions): Promise<AnalysisResult> => {
  // محاولة جلب المفتاح من عدة مصادر محتملة تم حقنها بواسطة Vite
  const apiKey = (process.env.VITE_API_KEY) || (process.env.API_KEY) || (import.meta as any).env?.VITE_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.error("Critical: API_KEY is missing. Check Vercel Environment Variables.");
    throw new Error("مفتاح API غير متوفر. يرجى إضافة VITE_API_KEY في إعدادات Vercel ثم إعادة النشر (Redeploy).");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  // استخدام الموديل المحدد في التوصيات
  const modelId = 'gemini-3-pro-preview';

  const systemInstruction = `أنت خبير استشاري في الأشعة الطبية (Radiologist). 
مهمتك هي تحليل الصور الطبية المرفقة (X-ray, MRI, CT) بدقة علمية عالية.
قدم تقريراً طبياً باللغة العربية يشرح الملاحظات المرئية والتشخيص المحتمل.
يجب أن تكون موضوعياً وتذكر دائماً أن هذا التحليل هو استرشادي مدعوم بالذكاء الاصطناعي ويجب مراجعته من طبيب مختص.`;

  const prompt = `حلل هذه الصورة الطبية بدقة واستخرج النتائج بالتنسيق المطلوب (JSON). تأكد من كتابة كل شيء باللغة العربية.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: options?.temperature ?? 0.4,
        maxOutputTokens: options?.maxOutputTokens || 4096,
        thinkingConfig: { thinkingBudget: 2048 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING },
            confidence: { type: Type.STRING },
            findings: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            summary: { type: Type.STRING },
            severity: { 
              type: Type.STRING, 
              enum: ['Low', 'Moderate', 'High', 'Critical']
            }
          },
          required: ["diagnosis", "confidence", "findings", "recommendations", "summary", "severity"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("استجابة النموذج فارغة.");

    return JSON.parse(text) as AnalysisResult;

  } catch (error: any) {
    console.error("Detailed Gemini Analysis Error:", error);
    
    if (error.message?.includes('403') || error.message?.includes('API key')) {
        throw new Error("خطأ في صلاحية المفتاح (403). تأكد أن المفتاح صحيح ومفعّل في Google AI Studio.");
    }
    
    throw new Error(error.message || "حدث خطأ غير متوقع أثناء تحليل الصورة.");
  }
};
