import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Search, 
  Filter, 
  MoreVertical, 
  Download,
  Loader2,
  Plus,
  Clock,
  Edit3,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface Ebook {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  niche: string;
  status: string;
  created_at: string;
  cover_url: string;
}

export default function MyEbooks({ onEditEbook }: { onEditEbook: (id: string) => void }) {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEbooks(data || []);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEbook = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ebook ?')) return;
    try {
      const { error } = await supabase
        .from('ebooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEbooks(ebooks.filter(eb => eb.id !== id));
    } catch (error) {
      console.error('Error deleting ebook:', error);
    }
  };

  const filteredEbooks = ebooks.filter(eb => 
    eb.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    eb.niche.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-12 max-w-7xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="font-serif text-6xl font-bold tracking-tight text-brand-navy">Ma Bibliothèque.</h2>
          <p className="text-brand-navy/50 text-xl font-medium">Retrouvez et gérez tous vos ebooks générés.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-navy/20 group-focus-within:text-brand-amber transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un livre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-8 py-4 bg-white rounded-[2rem] border border-brand-navy/5 shadow-sm focus:ring-4 focus:ring-brand-amber/10 focus:border-brand-amber transition-all outline-none w-80 font-medium"
            />
          </div>
          <button className="p-4 bg-white rounded-[1.5rem] border border-brand-navy/5 hover:bg-brand-paper/30 transition-all shadow-sm">
            <Filter size={22} className="text-brand-navy" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-white rounded-[3rem] animate-pulse" />)}
        </div>
      ) : filteredEbooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredEbooks.map((ebook, i) => (
            <motion.div
              key={ebook.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onEditEbook(ebook.id)}
              className="group cursor-pointer space-y-6"
            >
              <div className="relative aspect-[3/4] bg-white rounded-[3rem] shadow-sm border border-brand-navy/5 overflow-hidden transition-all duration-700 group-hover:shadow-[0_32px_64px_-12px_rgba(27,38,59,0.2)] group-hover:-translate-y-4">
                {ebook.cover_url ? (
                  <img src={ebook.cover_url} alt={ebook.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-navy to-[#0D1321] flex items-center justify-center">
                    <Book size={64} className="text-white/10" />
                  </div>
                )}
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-brand-navy/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
                  <button className="w-14 h-14 bg-white rounded-full text-brand-navy hover:bg-brand-amber hover:text-white transition-all duration-300 flex items-center justify-center shadow-xl">
                    <Edit3 size={24} />
                  </button>
                  <button 
                    onClick={(e) => deleteEbook(ebook.id, e)}
                    className="w-14 h-14 bg-white rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 flex items-center justify-center shadow-xl"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                  <span className={cn(
                    "px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg",
                    ebook.status === 'completed' ? "text-emerald-600" : "text-amber-600"
                  )}>
                    {ebook.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 px-2">
                <h4 className="font-serif text-2xl font-bold text-brand-navy group-hover:text-brand-amber transition-colors truncate">{ebook.title}</h4>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-brand-navy/40 font-bold uppercase tracking-widest">{ebook.niche}</p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-brand-navy/30">
                    <Clock size={10} />
                    {new Date(ebook.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-32 rounded-[4rem] border-2 border-dashed border-brand-navy/10 text-center space-y-8 shadow-sm">
          <div className="w-28 h-28 bg-brand-paper rounded-full flex items-center justify-center mx-auto text-brand-navy/10">
            <Book size={56} />
          </div>
          <div className="space-y-3">
            <h3 className="font-serif text-4xl font-bold text-brand-navy">Aucun ebook trouvé.</h3>
            <p className="text-brand-navy/40 max-w-md mx-auto text-lg font-medium">Votre bibliothèque est vide. Commencez à créer du contenu professionnel dès maintenant.</p>
          </div>
          <button className="bg-brand-navy text-white px-10 py-5 rounded-[2rem] font-bold flex items-center gap-3 mx-auto shadow-2xl shadow-brand-navy/20 hover:scale-105 transition-all">
            <Plus size={22} /> Créer mon premier Ebook
          </button>
        </div>
      )}
    </div>
  );
}
