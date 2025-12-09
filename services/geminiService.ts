import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, AnalysisOptions } from "../types";

// Access API key directly from process.env as per guidelines.
// Vite replaces this with the actual string during build.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to convert File to Base64
 */
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeMedicalImage = async (base64Image: string, mimeType: string, options?: AnalysisOptions): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("مفتاح API غير موجود. يرجى التأكد من إعدادات التطبيق.");
  }

  const modelId = "gemini-2.5-flash"; // Capable of multimodal analysis

  const systemInstruction = `
    أنت خبير في الأشعة الطبية (Radiologist) والذكاء الاصطناعي الطبي. 
    مهمتك هي تحليل الصور الطبية (X-ray, MRI, CT scan) وتقديم تقرير مفصل.
    يجب أن يكون الإخراج باللغة العربية.
    كن دقيقًا، ولكن دائمًا أضف إخلاء مسؤولية بأن هذا تحليل ذكاء اصطناعي ولا يحل محل الطبيب.
  `;

  const prompt = `
    قم بتحليل هذه الصورة الطبية بدقة.
    حدد أي تشوهات، كسور، أورام، أو علامات مرضية.
    
    قم بتقديم النتائج في بنية JSON التالية:
    - diagnosis: التشخيص المحتمل (اسم المرض أو الحالة).
    - confidence: نسبة الثقة في التحليل (مثال: "عالية"، "متوسطة").
    - findings: قائمة بالنقاط والملاحظات التي تم العثور عليها في الصورة.
    - recommendations: خطوات تالية مقترحة (مثال: "مراجعة طبيب عظام"، "صورة رنين مغناطيسي").
    - summary: ملخص للحالة في فقرة قصيرة.
    - severity: مستوى الخطورة (Low, Moderate, High, Critical).
  `;

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
        temperature: options?.temperature ?? 0.5, // Default to 0.5 if not provided
        maxOutputTokens: options?.maxOutputTokens,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING, description: "The potential diagnosis in Arabic" },
            confidence: { type: Type.STRING, description: "Confidence level: High, Medium, Low in Arabic" },
            findings: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of visual findings in Arabic"
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of medical recommendations in Arabic"
            },
            summary: { type: Type.STRING, description: "A brief summary of the analysis in Arabic" },
            severity: { 
              type: Type.STRING, 
              enum: ['Low', 'Moderate', 'High', 'Critical'],
              description: "Severity level of the condition"
            }
          },
          required: ["diagnosis", "confidence", "findings", "recommendations", "summary", "severity"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini.");
    }

    const result = JSON.parse(response.text) as AnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("فشل في تحليل الصورة. يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.");
  }
};