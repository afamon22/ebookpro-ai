import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Loader2, 
  Type as TypeIcon, 
  Globe, 
  MessageSquare, 
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, generateId } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { generateTitles, generateOutline, generateChapterContent, generateMarketingAssets, generateCoverImage } from '../services/geminiService';

interface EbookWizardProps {
  onComplete: (id: string) => void;
  initialNiche?: string;
}

export default function EbookWizard({ onComplete, initialNiche = '' }: EbookWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  
  const [config, setConfig] = useState({
    niche: initialNiche,
    title: '',
    subtitle: '',
    author: '',
    pages: 30,
    tone: 'Professionnel',
    language: 'Français',
    coverStyle: 'Business Modern',
  });

  const [suggestedTitles, setSuggestedTitles] = useState<{title: string, subtitle: string}[]>([]);
  const [outline, setOutline] = useState<{title: string, description: string}[]>([]);
  const [error, setError] = useState<string | null>(null);

  const tones = ['Professionnel', 'Pédagogique', 'Storytelling', 'Business', 'Marketing', 'Inspirant'];
  const languages = ['Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien'];
  const coverStyles = ['Business Modern', 'Minimaliste', 'Artistique', 'Storytelling', 'Technologique', 'Épuré'];

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleGenerateTitles = async () => {
    if (!config.niche) return;
    setLoading(true);
    setLoadingText('Génération de titres optimisés...');
    setError(null);
    try {
      const titles = await generateTitles(config.niche, config.language);
      setSuggestedTitles(titles);
      nextStep();
    } catch (err: any) {
      console.error(err);
      setError("Désolé, nous avons atteint notre limite de quota. Veuillez réessayer dans quelques instants.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOutline = async () => {
    setLoading(true);
    setLoadingText('Structuration de votre ebook...');
    setError(null);
    try {
      const res = await generateOutline(config);
      setOutline(res);
      nextStep();
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de la génération du plan. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFullEbook = async () => {
    setLoading(true);
    setError(null);
    const id = generateId();
    const chapters: any[] = [];
    
    try {
      // 1. Generate Chapters one by one
      for (let i = 0; i < outline.length; i++) {
        setLoadingText(`Rédaction du Chapitre ${i + 1}/${outline.length}: ${outline[i].title}...`);
        const content = await generateChapterContent(config, outline[i].title, outline[i].description);
        chapters.push({
          title: outline[i].title,
          content: content
        });
      }

      // 2. Generate Intro & Conclusion
      setLoadingText('Finalisation de l\'introduction et de la conclusion...');
      const intro = await generateChapterContent(config, "Introduction", "Write a captivating introduction for this book.");
      const conclusion = await generateChapterContent(config, "Conclusion", "Write a powerful conclusion and call to action.");

      // 3. Marketing Assets
      setLoadingText('Génération des supports marketing...');
      const marketing = await generateMarketingAssets(config, chapters.map(c => c.title).join(', '));

      // 4. Cover
      setLoadingText('Design de la couverture...');
      const coverUrl = await generateCoverImage(config.title, config.niche, config.coverStyle);

      const ebookData = {
        id,
        ...config,
        content: {
          introduction: intro,
          chapters,
          conclusion,
          outline
        },
        cover_url: coverUrl,
        marketing_desc: marketing.marketingDescription,
        status: 'completed',
        created_at: new Date().toISOString()
      };

      const { error: supabaseError } = await supabase
        .from('ebooks')
        .insert([ebookData]);

      if (supabaseError) throw supabaseError;

      onComplete(id);
    } catch (err: any) {
      console.error(err);
      setError("Une erreur est survenue pendant la rédaction. Le quota a peut-être été dépassé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-12 bg-white">
      <div className="w-full max-w-3xl space-y-12">
        {/* Progress Bar */}
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#1a1a1a]/5 -translate-y-1/2 z-0"></div>
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 font-bold text-sm",
                step >= i ? "bg-[#5A5A40] text-white shadow-lg" : "bg-white border-2 border-[#1a1a1a]/10 text-[#1a1a1a]/30"
              )}
            >
              {step > i ? <Check size={18} /> : i}
            </div>
          ))}
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium text-center"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Niche & Basic Info */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="font-serif text-4xl font-bold">Commençons par le sujet.</h2>
                <p className="text-[#1a1a1a]/50">Quelle thématique souhaitez-vous explorer aujourd'hui ?</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-navy/40">Thématique ou Niche</label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-navy/20 group-focus-within:text-brand-amber transition-colors" size={20} />
                    <input 
                      type="text"
                      placeholder="Ex: Marketing Digital pour PME, Cuisine Keto, etc."
                      value={config.niche}
                      onChange={(e) => setConfig({...config, niche: e.target.value})}
                      className="w-full pl-14 pr-6 py-5 bg-white rounded-[2rem] border border-brand-navy/5 shadow-sm focus:ring-4 focus:ring-brand-amber/10 focus:border-brand-amber transition-all outline-none text-lg font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-navy/40">Langue</label>
                    <div className="relative group">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-navy/20 group-focus-within:text-brand-amber transition-colors" size={20} />
                      <select 
                        value={config.language}
                        onChange={(e) => setConfig({...config, language: e.target.value})}
                        className="w-full pl-14 pr-6 py-5 bg-white rounded-[2rem] border border-brand-navy/5 shadow-sm focus:ring-4 focus:ring-brand-amber/10 focus:border-brand-amber transition-all outline-none appearance-none text-lg font-medium"
                      >
                        {languages.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-navy/40">Nom d'Auteur</label>
                    <div className="relative group">
                      <TypeIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-navy/20 group-focus-within:text-brand-amber transition-colors" size={20} />
                      <input 
                        type="text"
                        placeholder="Votre nom"
                        value={config.author}
                        onChange={(e) => setConfig({...config, author: e.target.value})}
                        className="w-full pl-14 pr-6 py-5 bg-white rounded-[2rem] border border-brand-navy/5 shadow-sm focus:ring-4 focus:ring-brand-amber/10 focus:border-brand-amber transition-all outline-none text-lg font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleGenerateTitles}
                disabled={!config.niche || loading}
                className="w-full py-6 bg-brand-navy text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-2xl shadow-brand-navy/20 hover:scale-[1.02] hover:bg-brand-navy/90 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={22} className="text-brand-amber" />}
                Générer des Idées de Titres
              </button>
            </motion.div>
          )}

          {/* Step 2: Title Selection */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="font-serif text-4xl font-bold">Choisissez votre titre.</h2>
                <p className="text-[#1a1a1a]/50">Sélectionnez le titre qui captivera le plus votre audience.</p>
              </div>

              <div className="space-y-4">
                {suggestedTitles.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setConfig({...config, title: t.title, subtitle: t.subtitle})}
                    className={cn(
                      "w-full text-left p-8 rounded-[2.5rem] border-2 transition-all duration-500",
                      config.title === t.title 
                        ? "bg-brand-navy border-brand-navy text-white shadow-2xl shadow-brand-navy/20 scale-[1.02]" 
                        : "bg-white border-brand-navy/5 hover:border-brand-amber/30 hover:bg-brand-paper/20"
                    )}
                  >
                    <h4 className="font-serif text-2xl font-bold">{t.title}</h4>
                    <p className={cn("text-sm mt-2 font-medium", config.title === t.title ? "text-white/70" : "text-brand-navy/40")}>
                      {t.subtitle}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex gap-6">
                <button onClick={prevStep} className="flex-1 py-5 bg-white border border-brand-navy/10 rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:bg-brand-paper/30 transition-all">
                  <ArrowLeft size={18} /> Retour
                </button>
                <button 
                  onClick={nextStep} 
                  disabled={!config.title}
                  className="flex-[2] py-5 bg-brand-navy text-white rounded-[2rem] font-bold flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  Continuer <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Tone & Length */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="font-serif text-4xl font-bold">Style & Format.</h2>
                <p className="text-[#1a1a1a]/50">Définissez le ton et la longueur de votre ouvrage.</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-6">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-navy/40">Ton Rédactionnel</label>
                  <div className="grid grid-cols-3 gap-4">
                    {tones.map(t => (
                      <button
                        key={t}
                        onClick={() => setConfig({...config, tone: t})}
                        className={cn(
                          "py-4 rounded-2xl text-xs font-bold transition-all duration-300 border-2",
                          config.tone === t 
                            ? "bg-brand-navy border-brand-navy text-white shadow-xl shadow-brand-navy/10" 
                            : "bg-white border-brand-navy/5 text-brand-navy/50 hover:border-brand-amber/30"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-navy/40">Longueur Estimée</label>
                    <span className="text-4xl font-serif font-bold text-brand-amber">{config.pages} <span className="text-lg opacity-50">pages</span></span>
                  </div>
                  <div className="px-2">
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      step="5"
                      value={config.pages}
                      onChange={(e) => setConfig({...config, pages: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-brand-navy/5 rounded-lg appearance-none cursor-pointer accent-brand-amber"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] opacity-30 font-bold px-2">
                    <span>Court</span>
                    <span>Standard</span>
                    <span>Complet</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-navy/40">Style de Couverture</label>
                  <div className="grid grid-cols-3 gap-4">
                    {coverStyles.map(s => (
                      <button
                        key={s}
                        onClick={() => setConfig({...config, coverStyle: s})}
                        className={cn(
                          "py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 border-2",
                          config.coverStyle === s 
                            ? "bg-brand-amber border-brand-amber text-brand-navy shadow-xl shadow-brand-amber/10" 
                            : "bg-white border-brand-navy/5 text-brand-navy/50 hover:border-brand-amber/30"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                <button onClick={prevStep} className="flex-1 py-5 bg-white border border-brand-navy/10 rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:bg-brand-paper/30 transition-all">
                  <ArrowLeft size={18} /> Retour
                </button>
                <button 
                  onClick={handleGenerateOutline} 
                  disabled={loading}
                  className="flex-[2] py-5 bg-brand-navy text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-2xl shadow-brand-navy/20 hover:scale-[1.02] transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Layers size={20} className="text-brand-amber" /> Générer le Plan</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Outline Review */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="font-serif text-4xl font-bold">Plan de l'Ebook.</h2>
                <p className="text-[#1a1a1a]/50">Voici la structure proposée par l'IA. Vous pourrez la modifier plus tard.</p>
              </div>

              <div className="max-h-[450px] overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                {outline.map((ch, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-brand-navy/5 shadow-sm hover:border-brand-amber/30 transition-all duration-500 group">
                    <div className="flex items-start gap-6">
                      <span className="w-10 h-10 rounded-2xl bg-brand-paper flex items-center justify-center text-sm font-bold text-brand-navy shadow-inner group-hover:bg-brand-amber group-hover:text-white transition-all duration-500">
                        {i + 1}
                      </span>
                      <div className="space-y-1">
                        <h4 className="font-serif text-xl font-bold text-brand-navy">{ch.title}</h4>
                        <p className="text-sm text-brand-navy/40 font-medium leading-relaxed">{ch.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-6">
                <button onClick={prevStep} className="flex-1 py-5 bg-white border border-brand-navy/10 rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:bg-brand-paper/30 transition-all">
                  <ArrowLeft size={18} /> Retour
                </button>
                <button 
                  onClick={handleGenerateFullEbook} 
                  disabled={loading}
                  className="flex-[2] py-6 bg-brand-navy text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-2xl shadow-brand-navy/20 hover:scale-[1.02] transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={24} className="text-brand-amber" /> Lancer la Rédaction Complète</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Screen Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-center items-center justify-center">
            <div className="text-center space-y-8 max-w-md p-8">
              <div className="relative w-24 h-24 mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-[#5A5A40]/10 border-t-[#5A5A40] rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="text-[#5A5A40]" size={32} />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold">Magie en cours...</h3>
                <p className="text-[#1a1a1a]/60 font-medium animate-pulse">{loadingText}</p>
                <div className="w-full h-1 bg-[#1a1a1a]/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="h-full bg-[#5A5A40]"
                  />
                </div>
                <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">
                  Cela peut prendre quelques minutes pour un contenu de qualité professionnelle.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BookOpen({ className, size }: { className?: string, size?: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}
