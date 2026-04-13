import { useState, useEffect, useMemo } from 'react';
import { 
  Menu,
  X,
  Plus, 
  Trash2, 
  Download, 
  ChevronDown, 
  Type, 
  Table as TableIcon, 
  Box, 
  List as ListIcon,
  Search,
  Book as BookIcon,
  Eye,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Chapter, Block, BlockType } from './types';

const STORAGE_KEY = 'grammar_architect_book';

const DEFAULT_BOOK: Book = {
  title: 'Il mio Libro di Grammatica',
  author: 'Autore',
  chapters: [
    {
      id: '1',
      title: 'Introduzione',
      blocks: [
        {
          id: 'b1',
          type: 'text',
          content: 'Benvenuti nel vostro nuovo libro di grammatica.'
        }
      ]
    }
  ]
};

export default function App() {
  const [book, setBook] = useState<Book>(DEFAULT_BOOK);
  const [activeChapterId, setActiveChapterId] = useState<string>('1');
  const [isPreview, setIsPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setBook(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load book', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(book));
  }, [book]);

  const activeChapter = useMemo(() => 
    book.chapters.find(c => c.id === activeChapterId) || book.chapters[0],
  [book.chapters, activeChapterId]);

  const filteredChapters = useMemo(() => {
    if (!searchTerm) return book.chapters;
    const term = searchTerm.toLowerCase();
    return book.chapters.filter(chapter => {
      const titleMatch = chapter.title.toLowerCase().includes(term);
      const blocksMatch = chapter.blocks.some(block => {
        if (block.type === 'text') return block.content.toLowerCase().includes(term);
        if (block.type === 'box') return block.title.toLowerCase().includes(term) || block.content.toLowerCase().includes(term);
        if (block.type === 'table') return block.headers.some(h => h.toLowerCase().includes(term)) || block.rows.some(r => r.some(c => c.toLowerCase().includes(term)));
        if (block.type === 'list') return block.items.some(i => i.toLowerCase().includes(term));
        return false;
      });
      return titleMatch || blocksMatch;
    });
  }, [book.chapters, searchTerm]);

  const filteredBlocks = useMemo(() => {
    if (!searchTerm) return activeChapter.blocks;
    const term = searchTerm.toLowerCase();
    return activeChapter.blocks.filter(block => {
      if (block.type === 'text') return block.content.toLowerCase().includes(term);
      if (block.type === 'box') return block.title.toLowerCase().includes(term) || block.content.toLowerCase().includes(term);
      if (block.type === 'table') return block.headers.some(h => h.toLowerCase().includes(term)) || block.rows.some(r => r.some(c => c.toLowerCase().includes(term)));
      if (block.type === 'list') return block.items.some(i => i.toLowerCase().includes(term));
      return false;
    });
  }, [activeChapter.blocks, searchTerm]);

  const addChapter = () => {
    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      title: 'Nuovo Capitolo',
      blocks: []
    };
    setBook(prev => ({
      ...prev,
      chapters: [...prev.chapters, newChapter]
    }));
    setActiveChapterId(newChapter.id);
  };

  const deleteChapter = (id: string) => {
    if (book.chapters.length <= 1) return;
    setBook(prev => ({
      ...prev,
      chapters: prev.chapters.filter(c => c.id !== id)
    }));
    if (activeChapterId === id) {
      setActiveChapterId(book.chapters[0].id);
    }
  };

  const updateChapterTitle = (id: string, title: string) => {
    setBook(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => c.id === id ? { ...c, title } : c)
    }));
  };

  const addBlock = (type: BlockType) => {
    const newBlock: Block = (() => {
      const id = crypto.randomUUID();
      switch (type) {
        case 'text': return { id, type: 'text', content: '' };
        case 'table': return { id, type: 'table', headers: ['Colonna 1', 'Colonna 2'], rows: [['', '']] };
        case 'box': return { id, type: 'box', title: 'Nota', content: '', variant: 'info' };
        case 'list': return { id, type: 'list', items: [''], ordered: false };
      }
    })();

    setBook(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => 
        c.id === activeChapterId 
          ? { ...c, blocks: [...c.blocks, newBlock] } 
          : c
      )
    }));
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    setBook(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => 
        c.id === activeChapterId 
          ? { ...c, blocks: c.blocks.map(b => b.id === blockId ? { ...b, ...updates } as Block : b) } 
          : c
      )
    }));
  };

  const deleteBlock = (blockId: string) => {
    setBook(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => 
        c.id === activeChapterId 
          ? { ...c, blocks: c.blocks.filter(b => b.id !== blockId) } 
          : c
      )
    }));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= activeChapter.blocks.length) return;

    const newBlocks = [...activeChapter.blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];

    setBook(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => 
        c.id === activeChapterId ? { ...c, blocks: newBlocks } : c
      )
    }));
  };

  const moveChapter = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= book.chapters.length) return;

    const newChapters = [...book.chapters];
    [newChapters[index], newChapters[newIndex]] = [newChapters[newIndex], newChapters[index]];

    setBook(prev => ({ ...prev, chapters: newChapters }));
  };

  const exportToHtml = () => {
    const htmlContent = generateHtml(book);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-200 flex flex-col shadow-xl transition-transform duration-300 lg:relative lg:translate-x-0 lg:shadow-sm
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-bottom border-stone-100 relative">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute right-4 top-6 p-1 hover:bg-stone-100 rounded-full lg:hidden"
          >
            <X className="w-5 h-5 text-stone-400" />
          </button>
          <div className="flex items-center gap-2 mb-4">
            <BookIcon className="w-6 h-6 text-indigo-600" />
            <h1 className="font-bold text-xl tracking-tight">Grammar Architect</h1>
          </div>
          <input 
            type="text" 
            value={book.title}
            onChange={(e) => setBook(prev => ({ ...prev, title: e.target.value }))}
            className="w-full text-sm font-bold bg-stone-50 border border-stone-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 mb-2"
            placeholder="Titolo del Libro"
          />
          <input 
            type="text" 
            value={book.author}
            onChange={(e) => setBook(prev => ({ ...prev, author: e.target.value }))}
            className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Autore"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Capitoli</span>
            <button 
              onClick={addChapter}
              className="p-1 hover:bg-stone-100 rounded-full transition-colors text-indigo-600"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {filteredChapters.map((chapter, idx) => {
            const realIdx = book.chapters.findIndex(c => c.id === chapter.id);
            return (
              <div 
                key={chapter.id}
                onClick={() => {
                  setActiveChapterId(chapter.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  activeChapterId === chapter.id 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'hover:bg-stone-100 text-stone-600'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-xs opacity-50 font-mono">{(realIdx + 1).toString().padStart(2, '0')}</span>
                  <span className="truncate text-sm">{chapter.title}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={(e) => { e.stopPropagation(); moveChapter(realIdx, 'up'); }}
                    className="p-0.5 hover:text-indigo-600"
                  >
                    <ChevronDown className="w-3 h-3 rotate-180" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); moveChapter(realIdx, 'down'); }}
                    className="p-0.5 hover:text-indigo-600"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteChapter(chapter.id); }}
                    className="p-0.5 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-stone-100">
          <button 
            onClick={exportToHtml}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Esporta HTML
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <header className="h-16 bg-white border-b border-stone-200 px-4 lg:px-8 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-stone-100 rounded-lg lg:hidden"
            >
              <Menu className="w-5 h-5 text-stone-600" />
            </button>
            <input 
              type="text" 
              value={activeChapter.title}
              onChange={(e) => updateChapterTitle(activeChapter.id, e.target.value)}
              className="text-base lg:text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full truncate"
              placeholder="Titolo del Capitolo"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block mr-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input 
                type="text" 
                placeholder="Cerca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-stone-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500/20 w-32 lg:w-48 transition-all focus:w-64"
              />
            </div>
            <button 
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-2 px-3 lg:px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                isPreview 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPreview ? 'Editor' : 'Anteprima'}</span>
            </button>
          </div>
        </header>

        {/* Editor/Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-stone-50">
          <div className="max-w-4xl mx-auto">
            {isPreview ? (
              <ChapterPreview chapter={{ ...activeChapter, blocks: filteredBlocks }} />
            ) : (
              <div className="space-y-6 pb-32">
                <AnimatePresence mode="popLayout">
                  {filteredBlocks.map((block, index) => {
                    const realIndex = activeChapter.blocks.findIndex(b => b.id === block.id);
                    return (
                      <motion.div 
                        key={block.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all p-6"
                      >
                        <div className="absolute -left-2 lg:-left-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all z-20">
                          <button onClick={() => moveBlock(realIndex, 'up')} className="p-1.5 bg-white lg:bg-transparent hover:bg-white rounded-md shadow-sm text-stone-400 hover:text-indigo-600"><ChevronDown className="w-4 h-4 rotate-180" /></button>
                          <button onClick={() => moveBlock(realIndex, 'down')} className="p-1.5 bg-white lg:bg-transparent hover:bg-white rounded-md shadow-sm text-stone-400 hover:text-indigo-600"><ChevronDown className="w-4 h-4" /></button>
                          <button onClick={() => deleteBlock(block.id)} className="p-1.5 bg-white lg:bg-transparent hover:bg-white rounded-md shadow-sm text-stone-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>

                        <BlockEditor block={block} onChange={(updates) => updateBlock(block.id, updates)} />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Add Block Controls */}
                <div className="grid grid-cols-2 sm:flex items-center justify-center gap-2 lg:gap-4 py-8 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                  <button onClick={() => addBlock('text')} className="flex flex-col items-center gap-2 p-2 lg:p-4 hover:bg-white rounded-xl transition-all hover:shadow-sm text-stone-500 hover:text-indigo-600">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-stone-100 flex items-center justify-center"><Type className="w-4 h-4 lg:w-5 lg:h-5" /></div>
                    <span className="text-[10px] lg:text-xs font-medium">Testo</span>
                  </button>
                  <button onClick={() => addBlock('table')} className="flex flex-col items-center gap-2 p-2 lg:p-4 hover:bg-white rounded-xl transition-all hover:shadow-sm text-stone-500 hover:text-indigo-600">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-stone-100 flex items-center justify-center"><TableIcon className="w-4 h-4 lg:w-5 lg:h-5" /></div>
                    <span className="text-[10px] lg:text-xs font-medium">Tabella</span>
                  </button>
                  <button onClick={() => addBlock('box')} className="flex flex-col items-center gap-2 p-2 lg:p-4 hover:bg-white rounded-xl transition-all hover:shadow-sm text-stone-500 hover:text-indigo-600">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-stone-100 flex items-center justify-center"><Box className="w-4 h-4 lg:w-5 lg:h-5" /></div>
                    <span className="text-[10px] lg:text-xs font-medium">Box</span>
                  </button>
                  <button onClick={() => addBlock('list')} className="flex flex-col items-center gap-2 p-2 lg:p-4 hover:bg-white rounded-xl transition-all hover:shadow-sm text-stone-500 hover:text-indigo-600">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-stone-100 flex items-center justify-center"><ListIcon className="w-4 h-4 lg:w-5 lg:h-5" /></div>
                    <span className="text-[10px] lg:text-xs font-medium">Lista</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function BlockEditor({ block, onChange }: { block: Block, onChange: (updates: Partial<Block>) => void }) {
  switch (block.type) {
    case 'text':
      return (
        <textarea 
          value={block.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Scrivi qui il testo..."
          className="w-full min-h-[100px] bg-transparent border-none focus:outline-none resize-none text-stone-700 leading-relaxed"
        />
      );
    case 'table':
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase">
            <TableIcon className="w-3 h-3" /> Tabella
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {block.headers.map((h, i) => (
                    <th key={i} className="p-2 border border-stone-200 bg-stone-50">
                      <input 
                        value={h}
                        onChange={(e) => {
                          const newHeaders = [...block.headers];
                          newHeaders[i] = e.target.value;
                          onChange({ headers: newHeaders });
                        }}
                        className="w-full bg-transparent border-none text-xs font-bold text-center focus:outline-none"
                      />
                    </th>
                  ))}
                  <th className="w-8">
                    <button 
                      onClick={() => onChange({ 
                        headers: [...block.headers, 'Nuova'],
                        rows: block.rows.map(r => [...r, ''])
                      })}
                      className="p-1 hover:text-indigo-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="p-2 border border-stone-200">
                        <input 
                          value={cell}
                          onChange={(e) => {
                            const newRows = [...block.rows];
                            newRows[ri][ci] = e.target.value;
                            onChange({ rows: newRows });
                          }}
                          className="w-full bg-transparent border-none text-sm focus:outline-none"
                        />
                      </td>
                    ))}
                    <td className="w-8 text-center">
                      <button 
                        onClick={() => onChange({ rows: block.rows.filter((_, i) => i !== ri) })}
                        className="p-1 text-stone-300 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button 
            onClick={() => onChange({ rows: [...block.rows, Array(block.headers.length).fill('')] })}
            className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Aggiungi riga
          </button>
        </div>
      );
    case 'box':
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase">
              <Box className="w-3 h-3" /> Box Informativo
            </div>
            <select 
              value={block.variant}
              onChange={(e) => onChange({ variant: e.target.value as any })}
              className="text-xs bg-stone-100 border-none rounded px-2 py-1 focus:ring-0"
            >
              <option value="info">Info (Blu)</option>
              <option value="warning">Attenzione (Giallo)</option>
              <option value="tip">Suggerimento (Verde)</option>
            </select>
          </div>
          <input 
            value={block.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Titolo del box"
            className="w-full font-bold text-stone-800 focus:outline-none bg-transparent"
          />
          <textarea 
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Contenuto del box..."
            className="w-full min-h-[60px] bg-transparent border-none focus:outline-none resize-none text-stone-600 text-sm italic"
          />
        </div>
      );
    case 'list':
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase">
              <ListIcon className="w-3 h-3" /> Lista
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-stone-400">Ordinata</span>
              <input 
                type="checkbox" 
                checked={block.ordered}
                onChange={(e) => onChange({ ordered: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            {block.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-stone-300 text-xs">{block.ordered ? `${i + 1}.` : '•'}</span>
                <input 
                  value={item}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[i] = e.target.value;
                    onChange({ items: newItems });
                  }}
                  className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                  placeholder="Elemento lista..."
                />
                <button 
                  onClick={() => onChange({ items: block.items.filter((_, idx) => idx !== i) })}
                  className="p-1 text-stone-300 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onChange({ items: [...block.items, ''] })}
            className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Aggiungi elemento
          </button>
        </div>
      );
  }
}

