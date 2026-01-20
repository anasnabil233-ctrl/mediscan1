
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
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("مفتاح API غير متوفر. يرجى التأكد من إعدادات النظام.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // نستخدم Gemini 3 Pro للتحليل الدقيق، ولكن سنقوم بمعالجة أخطاء الضغط
  const modelId = 'gemini-3-pro-preview';

  const systemInstruction = `أنت خبير استشاري في الأشعة الطبية (Radiologist). 
مهمتك هي تحليل الصور الطبية المرفقة بدقة علمية عالية.
قدم تقريراً طبياً باللغة العربية يشرح الملاحظات والتشخيص المحتمل.
يجب ذكر أن هذا التحليل استرشادي ويجب مراجعته من طبيب مختص.`;

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
      throw new Error("استلم التطبيق استجابة فارغة.");
    }

    return JSON.parse(resultText) as AnalysisResult;

  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // فك تشفير رسائل الخطأ من جوجل لإظهار رسالة نظيفة
    let errorMessage = error.message || "";
    
    // إذا كان الخطأ بصيغة JSON (كما في الصورة)، نحاول استخراج الرسالة الأساسية
    if (errorMessage.startsWith('{') || errorMessage.includes('quota')) {
       if (errorMessage.includes('429') || errorMessage.includes('QUOTA_EXHAUSTED')) {
         throw new Error("عذراً، لقد تجاوزت الحد المسموح به من المحاولات المجانية لهذا اليوم. يرجى الانتظار قليلاً أو المحاولة غداً، أو استخدام مفتاح API مدفوع.");
       }
       if (errorMessage.includes('500') || errorMessage.includes('503')) {
         throw new Error("خادم الذكاء الاصطناعي مشغول حالياً. يرجى المحاولة مرة أخرى بعد ثوانٍ.");
       }
    }

    throw new Error(errorMessage.length > 100 ? "حدث خطأ في الاتصال بخادم التحليل. يرجى التأكد من جودة الصورة والمحاولة لاحقاً." : errorMessage);
  }
};
