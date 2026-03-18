import React from 'react';
import { Loader2, CheckCircle, Book } from 'lucide-react';
import type { Chapter } from '../types';

interface ContentGenerationProps {
    progress: number;
    currentChapter: number;
    totalChapters: number;
    chapters: Chapter[];
    title: string;
}

export const ContentGeneration: React.FC<ContentGenerationProps> = ({ progress, currentChapter, totalChapters, chapters, title }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-3 pb-2 border-b border-border/50">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Titre de l'ebook en cours de création</p>
                <h1 className="text-2xl md:text-3xl font-extrabold italic font-serif text-white max-w-2xl mx-auto pb-4">
                    "{title}"
                </h1>
            </div>

            <div className="bg-surface border border-border rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Génération en cours...</h2>
                            <p className="text-gray-400">Chapitre {currentChapter} sur {totalChapters}</p>
                        </div>
                        <span className="text-4xl font-black text-blue-500">{progress}%</span>
                    </div>

                    <div className="w-full h-4 bg-background rounded-full overflow-hidden border border-border">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest px-2">Flux de production</h3>
                <div className="grid gap-2">
                    {chapters.map((chapter, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-4 p-4 bg-surface/50 border border-border rounded-xl animate-in slide-in-from-left-4"
                        >
                            <div className="bg-green-500/10 p-2 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-200">{chapter.title}</p>
                                <p className="text-xs text-gray-500">Prêt à l'export</p>
                            </div>
                            <Book className="w-4 h-4 text-gray-600" />
                        </div>
                    ))}

                    {currentChapter < totalChapters && (
                        <div className="flex items-center gap-4 p-4 bg-blue-600/5 border border-blue-500/20 rounded-xl animate-pulse">
                            <div className="p-2">
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            </div>
                            <p className="font-semibold text-blue-400 italic">Génération du chapitre suivant...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
