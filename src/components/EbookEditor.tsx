import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Eye, 
  Edit3, 
  Layout, 
  FileText,
  CheckCircle2,
  Loader2,
  Share2,
  Trash2,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import htmlToDocx from 'html-to-docx';

interface Chapter {
  title: string;
  content: string;
}

interface Ebook {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  niche: string;
  tone: string;
  language: string;
  content: {
    introduction: string;
    chapters: Chapter[];
    conclusion: string;
  };
  cover_url: string;
  marketing_desc: string;
  status: string;
}

export default function EbookEditor({ ebookId, onBack }: { ebookId: string, onBack: () => void }) {
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'cover' | 'marketing'>('content');
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(-1); // -1 for intro, -2 for conclusion

  useEffect(() => {
    const fetchEbook = async () => {
      try {
        const { data, error } = await supabase
          .from('ebooks')
          .select('*')
          .eq('id', ebookId)
          .single();

        if (error) throw error;
        
        setEbook({
          ...data,
          content: typeof data.content === 'string' ? JSON.parse(data.content) : data.content
        });
      } catch (err) {
        console.error('Error fetching ebook:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEbook();
  }, [ebookId]);

  const handleSave = async () => {
    if (!ebook) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ebooks')
        .upsert([ebook]);

      if (error) throw error;
      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error(error);
      setSaving(false);
    }
  };

  const updateContent = (newContent: string) => {
    if (!ebook) return;
    const newEbook = { ...ebook };
    if (selectedChapterIndex === -1) {
      newEbook.content.introduction = newContent;
    } else if (selectedChapterIndex === -2) {
      newEbook.content.conclusion = newContent;
    } else {
      newEbook.content.chapters[selectedChapterIndex].content = newContent;
    }
    setEbook(newEbook);
  };

  const exportPDF = () => {
    if (!ebook) return;
    const doc = new jsPDF();
    let y = 20;

    // Title Page
    doc.setFontSize(30);
    doc.text(ebook.title, 20, 60);
    doc.setFontSize(16);
    doc.text(ebook.subtitle, 20, 75);
    doc.text(`Par ${ebook.author}`, 20, 100);
    doc.addPage();

    // Intro
    doc.setFontSize(20);
    doc.text("Introduction", 20, 20);
    doc.setFontSize(12);
    const splitIntro = doc.splitTextToSize(ebook.content.introduction.replace(/[#*]/g, ''), 170);
    doc.text(splitIntro, 20, 35);
    doc.addPage();

    // Chapters
    ebook.content.chapters.forEach((ch) => {
      doc.setFontSize(20);
      doc.text(ch.title, 20, 20);
      doc.setFontSize(12);
      const splitContent = doc.splitTextToSize(ch.content.replace(/[#*]/g, ''), 170);
      doc.text(splitContent, 20, 35);
      doc.addPage();
    });

    // Conclusion
    doc.setFontSize(20);
    doc.text("Conclusion", 20, 20);
    doc.setFontSize(12);
    const splitConclusion = doc.splitTextToSize(ebook.content.conclusion.replace(/[#*]/g, ''), 170);
    doc.text(splitConclusion, 20, 35);

    doc.save(`${ebook.title}.pdf`);
  };

  if (loading || !ebook) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-[#5A5A40]" size={48} />
      </div>
    );
  }

  const currentText = selectedChapterIndex === -1 
    ? ebook.content.introduction 
    : selectedChapterIndex === -2 
      ? ebook.content.conclusion 
      : ebook.content.chapters[selectedChapterIndex]?.content;

  return (
    <div className="h-full flex flex-col bg-[#F5F5F0]">
      {/* Top Bar */}
      <header className="bg-white border-b border-[#1a1a1a]/5 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-[#F5F5F0] rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-lg leading-tight">{ebook.title}</h2>
            <p className="text-xs opacity-50 font-medium uppercase tracking-widest">{ebook.status} • {ebook.language}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F0] rounded-xl text-sm font-bold hover:bg-[#1a1a1a]/5 transition-all"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <div className="h-6 w-px bg-[#1a1a1a]/10 mx-2"></div>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-6 py-2 bg-[#5A5A40] text-white rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-all"
          >
            <Download size={16} />
            Exporter PDF
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-[#1a1a1a]/5 px-8 flex gap-8">
        {[
          { id: 'content', label: 'Contenu Editorial', icon: FileText },
          { id: 'cover', label: 'Couverture', icon: Layout },
          { id: 'marketing', label: 'Marketing', icon: Share2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "py-4 flex items-center gap-2 text-sm font-bold border-b-2 transition-all",
              activeTab === tab.id ? "border-[#5A5A40] text-[#5A5A40]" : "border-transparent text-[#1a1a1a]/40 hover:text-[#1a1a1a]"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 overflow-hidden flex">
        <AnimatePresence mode="wait">
          {activeTab === 'content' && (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex overflow-hidden"
            >
              {/* Sidebar: Chapters List */}
              <div className="w-80 bg-white border-r border-[#1a1a1a]/5 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Structure</label>
                  <button 
                    onClick={() => setSelectedChapterIndex(-1)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl text-sm font-medium transition-all",
                      selectedChapterIndex === -1 ? "bg-[#5A5A40] text-white shadow-md" : "hover:bg-[#F5F5F0]"
                    )}
                  >
                    Introduction
                  </button>
                  {ebook.content.chapters.map((ch, i) => (
                    <button 
                      key={i}
                      onClick={() => setSelectedChapterIndex(i)}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl text-sm font-medium transition-all flex items-start gap-3",
                        selectedChapterIndex === i ? "bg-[#5A5A40] text-white shadow-md" : "hover:bg-[#F5F5F0]"
                      )}
                    >
                      <span className="opacity-40 font-mono text-[10px] mt-1">{String(i+1).padStart(2, '0')}</span>
                      <span className="flex-1">{ch.title}</span>
                    </button>
                  ))}
                  <button 
                    onClick={() => setSelectedChapterIndex(-2)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl text-sm font-medium transition-all",
                      selectedChapterIndex === -2 ? "bg-[#5A5A40] text-white shadow-md" : "hover:bg-[#F5F5F0]"
                    )}
                  >
                    Conclusion
                  </button>
                </div>
              </div>

              {/* Editor Pane */}
              <div className="flex-1 flex flex-col bg-white">
                {selectedChapterIndex !== null ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-12 py-8 border-b border-[#1a1a1a]/5 flex items-center justify-between">
                      <h3 className="font-serif text-3xl font-bold">
                        {selectedChapterIndex === -1 ? "Introduction" : selectedChapterIndex === -2 ? "Conclusion" : ebook.content.chapters[selectedChapterIndex].title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
                        <Edit3 size={12} /> Mode Édition
                      </div>
                    </div>
                    <div className="flex-1 flex overflow-hidden">
                      {/* Textarea Editor */}
                      <textarea 
                        value={currentText}
                        onChange={(e) => updateContent(e.target.value)}
                        className="flex-1 p-12 outline-none resize-none font-sans text-lg leading-relaxed text-[#1a1a1a]/80 custom-scrollbar"
                        placeholder="Commencez à écrire..."
                      />
                      {/* Live Preview */}
                      <div className="flex-1 bg-[#F5F5F0] overflow-y-auto p-12 border-l border-[#1a1a1a]/5 custom-scrollbar">
                        <div className="prose prose-stone max-w-none">
                          <ReactMarkdown>{currentText}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[#1a1a1a]/30 flex-col gap-4">
                    <FileText size={64} />
                    <p className="font-bold">Sélectionnez un chapitre pour commencer l'édition.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'cover' && (
            <motion.div 
              key="cover"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 p-12 flex items-center justify-center"
            >
              <div className="max-w-4xl w-full grid grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <h2 className="font-serif text-5xl font-bold">Design de Couverture.</h2>
                  <p className="text-[#1a1a1a]/60">Votre couverture est la première chose que vos lecteurs verront. Assurez-vous qu'elle soit percutante.</p>
                  
                  <div className="space-y-4">
                    <div className="p-6 bg-white rounded-3xl border border-[#1a1a1a]/5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-40">Style Visuel</span>
                        <span className="text-xs font-bold text-[#5A5A40]">Business Modern</span>
                      </div>
                      <div className="flex gap-2">
                        {['Minimal', 'Bold', 'Classic', 'Tech'].map(s => (
                          <button key={s} className="flex-1 py-2 rounded-lg bg-[#F5F5F0] text-[10px] font-bold uppercase tracking-widest hover:bg-[#5A5A40] hover:text-white transition-all">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button className="w-full py-4 bg-[#1a1a1a] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                      <Sparkles size={18} /> Régénérer le Visuel
                    </button>
                  </div>
                </div>

                {/* Cover Preview */}
                <div className="relative aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden group">
                  {ebook.cover_url ? (
                    <img src={ebook.cover_url} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#5A5A40] to-[#1a1a1a] flex items-center justify-center">
                      <ImageIcon size={64} className="text-white/20" />
                    </div>
                  )}
                  {/* Overlay Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-between p-12 text-center text-white bg-black/20">
                    <div className="space-y-2">
                      <h3 className="text-3xl font-serif font-bold leading-tight drop-shadow-lg">{ebook.title}</h3>
                      <p className="text-sm font-medium opacity-80 drop-shadow-md">{ebook.subtitle}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="h-px w-12 bg-white/40 mx-auto mb-4"></div>
                      <p className="text-xs font-bold uppercase tracking-[0.3em] drop-shadow-md">{ebook.author}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'marketing' && (
            <motion.div 
              key="marketing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 p-12 overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="font-serif text-5xl font-bold">Marketing & Vente.</h2>
                    <p className="text-[#1a1a1a]/60 mt-2">Optimisez votre page de vente avec une description générée par l'IA.</p>
                  </div>
                  <button className="px-6 py-3 bg-[#5A5A40] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
                    <Sparkles size={18} /> Améliorer le Texte
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-[#1a1a1a]/5 shadow-sm space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40">Description Commerciale (Longue)</label>
                    <textarea 
                      value={ebook.marketing_desc}
                      onChange={(e) => setEbook({...ebook, marketing_desc: e.target.value})}
                      className="w-full h-64 p-6 bg-[#F5F5F0] rounded-2xl border-none focus:ring-2 focus:ring-[#5A5A40] transition-all outline-none resize-none text-lg leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-[#1a1a1a]/5 shadow-sm space-y-4">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-40">Points Clés (Bénéfices)</label>
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-[#F5F5F0] rounded-xl">
                            <CheckCircle2 size={18} className="text-emerald-500" />
                            <input type="text" className="bg-transparent border-none outline-none flex-1 font-medium" placeholder={`Bénéfice ${i}...`} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#1a1a1a] p-8 rounded-3xl text-white space-y-6 shadow-xl">
                      <h4 className="font-serif text-2xl font-bold">Prêt pour Amazon KDP ?</h4>
                      <p className="text-white/60 text-sm">Votre ebook respecte tous les standards de formatage pour une publication immédiate sur les marketplaces mondiales.</p>
                      <ul className="space-y-3 text-xs font-medium opacity-80">
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Structure de chapitres standard</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Couverture haute résolution</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Table des matières automatique</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
