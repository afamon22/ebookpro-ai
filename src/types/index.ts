export type EbookStyle = 'Professionnel' | 'Créatif' | 'Académique' | 'Décontracté' | 'Storytelling';
export type CoverStyle = 'Minimaliste' | 'Dramatique' | 'Classique' | 'Futuriste';

export interface EbookConfig {
    topic: string;
    author: string;
    language: 'Français' | 'Anglais';
    pageCount: 10 | 20 | 30 | 40 | 50;
    editorialStyle: EbookStyle;
    coverStyle: CoverStyle;
}

export interface EbookStep {
    id: number;
    label: string;
    status: 'todo' | 'current' | 'completed';
}

export interface Chapter {
    title: string;
    content: string;
}

export interface EbookData {
    config: EbookConfig;
    selectedTitle: string;
    chapters: Chapter[];
    seoTags: string[];
    isGenerating: boolean;
    currentStep: number;
}
