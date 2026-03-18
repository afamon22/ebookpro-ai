import React from 'react';
import type { EbookConfig } from '../types';
import { clsx } from 'clsx';

interface CoverPreviewProps {
    config: EbookConfig;
    title: string;
    className?: string;
}

export const CoverPreview: React.FC<CoverPreviewProps> = ({ config, title, className }) => {
    const getStyleClass = () => {
        switch (config.coverStyle) {
            case 'Minimaliste': return 'cover-minimalist';
            case 'Dramatique': return 'cover-dramatic';
            case 'Classique': return 'cover-classic';
            case 'Futuriste': return 'cover-futuristic';
            default: return 'cover-minimalist';
        }
    };

    return (
        <div className={clsx(
            "relative aspect-[5/7] w-full max-w-sm mx-auto flex flex-col p-10 text-center transition-all duration-700",
            getStyleClass(),
            className
        )}>
            {/* Minimalist Top Bar */}
            {config.coverStyle === 'Minimaliste' && (
                <div className="absolute top-12 left-1/2 -translate-x-1/2">
                    <div className="accent-line" />
                </div>
            )}

            <div className="flex-1 flex flex-col items-center justify-center gap-0 z-10">
                {config.coverStyle === 'Classique' && <div className="gold-line" />}

                <h1
                    className={clsx(
                        "font-black tracking-tight leading-[1.1] max-w-[85%] mx-auto",
                        config.coverStyle === 'Dramatique' ? "text-white uppercase italic" : "",
                        config.coverStyle === 'Classique' ? "font-serif" : "",
                        config.coverStyle === 'Futuriste' ? "uppercase tracking-[0.2em] animate-pulse" : ""
                    )}
                    style={{ fontSize: 'clamp(1.2rem, 4vw, 2.5rem)' }}
                >
                    {title || "Votre Titre Ici"}
                </h1>

                {config.coverStyle === 'Classique' && <div className="gold-line" />}

                {config.coverStyle === 'Classique' && (
                    <div className="ornament">✦</div>
                )}

                {config.coverStyle === 'Dramatique' && (
                    <div className="h-2 w-16 bg-red-600 rounded-full shadow-[0_0_15px_rgba(225,29,72,0.5)] mt-6" />
                )}
            </div>

            <div className="mt-auto pt-8 z-10">
                <p className={clsx(
                    "text-xs font-bold tracking-[0.3em]",
                    config.coverStyle === 'Classique' ? "author-name" : "uppercase opacity-60"
                )}>
                    {config.author || "Nom de l'Auteur"}
                </p>
            </div>
        </div>
    );
};
