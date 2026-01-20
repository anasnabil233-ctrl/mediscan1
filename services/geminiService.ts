
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

/**
 * دالة التحليل الرئيسية مع ميزة المحاولة الاحتياطية
 */
export const analyzeMedicalImage = async (base64Image: string, mimeType: string, options?: AnalysisOptions): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("مفتاح API غير متوفر. يرجى ضبط المفتاح في إعدادات البيئة.");
  }

  // المحاولة الأولى باستخدام الموديل الاحترافي
  try {
    return await executeGeminiRequest('gemini-3-pro-preview', base64Image, mimeType, options);
  } catch (error: any) {
    const errorMsg = error.message || "";
    
    // إذا كان الخطأ هو تجاوز الحصة (429)، نحاول فوراً باستخدام موديل Flash الأسرع والأكثر سماحية
    if (errorMsg.includes('429') || errorMsg.includes('QUOTA_EXHAUSTED') || errorMsg.includes('quota')) {
      console.warn("Pro model quota exceeded, falling back to Flash model...");
      try {
        return await executeGeminiRequest('gemini-3-flash-preview', base64Image, mimeType, options);
      } catch (fallbackError: any) {
        throw new Error("عذراً، جميع محاولات الاتصال بالذكاء الاصطناعي مستنفذة حالياً. يرجى المحاولة غداً أو استخدام مفتاح مدفوع.");
      }
    }
    
    // إعادة رمي الخطأ إذا كان شيئاً آخر غير الحصة
    throw error;
  }
};

/**
 * دالة تنفيذ الطلب الفعلي لـ Gemini
 */
async function executeGeminiRequest(modelId: string, base64Image: string, mimeType: string, options?: AnalysisOptions): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemInstruction = `أنت خبير استشاري في الأشعة الطبية (Radiologist). 
مهمتك هي تحليل الصور الطبية المرفقة بدقة علمية عالية.
قدم تقريراً طبياً باللغة العربية يشرح الملاحظات والتشخيص المحتمل.
يجب ذكر أن هذا التحليل استرشادي ويجب مراجعته من طبيب مختص.`;

  const prompt = `حلل هذه الصورة الطبية بدقة واستخرج النتائج بالتنسيق المطلوب (JSON). تأكد من كتابة كل شيء باللغة العربية.`;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      temperature: options?.temperature ?? 0.4,
      maxOutputTokens: options?.maxOutputTokens || 4096,
      thinkingConfig: modelId.includes('pro') ? { thinkingBudget: 2048 } : undefined,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diagnosis: { type: Type.STRING },
          confidence: { type: Type.STRING },
          findings: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ['Low', 'Moderate', 'High', 'Critical'] }
        },
        required: ["diagnosis", "confidence", "findings", "recommendations", "summary", "severity"]
      }
    }
  });

  const resultText = response.text;
  if (!resultText) throw new Error("استجابة فارغة من الموديل.");
  
  return JSON.parse(resultText) as AnalysisResult;
}
