/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  ChevronRight, 
  X, 
  Tag,
  Hash,
  Edit3,
  BookOpen
} from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
}

export default function App() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Load entries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mindful-journal-entries');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse entries", e);
      }
    }
  }, []);

  // Save entries to localStorage
  useEffect(() => {
    localStorage.setItem('mindful-journal-entries', JSON.stringify(entries));
  }, [entries]);

  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setEditingId(null);
    setIsAdding(false);
  };

  const handleAddOrUpdate = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    if (editingId) {
      // Update existing
      setEntries(entries.map(entry => 
        entry.id === editingId 
          ? { 
              ...entry, 
              title: newTitle, 
              content: newContent, 
              tags: newTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') 
            } 
          : entry
      ));
    } else {
      // Create new
      const entry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('id-ID', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        title: newTitle,
        content: newContent,
        tags: newTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      };
      setEntries([entry, ...entries]);
    }
    
    resetForm();
  };

  const startEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setNewTitle(entry.title);
    setNewContent(entry.content);
    setNewTags(entry.tags?.join(', ') || '');
    setIsAdding(true);
    setSelectedEntry(null); // Close detail if open
  };

  const deleteEntry = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setEntries(entries.filter(entry => entry.id !== itemToDelete));
      if (selectedEntry?.id === itemToDelete) setSelectedEntry(null);
      setItemToDelete(null);
    }
  };

  const allTags = Array.from(new Set(entries.flatMap(e => e.tags || [])));
  const filteredEntries = activeTag ? entries.filter(e => e.tags?.includes(activeTag)) : entries;

  return (
    <div className="min-h-screen font-sans text-slate-800 pb-20 selection:bg-orange-100">
      {/* Header */}
      <header className="px-6 py-12 md:px-12 md:py-20 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-7xl font-light tracking-tight text-slate-900"
          >
            Mindful Journal
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 font-medium tracking-widest uppercase text-xs"
          >
            Ruang Refleksi Pribadi
          </motion.p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-medium shadow-xl shadow-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Plus size={20} />
          Tulis Catatan Baru
        </motion.button>
      </header>

      <main className="px-6 md:px-12 max-w-5xl mx-auto">
        
        {/* Entry List */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="font-serif text-3xl">Arsip Catatan</h2>
            
            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide no-scrollbar">
                <button
                  onClick={() => setActiveTag(null)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${!activeTag ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  Semua
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1 ${activeTag === tag ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                  >
                    <Hash size={10} />
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredEntries.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="text-slate-200" size={32} />
              </div>
              <p className="text-slate-400 italic">Belum ada catatan yang tersimpan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedEntry(entry)}
                    className="group bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all cursor-pointer relative"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold bg-slate-50 px-3 py-1 rounded-full">
                            {entry.date}
                          </span>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                               {entry.tags.slice(0, 2).map(tag => (
                                 <span key={tag} className="text-[10px] text-orange-400 font-bold uppercase tracking-tighter flex items-center">
                                   <Hash size={10} />{tag}
                                 </span>
                               ))}
                               {entry.tags.length > 2 && (
                                 <span className="text-[10px] text-slate-300 font-bold">+{entry.tags.length - 2}</span>
                               )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                           <button 
                            onClick={(e) => { e.stopPropagation(); startEdit(entry); }}
                            className="text-slate-300 hover:text-slate-900 transition-colors p-2"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={(e) => deleteEntry(entry.id, e)}
                            className="text-slate-300 hover:text-red-400 transition-colors p-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-serif text-2xl text-slate-900 group-hover:text-orange-600 transition-colors">
                        {entry.title}
                      </h3>
                      <p className="text-slate-500 line-clamp-2 md:line-clamp-3 leading-relaxed">
                        {entry.content}
                      </p>
                      <div className="pt-2 flex items-center text-xs text-orange-400 font-medium opacity-0 group-hover:opacity-100 transition-all">
                        Baca selengkapnya <ChevronRight size={14} className="ml-1" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-3xl">{editingId ? 'Edit Refleksi' : 'Tulis Refleksi'}</h2>
                  <button onClick={resetForm} className="bg-slate-50 p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Judul Momen</label>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Apa yang ada di benakmu?"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full text-2xl font-serif outline-none border-b border-slate-100 pb-2 focus:border-orange-200 transition-colors placeholder:text-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Detail Pikiran</label>
                    <textarea 
                      rows={6}
                      placeholder="Ceritakan harimu, perasaanmu, atau impianmu hari ini..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full text-slate-600 leading-relaxed outline-none resize-none placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1">
                      <Tag size={12} /> Label & Kategori
                    </label>
                    <input 
                      type="text" 
                      placeholder="Syukur, Mimpi, Kerja (pisahkan dengan koma)"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-300 py-1"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                    onClick={resetForm}
                    className="flex-1 py-4 rounded-2xl font-medium text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleAddOrUpdate}
                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-medium shadow-lg hover:bg-slate-800 transition-colors shadow-slate-200"
                  >
                    {editingId ? 'Simpan Perubahan' : 'Simpan Catatan'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-y-auto"
            >
              <div className="p-8 md:p-16 space-y-12">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase tracking-widest text-orange-400 font-bold px-4 py-2 bg-orange-50 rounded-full">
                      {selectedEntry.date}
                    </span>
                    <h2 className="font-serif text-5xl md:text-6xl text-slate-900 leading-tight">
                      {selectedEntry.title}
                    </h2>
                    {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {selectedEntry.tags.map(tag => (
                          <span key={tag} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
                            <Hash size={10} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => startEdit(selectedEntry)} 
                      className="bg-slate-50 p-3 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
                      title="Edit"
                    >
                      <Edit3 size={20} />
                    </button>
                    <button 
                      onClick={() => deleteEntry(selectedEntry.id)} 
                      className="bg-red-50 p-3 rounded-full hover:bg-red-100 transition-colors text-red-500"
                      title="Hapus"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button onClick={() => setSelectedEntry(null)} className="bg-slate-50 p-3 rounded-full hover:bg-slate-100 transition-colors">
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="w-12 h-1 bg-orange-200 rounded-full" />
                  <p className="text-xl text-slate-600 leading-relaxed font-serif whitespace-pre-wrap">
                    {selectedEntry.content}
                  </p>
                </div>

                <div className="pt-12 border-t border-slate-50 flex items-center justify-between text-slate-400">
                   <div className="flex items-center gap-2">
                     <BookOpen size={16} />
                     <span className="text-xs italic">Tersimpan dalam arsip pribadimu</span>
                   </div>
                   <button 
                    onClick={() => { setSelectedEntry(null); setIsAdding(true); }}
                    className="text-xs uppercase tracking-widest font-bold text-slate-900 hover:text-orange-500 transition-colors"
                  >
                    Tulis Catatan Lain
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl">Hapus Catatan?</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Tindakan ini tidak dapat dibatalkan. Kenangan ini akan hilang selamanya.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={confirmDelete}
                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-600 transition-colors"
                  >
                    Ya, Hapus Sekarang
                  </button>
                  <button 
                    onClick={() => setItemToDelete(null)}
                    className="w-full py-4 text-slate-400 font-medium hover:bg-slate-50 rounded-2xl transition-colors"
                  >
                    Batalkan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Decor */}
      <footer className="max-w-5xl mx-auto px-12 py-12 text-center text-slate-300 text-[10px] uppercase tracking-[0.2em] font-bold">
        Dibangun dengan ketenangan
      </footer>
    </div>
  );
}
