import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Helper to handle retries for 429 errors
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.message?.includes('429') || error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED'))) {
      console.warn(`Quota exceeded. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export interface EbookConfig {
  niche: string;
  title?: string;
  pages: number;
  tone: string;
  language: string;
  author: string;
}

export interface Chapter {
  title: string;
  content: string;
  subsections?: { title: string; content: string }[];
}

export interface EbookContent {
  title: string;
  subtitle: string;
  outline: { title: string; description: string }[];
  chapters: Chapter[];
  introduction: string;
  conclusion: string;
  marketingDescription: string;
}

const MODEL_NAME = "gemini-1.5-flash";

export const generateTitles = async (niche: string, language: string) => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate 5 professional, high-converting ebook titles and subtitles for the niche: "${niche}". Language: ${language}. Return as JSON array of objects with "title" and "subtitle".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING }
            },
            required: ["title", "subtitle"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  });
};

export const generateOutline = async (config: EbookConfig) => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Create a detailed professional ebook outline for:
      Title: ${config.title}
      Niche: ${config.niche}
      Tone: ${config.tone}
      Language: ${config.language}
      Target Length: ~${config.pages} pages.
      Return a JSON array of chapters, each with a "title" and "description" of what it will cover.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  });
};

export const generateChapterContent = async (config: EbookConfig, chapterTitle: string, chapterDesc: string, previousContext?: string) => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Write a full, professional chapter for an ebook.
      Book Title: ${config.title}
      Chapter Title: ${chapterTitle}
      Context: ${chapterDesc}
      Tone: ${config.tone}
      Language: ${config.language}
      ${previousContext ? `Previous chapters summary: ${previousContext}` : ""}
      Include sub-headings, examples, and deep insights. Format in Markdown.`,
    });
    return response.text;
  });
};

export const generateMarketingAssets = async (config: EbookConfig, fullContentSummary: string) => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a high-converting marketing description and a short summary for this ebook.
      Title: ${config.title}
      Niche: ${config.niche}
      Language: ${config.language}
      Summary of content: ${fullContentSummary}
      Return as JSON with "marketingDescription" and "shortSummary".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marketingDescription: { type: Type.STRING },
            shortSummary: { type: Type.STRING }
          },
          required: ["marketingDescription", "shortSummary"]
        }
      }
    });
    return JSON.parse(response.text);
  });
};

export const generateCoverImage = async (title: string, niche: string, style: string) => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A professional, modern ebook cover background for a book titled "${title}" in the niche "${niche}". Style: ${style}. High quality, cinematic lighting, no text on the image itself, just the background art.`,
          },
        ],
      },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  });
};
