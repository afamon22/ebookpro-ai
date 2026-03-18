import React from 'react';
import { BookOpen, User, Globe, FileText, Palette, Sliders, RotateCcw, Zap } from 'lucide-react';
import type { EbookConfig } from '../types';

interface SidebarProps {
    config: EbookConfig;
    onReset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ config, onReset }) => {
    return (
        <aside className="w-80 bg-[#0d0d0d] border-r border-white/5 flex flex-col p-6 overflow-hidden">
            <div className="flex items-center gap-3 mb-12 group cursor-default">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white">Ebook <span className="text-blue-500">Pro</span></h1>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Powered by AI</p>
                </div>
            </div>

            <nav className="flex-1 space-y-10">
                <div className="animate-in slide-in-from-left duration-700">
                    <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Sliders className="w-3 h-3" /> État de la configuration
                    </h2>
                    <div className="space-y-6">
                        <SidebarItem icon={<Globe className="w-4 h-4" />} label="Langue d'édition" value={config.language} />
                        <SidebarItem icon={<FileText className="w-4 h-4" />} label="Volume cible" value={`${config.pageCount} pages`} />
                        <SidebarItem icon={<Palette className="w-4 h-4" />} label="Style éditorial" value={config.editorialStyle} />
                        <SidebarItem icon={<User className="w-4 h-4" />} label="Auteur" value={config.author || "Non spécifié"} />
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white py-3.5 rounded-xl transition-all border border-white/5 group shadow-sm active:scale-95"
                    >
                        <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
                        <span className="text-sm font-semibold">Nouveau projet</span>
                    </button>
                </div>
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/10 mb-6">
                    <div className="flex items-center gap-3 mb-1">
                        <Zap className="w-4 h-4 text-blue-500 fill-blue-500" />
                        <span className="text-xs font-bold text-gray-300">Moteur Gemini v1.5</span>
                    </div>
                    <p className="text-[10px] text-gray-500">Optimisé pour une rédaction fluide et structurée.</p>
                </div>
                <div className="flex items-center gap-2.5 px-2">
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-ping absolute inset-0"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500 relative"></div>
                    </div>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">Statut : Opérationnel</span>
                </div>
            </div>
        </aside>
    );
};

const SidebarItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex flex-col gap-1.5 group">
        <div className="flex items-center gap-2 text-gray-500 text-[11px] font-medium uppercase tracking-wider group-hover:text-gray-400 transition-colors">
            {icon}
            <span>{label}</span>
        </div>
        <div className="font-bold text-gray-200 pl-6 text-sm group-hover:text-blue-400 transition-colors truncate leading-tight">{value}</div>
    </div>
);
