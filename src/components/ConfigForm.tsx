import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import type { EbookConfig, EbookStyle } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface ConfigFormProps {
    onSubmit: (config: EbookConfig) => void;
    isGenerating: boolean;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ onSubmit, isGenerating }) => {
    const [formData, setFormData] = useState<EbookConfig>({
        topic: '',
        author: '',
        language: 'Français',
        pageCount: 10,
        editorialStyle: 'Professionnel',
        coverStyle: 'Minimaliste',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.topic || !formData.author) {
            toast.error("Veuillez remplir la thématique et le nom de l'auteur.");
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <label className="block">
                        <span className="text-gray-400 text-sm font-medium">Thématique de l'ebook</span>
                        <input
                            type="text"
                            className="mt-1 block w-full bg-surface border border-border rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                            placeholder="Ex: Le guide ultime de la photo de nuit"
                            value={formData.topic}
                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            required
                        />
                    </label>

                    <label className="block">
                        <span className="text-gray-400 text-sm font-medium">Nom de l'auteur (Signature)</span>
                        <input
                            type="text"
                            className="mt-1 block w-full bg-surface border border-border rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Votre nom"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            required
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <label className="block">
                            <span className="text-gray-400 text-sm font-medium">Langue</span>
                            <select
                                className="mt-1 block w-full bg-[#111] border border-white/10 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none cursor-pointer hover:bg-black transition-all"
                                value={formData.language}
                                onChange={(e) => setFormData({ ...formData, language: e.target.value as EbookConfig['language'] })}
                            >
                                <option value="Français">Français</option>
                                <option value="Anglais">Anglais</option>
                            </select>
                        </label>

                        <label className="block">
                            <span className="text-gray-400 text-sm font-medium">Volume cible</span>
                            <select
                                className="mt-1 block w-full bg-[#111] border border-white/10 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none cursor-pointer hover:bg-black transition-all"
                                value={formData.pageCount}
                                onChange={(e) => setFormData({ ...formData, pageCount: parseInt(e.target.value) as EbookConfig['pageCount'] })}
                            >
                                <option value={10}>10 pages</option>
                                <option value={20}>20 pages</option>
                                <option value={30}>30 pages</option>
                                <option value={40}>40 pages</option>
                                <option value={50}>50 pages</option>
                            </select>
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4 block">Style Éditorial</span>
                        <div className="grid grid-cols-1 gap-2.5">
                            {(['Professionnel', 'Créatif', 'Académique', 'Décontracté', 'Storytelling'] as EbookStyle[]).map((style) => (
                                <StyleOption
                                    key={style}
                                    label={style}
                                    selected={formData.editorialStyle === style}
                                    onClick={() => setFormData({ ...formData, editorialStyle: style })}
                                />
                            ))}
                        </div>
                    </label>
                </div>
            </div>

            <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-2xl shadow-blue-900/40 text-lg"
            >
                <Sparkles className="w-5 h-5 text-blue-300" />
                Lancer la génération du contenu
                <ArrowRight className="w-5 h-5" />
            </button>
        </form>
    );
};

const StyleOption = ({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-3.5 rounded-xl border text-sm font-bold transition-all ${selected
            ? "bg-blue-600/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
            : "bg-surface border-border text-gray-400 hover:border-gray-500"
            }`}
    >
        {label}
    </button>
);
