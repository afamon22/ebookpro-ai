import React from 'react';
import { CheckCircle2, RotateCw } from 'lucide-react';

interface TitleSelectionProps {
    titles: string[];
    onSelect: (title: string) => void;
    isGenerating: boolean;
}

export const TitleSelection: React.FC<TitleSelectionProps> = ({ titles, onSelect, isGenerating }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Choisissez un titre percutant</h2>
                <p className="text-gray-400">Gemini a analysé votre thématique et vous propose ces 5 options.</p>
            </div>

            <div className="grid gap-4">
                {titles.map((title, idx) => (
                    <button
                        key={idx}
                        disabled={isGenerating}
                        onClick={() => onSelect(title)}
                        className="group flex items-center justify-between p-6 bg-surface border border-border rounded-2xl hover:border-blue-500 hover:bg-blue-600/5 transition-all text-left"
                    >
                        <span className="text-lg font-semibold pr-8">{title}</span>
                        <CheckCircle2 className="w-6 h-6 text-gray-700 group-hover:text-blue-500 transition-colors" />
                    </button>
                ))}

                {titles.length === 0 && !isGenerating && (
                    <div className="p-12 text-center text-gray-500 bg-surface rounded-2xl border border-dashed border-border">
                        Aucun titre généré. Réessayez.
                    </div>
                )}
            </div>

            <div className="flex justify-center">
                <button
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    onClick={() => window.location.reload()} // Simplified reset for titles
                >
                    <RotateCw className="w-4 h-4" />
                    Pas convaincu ? Recommencer
                </button>
            </div>
        </div>
    );
};
