
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
  // محاولة جلب المفتاح بأكثر من طريقة لضمان التوافق مع Vercel
  const apiKey = (process.env.VITE_API_KEY) || (process.env.API_KEY) || (import.meta as any).env?.VITE_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.error("CRITICAL ERROR: API_KEY is missing in the production environment.");
    throw new Error("مفتاح API الخاص بـ Gemini مفقود. يرجى التأكد من إضافة VITE_API_KEY في Vercel Environment Variables ثم عمل Redeploy.");
  }

  // تهيئة العميل في كل مرة لضمان استخدام أحدث مفتاح محقون
  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  
  // استخدام موديل Gemini 3 Pro للمهام الطبية المعقدة
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

    const resultText = response.text;
    if (!resultText) {
      throw new Error("استلم التطبيق استجابة فارغة من خادم الذكاء الاصطناعي.");
    }

    try {
      return JSON.parse(resultText) as AnalysisResult;
    } catch (parseError) {
      console.error("JSON Parse Error:", resultText);
      throw new Error("فشل معالجة البيانات المستلمة. يرجى المحاولة مرة أخرى.");
    }

  } catch (error: any) {
    console.error("Detailed Gemini Analysis Error:", error);
    
    // معالجة الأخطاء الشائعة لإظهار رسائل مفهومة للمستخدم
    if (error.message?.includes('403')) {
        throw new Error("خطأ 403: يبدو أن المفتاح المستخدم لا يملك صلاحية الوصول لهذا الموديل أو أن المنطقة الجغرافية غير مدعومة.");
    }
    if (error.message?.includes('404')) {
        throw new Error("خطأ 404: الموديل المحدد (gemini-3-pro-preview) غير متوفر حالياً لحسابك. يرجى التحقق من لوحة تحكم Google AI Studio.");
    }
    if (error.message?.includes('API key')) {
        throw new Error("خطأ في صلاحية المفتاح. تأكد من صحة VITE_API_KEY في إعدادات Vercel.");
    }
    
    throw new Error(error.message || "حدث خطأ غير متوقع أثناء تحليل الصورة.");
  }
};
