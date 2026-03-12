import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Book, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  Zap,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

import { supabase } from '../lib/supabase';

interface Ebook {
  id: string;
  title: string;
  subtitle: string;
  niche: string;
  status: string;
  created_at: string;
}

export default function Dashboard({ onCreateNew, onEditEbook }: { onCreateNew: (niche?: string) => void, onEditEbook: (id: string) => void }) {
  const [recentEbooks, setRecentEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentEbooks = async () => {
      try {
        const { data, error } = await supabase
          .from('ebooks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setRecentEbooks(data || []);
      } catch (err) {
        console.error('Error fetching recent ebooks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentEbooks();
  }, []);

  const stats = [
    { label: 'Ebooks Générés', value: '12', icon: Book, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: 'Mots Écrits', value: '45.2k', icon: Zap, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Temps Gagné', value: '120h', icon: Clock, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Taux de Vente Est.', value: '+14%', icon: TrendingUp, color: 'bg-rose-50 text-rose-600 border-rose-100' },
  ];

  const niches = [
    { name: 'Productivité pour Télétravail', trend: '+24%', color: 'bg-emerald-500/20 text-emerald-400' },
    { name: 'Cuisine Végétalienne Rapide', trend: '+18%', color: 'bg-amber-500/20 text-amber-400' },
    { name: 'Finance pour Débutants', trend: '+32%', color: 'bg-indigo-500/20 text-indigo-400' },
  ];

  return (
    <div className="p-12 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="font-serif text-6xl font-bold tracking-tight text-brand-navy">Bienvenue, Auteur.</h2>
          <p className="text-brand-navy/50 text-xl max-w-xl font-medium">
            Prêt à transformer vos idées en un ebook professionnel ?
          </p>
        </div>
        <button 
          onClick={() => onCreateNew()}
          className="bg-brand-navy text-white px-10 py-5 rounded-[2rem] font-bold flex items-center gap-3 shadow-2xl shadow-brand-navy/20 hover:scale-105 hover:bg-brand-navy/90 transition-all group"
        >
          <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
          Créer un Nouvel Ebook
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn("bg-white p-8 rounded-[2.5rem] border shadow-sm hover:shadow-xl transition-all duration-500", stat.color)}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-inner flex items-center justify-center">
                <stat.icon size={28} />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Mise à jour: Aujourd'hui</div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">{stat.label}</p>
            <p className="text-4xl font-serif font-bold text-brand-navy">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Ebooks */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-3xl font-bold text-brand-navy">Ebooks Récents</h3>
            <button className="text-sm font-bold text-brand-olive flex items-center gap-1 hover:gap-2 transition-all">
              Voir tout <ChevronRight size={16} />
            </button>
          </div>

          <div className="space-y-6">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-28 bg-white rounded-[2rem] animate-pulse" />)
            ) : recentEbooks.length > 0 ? (
              recentEbooks.map((ebook) => (
                <div 
                  key={ebook.id}
                  onClick={() => onEditEbook(ebook.id)}
                  className="bg-white p-8 rounded-[2.5rem] border border-brand-navy/5 shadow-sm hover:shadow-2xl hover:border-brand-amber/20 transition-all cursor-pointer group flex items-center gap-8"
                >
                  <div className="w-20 h-24 bg-brand-paper rounded-2xl flex items-center justify-center text-brand-navy/20 group-hover:bg-brand-amber/10 group-hover:text-brand-amber transition-all duration-500">
                    <Book size={40} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-serif text-2xl font-bold text-brand-navy group-hover:text-brand-amber transition-colors">{ebook.title}</h4>
                    <div className="flex items-center gap-3 text-xs font-medium text-brand-navy/40">
                      <span className="px-3 py-1 bg-brand-navy/5 rounded-full text-brand-navy/60">{ebook.niche}</span>
                      <span>•</span>
                      <span>{new Date(ebook.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      ebook.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {ebook.status}
                    </span>
                    <div className="w-12 h-12 rounded-full bg-brand-navy/5 flex items-center justify-center group-hover:bg-brand-navy group-hover:text-white transition-all duration-500">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-16 rounded-[3rem] border-2 border-dashed border-brand-navy/10 text-center space-y-6">
                <div className="w-20 h-20 bg-brand-paper rounded-full flex items-center justify-center mx-auto text-brand-navy/20">
                  <Book size={40} />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-serif font-bold text-brand-navy">Votre bibliothèque est vide.</p>
                  <p className="text-brand-navy/40 max-w-xs mx-auto">Commencez votre premier projet et regardez-le prendre vie ici.</p>
                </div>
                <button 
                  onClick={() => onCreateNew()}
                  className="text-brand-olive font-bold hover:underline"
                >
                  Créer maintenant
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Niche Suggestions */}
        <div className="space-y-8">
          <h3 className="font-serif text-3xl font-bold text-brand-navy">Niches Rentables</h3>
          <div className="bg-gradient-to-br from-brand-navy to-[#0D1321] rounded-[3rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 p-4 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <Sparkles size={240} />
            </div>
            <div className="space-y-2 relative z-10">
              <p className="text-[10px] opacity-60 font-bold uppercase tracking-[0.3em]">Suggestions IA</p>
              <h4 className="text-2xl font-serif font-bold">Opportunités du moment</h4>
            </div>
            <div className="space-y-4 relative z-10">
              {niches.map((niche) => (
                <div 
                  key={niche.name} 
                  onClick={() => onCreateNew(niche.name)}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer border border-white/5 group/niche"
                >
                  <span className="font-bold text-sm group-hover/niche:text-brand-amber transition-colors">{niche.name}</span>
                  <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg", niche.color)}>{niche.trend}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onCreateNew()}
              className="w-full py-4 bg-brand-amber text-brand-navy rounded-2xl font-bold text-sm hover:bg-white transition-all shadow-xl shadow-brand-amber/10 relative z-10"
            >
              Explorer plus de niches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