function ChapterPreview({ chapter }: { chapter: Chapter }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-12 min-h-screen border border-stone-100">
      <h1 className="text-2xl lg:text-4xl font-serif font-bold text-stone-900 mb-8 lg:mb-12 border-b-2 border-indigo-600 pb-4 inline-block">
        {chapter.title}
      </h1>
      <div className="space-y-6 lg:space-y-10">
        {chapter.blocks.map(block => (
          <div key={block.id}>
            {block.type === 'text' && (
              <p className="text-lg text-stone-700 leading-relaxed whitespace-pre-wrap">
                {block.content}
              </p>
            )}
            {block.type === 'table' && (
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse border border-stone-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-stone-50">
                      {block.headers.map((h, i) => (
                        <th key={i} className="p-4 text-left text-sm font-bold text-stone-600 border border-stone-200">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri} className="hover:bg-stone-50/50 transition-colors">
                        {row.map((cell, ci) => (
                          <td key={ci} className="p-4 text-sm text-stone-600 border border-stone-200">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {block.type === 'box' && (
              <div className={`my-8 p-6 rounded-xl border-l-4 ${
                block.variant === 'info' ? 'bg-blue-50 border-blue-500 text-blue-900' :
                block.variant === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-900' :
                'bg-emerald-50 border-emerald-500 text-emerald-900'
              }`}>
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Box className="w-4 h-4" /> {block.title}
                </h4>
                <p className="text-sm leading-relaxed italic whitespace-pre-wrap">{block.content}</p>
              </div>
            )}
            {block.type === 'list' && (
              <div className="my-6">
                {block.ordered ? (
                  <ol className="list-decimal list-inside space-y-2 text-stone-700">
                    {block.items.map((item, i) => <li key={i} className="pl-2">{item}</li>)}
                  </ol>
                ) : (
                  <ul className="list-disc list-inside space-y-2 text-stone-700">
                    {block.items.map((item, i) => <li key={i} className="pl-2">{item}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function generateHtml(book: Book) {
  const chaptersHtml = book.chapters.map((chapter, idx) => `
    <section id="chapter-${chapter.id}" class="chapter">
      <h2 class="chapter-title">${idx + 1}. ${chapter.title}</h2>
      <div class="blocks">
        ${chapter.blocks.map(block => {
          if (block.type === 'text') return `<p class="text-block">${block.content.replace(/\n/g, '<br>')}</p>`;
          if (block.type === 'table') return `
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>${block.headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${block.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>
            </div>
          `;
          if (block.type === 'box') return `
            <div class="box-block variant-${block.variant}">
              <div class="box-title">${block.title}</div>
              <div class="box-content">${block.content.replace(/\n/g, '<br>')}</div>
            </div>
          `;
          if (block.type === 'list') {
            const tag = block.ordered ? 'ol' : 'ul';
            return `<${tag} class="list-block">${block.items.map(item => `<li>${item}</li>`).join('')}</${tag}>`;
          }
          return '';
        }).join('')}
      </div>
    </section>
  `).join('');

  const indexHtml = book.chapters.map((chapter, idx) => `
    <li><a href="#chapter-${chapter.id}">${idx + 1}. ${chapter.title}</a></li>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${book.title}</title>
    <style>
        :root {
            --primary: #4f46e5;
            --bg: #fafaf9;
            --text: #1c1917;
            --border: #e7e5e4;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            margin: 0;
            display: flex;
        }
        aside {
            width: 300px;
            height: 100vh;
            position: fixed;
            background: white;
            border-right: 1px solid var(--border);
            padding: 2rem;
            overflow-y: auto;
        }
        main {
            margin-left: 300px;
            padding: 4rem;
            max-width: 800px;
            flex: 1;
        }
        h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .author { color: #78716c; font-style: italic; margin-bottom: 3rem; }
        .chapter { margin-bottom: 6rem; scroll-margin-top: 4rem; }
        .chapter-title { 
            font-size: 2rem; 
            border-bottom: 3px solid var(--primary); 
            padding-bottom: 0.5rem;
            margin-bottom: 2rem;
        }
        .text-block { font-size: 1.125rem; margin-bottom: 1.5rem; }
        .table-wrapper { overflow-x: auto; margin: 2rem 0; }
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
        th, td { padding: 1rem; border: 1px solid var(--border); text-align: left; }
        th { background: #f5f5f4; font-weight: bold; }
        .box-block { padding: 1.5rem; border-radius: 12px; border-left: 4px solid; margin: 2rem 0; }
        .variant-info { background: #eff6ff; border-color: #3b82f6; color: #1e3a8a; }
        .variant-warning { background: #fffbeb; border-color: #f59e0b; color: #78350f; }
        .variant-tip { background: #ecfdf5; border-color: #10b981; color: #064e3b; }
        .box-title { font-weight: bold; margin-bottom: 0.5rem; }
        .box-content { font-size: 0.9rem; font-style: italic; }
        .list-block { margin: 1.5rem 0; padding-left: 1.5rem; }
        .list-block li { margin-bottom: 0.5rem; }
        
        #search-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--border);
            border-radius: 8px;
            margin-bottom: 2rem;
            font-size: 0.9rem;
        }
        .index-list { list-style: none; padding: 0; }
        .index-list li { margin-bottom: 0.75rem; }
        .index-list a { text-decoration: none; color: var(--text); font-size: 0.95rem; }
        .index-list a:hover { color: var(--primary); }
        
        @media (max-width: 900px) {
            body { flex-direction: column; }
            aside { width: 100%; height: auto; position: relative; border-right: none; border-bottom: 1px solid var(--border); }
            main { margin-left: 0; padding: 2rem; }
        }
        @media print {
            aside { display: none; }
            main { margin-left: 0; padding: 0; }
            .chapter { page-break-before: always; }
        }
    </style>
</head>
<body>
    <aside>
        <h2>Indice</h2>
        <input type="text" id="search-input" placeholder="Cerca nel libro..." onkeyup="search()">
        <ul class="index-list" id="index-list">
            ${indexHtml}
        </ul>
    </aside>
    <main>
        <header>
            <h1>${book.title}</h1>
            <p class="author">di ${book.author}</p>
        </header>
        <div id="content">
            ${chaptersHtml}
        </div>
    </main>
    <script>
        function search() {
            const term = document.getElementById('search-input').value.toLowerCase();
            const chapters = document.querySelectorAll('.chapter');
            const indexItems = document.querySelectorAll('.index-list li');
            
            chapters.forEach((chapter, i) => {
                const text = chapter.innerText.toLowerCase();
                const isMatch = text.includes(term);
                chapter.style.display = isMatch ? 'block' : 'none';
                indexItems[i].style.display = isMatch ? 'block' : 'none';
            });
        }
    </script>
</body>
</html>
  `;
}
