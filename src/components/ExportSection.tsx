import React from 'react';
import type { EbookData } from '../types';
import { Download, Maximize2 } from 'lucide-react';

interface ExportSectionProps {
    data: EbookData;
}

export const ExportSection: React.FC<ExportSectionProps> = ({ data }) => {
    const cleanChapterTitle = (title: string) => {
        // Remove "Chapitre X", "Chapter X", "Chapitre X :", etc.
        let cleaned = title.replace(/^(Chapitre|Chapter)\s*\d+\s*[:\-]?\s*/i, '').trim();
        return cleaned;
    };

    const getFullHtml = () => {
        let contentHtml = '';

        // Table of contents
        contentHtml += `
            <div class="page-break" style="background: white; font-family: 'Merriweather', serif; color: #1a1a1a;">
                <h1 style="text-align: center; margin-bottom: 60px; font-size: 22pt; font-family: 'Playfair Display', serif; font-weight: 700; color: #1a1a1a; border-bottom: 0.5pt solid #eee; padding-bottom: 20px;">Sommaire</h1>
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    ${data.chapters.map((ch, idx) => `
                        <div style="display: flex; align-items: flex-end; font-size: 11pt; font-family: 'Merriweather', serif; position: relative;">
                            <span style="font-weight: 400; line-height: 1.4; color: #1a1a1a; max-width: 85%;">${cleanChapterTitle(ch.title)}</span>
                                <div style="flex: 1; border-bottom: 1px dotted #ccc; margin: 0 8px 5px 8px; min-width: 20px;"></div>
                            <span style="font-weight: 700; min-width: 25px; text-align: right; color: #1a1a1a;">${idx + 1}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Chapters
        data.chapters.forEach((chapter, index) => {
            // Nettoyage : Supprimer le premier titre (H1 ou H2) s'il existe au début du contenu
            const cleanedContent = chapter.content.replace(/<h[12][^>]*>.*?<\/h[12]>/i, '');

            contentHtml += `
                <div class="page-break chapter-page" style="background: white; color: #1a1a1a; position: relative; display: flex; flex-direction: column;">
                    <div style="flex: 1; padding-bottom: 20px;">
                        <div class="chapter-header" style="margin-bottom: 45px; text-align: center;">
                            <div style="text-transform: uppercase; letter-spacing: 3px; font-size: 9pt; color: #888888; margin-bottom: 10px; font-family: 'Inter', sans-serif; font-weight: 400;">Chapitre ${index + 1}</div>
                            <h2 style="font-family: 'Playfair Display', serif; font-size: 22pt; font-weight: 700; margin: 0; color: #1a1a1a; line-height: 1.2;">${cleanChapterTitle(chapter.title)}</h2>
                        </div>
                        <div class="chapter-content" style="font-size: 10.5pt; text-align: justify; line-height: 1.75; font-family: 'Merriweather', serif; color: #333;">
                            ${cleanedContent.replace(/<p>/g, '<p style="margin-bottom: 1.5em; text-align: justify;">')
                    .replace(/<li>/g, '<li style="line-height: 1.6; margin-bottom: 0.8em; font-size: 10.5pt;">')
                    .replace(/<h2>/g, '<h2 style="font-size: 15pt; font-weight: 600; font-family: \'Playfair Display\', serif; margin-top: 30px; margin-bottom: 15px; color: #1a1a1a;">')
                    .replace(/<h3>/g, '<h3 style="font-size: 12pt; font-weight: 700; font-family: \'Merriweather\', serif; margin-top: 25px; margin-bottom: 10px; color: #222;">')}
                        </div>
                    </div>
                </div>
            `;
        });

        return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.selectedTitle}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&family=Playfair+Display:wght@600;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
          <style>
            @page { 
              size: A5;
              margin-top: 20mm;
              margin-bottom: 20mm;
              margin-left: 18mm;
              margin-right: 18mm;
            }
            head { display: none; }
            body { 
              margin: 0; 
              padding: 0; 
              background: white; 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .page-break { 
              page-break-after: always;
              position: relative;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .page-break { page-break-after: always; }
            }
            h2, h3 { page-break-after: avoid; }
          </style>
        </head>
        <body style="margin:0;padding:0;">
          ${contentHtml}
          <script>
            window.onload = () => { setTimeout(() => { window.print(); }, 1500); };
          </script>
        </body>
      </html>
    `;
    };

    const handleExport = () => {
        const htmlContent = getFullHtml();
        const win = window.open('', '_blank');
        if (win) {
            win.document.open();
            win.document.write(htmlContent);
            win.document.close();
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 py-12">
            <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold uppercase tracking-wider">
                    Génération terminée
                </div>
                <h2 className="text-5xl font-extrabold tracking-tight italic font-serif">Format Amazon KDP Validé.</h2>
                <p className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto">
                    Votre ebook a été mis en conformité avec les standards de l'édition professionnelle (A5, Serif, Justifié).
                </p>

                <div className="flex justify-center pt-8">
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-12 rounded-2xl shadow-2xl shadow-blue-900/40 transition-all text-xl hover:scale-105 active:scale-95"
                    >
                        <Download className="w-6 h-6" />
                        Exporter au Format Standard (PDF)
                    </button>
                </div>

                <div className="max-w-lg mx-auto bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 flex gap-4 text-left text-blue-200/70 mt-8">
                    <Maximize2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <p>
                        <span className="font-bold text-blue-400 block mb-1 underline underline-offset-4">💡 Conformité Éditoriale :</span>
                        Le rendu PDF respecte les marges de 18-20mm et la police <strong>Merriweather</strong> en 11pt pour un confort de lecture optimal.
                    </p>
                </div>
            </div>
        </div>
    );
};
