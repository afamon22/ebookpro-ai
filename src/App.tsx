import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Library, 
  Settings, 
  LayoutDashboard, 
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import Dashboard from './components/Dashboard';
import EbookWizard from './components/EbookWizard';
import MyEbooks from './components/MyEbooks';
import EbookEditor from './components/EbookEditor';

type View = 'dashboard' | 'wizard' | 'library' | 'editor' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedEbookId, setSelectedEbookId] = useState<string | null>(null);
  const [prefilledNiche, setPrefilledNiche] = useState<string>('');

  const navigateToEditor = (id: string) => {
    setSelectedEbookId(id);
    setCurrentView('editor');
  };

  const handleCreateNew = (niche?: string) => {
    setPrefilledNiche(niche || '');
    setCurrentView('wizard');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wizard', label: 'Créer un Ebook', icon: Plus },
    { id: 'library', label: 'Mes Ebooks', icon: Library },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#FEFAE0]/30 text-[#1a1a1a] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-brand-navy/5 flex flex-col shadow-[4px_0_24px_rgba(27,38,59,0.02)]">
        <div className="p-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-olive to-brand-emerald rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-olive/20">
            <BookOpen size={26} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold leading-none text-brand-navy">EbookPro</h1>
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-olive font-bold">Studio Edition</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group",
                currentView === item.id 
                  ? "bg-brand-navy text-white shadow-xl shadow-brand-navy/20 translate-x-1" 
                  : "text-brand-navy/50 hover:bg-brand-navy/5 hover:text-brand-navy"
              )}
            >
              <item.icon size={18} className={cn("transition-transform group-hover:scale-110", currentView === item.id ? "text-brand-amber" : "")} />
              {item.label}
              {currentView === item.id && (
                <motion.div layoutId="active-pill" className="ml-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-amber" />
                </motion.div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-gradient-to-br from-brand-navy to-[#0D1321] p-5 rounded-[2rem] text-white relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-brand-amber/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-brand-amber" />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Plan Illimité</p>
              </div>
              <p className="text-xs font-medium leading-relaxed">Générez autant d'ebooks que vous le souhaitez.</p>
              <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">
                Détails du compte
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView + (selectedEbookId || '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {currentView === 'dashboard' && (
              <Dashboard 
                onCreateNew={handleCreateNew} 
                onEditEbook={navigateToEditor}
              />
            )}
            {currentView === 'wizard' && (
              <EbookWizard 
                onComplete={navigateToEditor} 
                initialNiche={prefilledNiche}
              />
            )}
            {currentView === 'library' && (
              <MyEbooks onEditEbook={navigateToEditor} />
            )}
            {currentView === 'editor' && selectedEbookId && (
              <EbookEditor 
                ebookId={selectedEbookId} 
                onBack={() => setCurrentView('library')} 
              />
            )}
            {currentView === 'settings' && (
              <div className="p-12 max-w-4xl mx-auto">
                <h2 className="font-serif text-4xl mb-8">Paramètres</h2>
                <div className="bg-white rounded-3xl p-8 border border-[#1a1a1a]/5 shadow-sm">
                  <p className="text-[#1a1a1a]/60">Configuration de votre compte et préférences d'édition.</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
