import { GoogleGenerativeAI } from "@google/generative-ai";

const rawKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const API_KEY = rawKey.trim();

if (!API_KEY || API_KEY === "undefined") {
    console.error("CRITICAL: VITE_GEMINI_API_KEY is missing or invalid in environment variables.");
} else {
    console.log("Gemini API initialized. Key length:", API_KEY.length);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = "gemini-flash-latest"; // Utilisation de l'alias stable pour éviter les erreurs 404

async function retry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        console.error("Gemini API Error:", error);

        const status = error?.status || error?.response?.status;
        const message = error?.message || "";

        if (status === 403 || message.includes("403")) {
            throw new Error("Clé API Invalide ou accès refusé (403).");
        }
        if (status === 404 || message.includes("404")) {
            throw new Error("Modèle introuvable (404).");
        }

        if (retries <= 0) throw error;

        console.warn(`Retry... (${2 - retries + 1}/2)`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return retry(fn, retries - 1);
    }
}

export const geminiService = {
    async generateTitles(topic: string, language: string, style: string) {
        console.log("Appel Gemini avec le modèle :", MODEL_NAME);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `Génère 5 propositions de titres accrocheurs pour un ebook sur le thème : "${topic}".
    Langue : ${language}
    Style : ${style}
    Réponds uniquement avec une liste numérotée de 5 titres, sans texte d'introduction ni de conclusion.`;

        return retry(async () => {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return text.split('\n')
                .filter(t => t.trim().length > 0)
                .map(t => t.replace(/^\d+\.\s*/, '').trim())
                .slice(0, 5);
        });
    },

    async generateOutline(title: string, topic: string, pageCount: number, language: string) {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `Crée un plan détaillé pour un ebook de ${pageCount} pages intitulé "${title}" sur le thème "${topic}".
    L'ebook doit comporter une Introduction, environ ${Math.ceil(pageCount / 5)} chapitres et une Conclusion.
    Langue : ${language}
    Réponds uniquement au format JSON avec la structure suivante :
    { "chapters": ["Titre Chapitre 1", "Titre Chapitre 2", ...] }`;

        return retry(async () => {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const cleanJson = text.replace(/```json|```/g, '').trim();
            const data = JSON.parse(cleanJson);
            return data.chapters || data;
        });
    },

    async generateChapterContent(chapterTitle: string, ebookTitle: string, topic: string, editorialStyle: string, language: string) {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `Rédige le contenu complet, expert et approfondi pour le chapitre intitulé "${chapterTitle}" de l'ebook intitulé "${ebookTitle}" (Thème : ${topic}).
    
    STYLE ÉDITORIAL : ${editorialStyle} (Ton professionnel, engageant et de haute valeur perçue).
    LANGUE : ${language}
    
    DIRECTIVES DE RÉDACTION :
    - Développe chaque point avec précision et expertise.
    - Utilise des sous-titres (H2, H3) pour organiser la pensée.
    - Crée des paragraphes bien structurés.
    - Utilise des listes à puces (UL/LI) pour les conseils pratiques ou étapes.
    - Souligne les points clés en gras (STRONG).
    - L'objectif est une qualité "publication Amazon Kindle / Commerciale".
    
    STRUCTURE HTML :
    - Utilise uniquement : <h2>, <h3>, <p>, <strong>, <ul>, <li>.
    - Ne mets pas de balises <html>, <body>, <head> ou de styles CSS en ligne.`;

        return retry(async () => {
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 8192 }
            });
            return result.response.text();
        });
    }
};
