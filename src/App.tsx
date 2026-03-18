import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Stepper } from './components/Stepper';
import { ConfigForm } from './components/ConfigForm';
import { TitleSelection } from './components/TitleSelection';
import { ContentGeneration } from './components/ContentGeneration';
import { ExportSection } from './components/ExportSection';
import { toast, Toaster } from 'react-hot-toast';
import type { EbookConfig, EbookData, Chapter } from './types';
import { geminiService } from './services/gemini';
import { Loader2 } from 'lucide-react';

const initialConfig: EbookConfig = {
  topic: '',
  author: '',
  language: 'Français',
  pageCount: 10,
  editorialStyle: 'Professionnel',
  coverStyle: 'Minimaliste',
};

function App() {
  const [data, setData] = useState<EbookData>({
    config: initialConfig,
    selectedTitle: '',
    chapters: [],
    isGenerating: false,
    currentStep: 1,
  });

  const [titles, setTitles] = useState<string[]>([]);
  const [outline, setOutline] = useState<string[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleConfigSubmit = async (config: EbookConfig) => {
    setData(prev => ({ ...prev, config, isGenerating: true }));
    try {
      const generatedTitles = await geminiService.generateTitles(config.topic, config.language, config.editorialStyle);
      setTitles(generatedTitles);
      setData(prev => ({ ...prev, currentStep: 2, isGenerating: false }));
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la génération des titres.");
      setData(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleTitleSelect = async (title: string) => {
    setData(prev => ({ ...prev, selectedTitle: title, isGenerating: true }));
    try {
      const chaptersList = await geminiService.generateOutline(title, data.config.topic, data.config.pageCount, data.config.language);
      setOutline(chaptersList);
      setData(prev => ({ ...prev, currentStep: 3, isGenerating: false }));

      // Start content generation automatically
      generateFullContent(title, chaptersList);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la génération du plan.");
      setData(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const generateFullContent = async (title: string, chaptersList: string[]) => {
    setData(prev => ({ ...prev, isGenerating: true, chapters: [] }));
    const generatedChapters: Chapter[] = [];

    for (let i = 0; i < chaptersList.length; i++) {
      setGenerationProgress(Math.round(((i + 1) / chaptersList.length) * 100));
      try {
        const content = await geminiService.generateChapterContent(
          chaptersList[i],
          title,
          data.config.topic,
          data.config.editorialStyle,
          data.config.language
        );
        generatedChapters.push({ title: chaptersList[i], content });
        setData(prev => ({ ...prev, chapters: [...generatedChapters] }));
      } catch (error) {
        console.error(`Error generating chapter ${i + 1}:`, error);
        toast.error(`Erreur au chapitre ${i + 1}. Le processus s'arrête.`);
        setData(prev => ({ ...prev, isGenerating: false }));
        return;
      }
    }

    setData(prev => ({ ...prev, currentStep: 4, isGenerating: false }));
    toast.success("Ebook généré avec succès !");
    setGenerationProgress(100);
  };

  const resetProject = () => {
    setData({
      config: initialConfig,
      selectedTitle: '',
      chapters: [],
      isGenerating: false,
      currentStep: 1,
    });
    setTitles([]);
    setOutline([]);
    setGenerationProgress(0);
  };

  return (
    <div className="flex h-screen bg-background text-white overflow-hidden">
      <Sidebar
        config={data.config}
        onReset={resetProject}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="p-8 border-b border-border bg-surface/50 backdrop-blur-md z-10">
          <Stepper currentStep={data.currentStep} />
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex justify-center">
          <div className="max-w-4xl w-full">
            {data.currentStep === 1 && (
              <ConfigForm
                onSubmit={handleConfigSubmit}
                isGenerating={data.isGenerating}
              />
            )}

            {data.currentStep === 2 && (
              <TitleSelection
                titles={titles}
                onSelect={handleTitleSelect}
                isGenerating={data.isGenerating}
              />
            )}

            {data.currentStep === 3 && (
              <ContentGeneration
                progress={generationProgress}
                currentChapter={data.chapters.length}
                totalChapters={outline.length}
                chapters={data.chapters}
              />
            )}

            {data.currentStep === 4 && (
              <ExportSection
                data={data}
              />
            )}
          </div>
        </div>

        {data.isGenerating && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-xl font-medium tracking-wide">
              {data.currentStep === 3 ? `Génération du contenu... ${generationProgress}%` : "Analyse par Gemini..."}
            </p>
          </div>
        )}
      </main>
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333',
        },
      }} />
    </div>
  );
}

export default App;
