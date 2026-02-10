import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Settings, Share2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Reader({ story, onBack, onOpenChat }) {
  const chapter = story.chapters[0];
  const character = story.characters[0];
  const [activeParagraph, setActiveParagraph] = useState(null);

  const handleParagraphClick = (paragraph) => {
    setActiveParagraph(paragraph.id === activeParagraph ? null : paragraph.id);
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen relative font-sans">
      {/* Navbar */}
      <div className="sticky top-0 bg-[#FAF9F6]/95 backdrop-blur-sm z-10 px-4 py-3 flex justify-between items-center border-b border-gray-100 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-semibold text-gray-800 line-clamp-1 w-48">{story.title}</h2>
          <p className="text-xs text-gray-400">第一章</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <Settings size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-8 pb-32">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{chapter.title}</h1>
        
        <div className="space-y-6">
          {chapter.paragraphs.map((p) => (
            <div key={p.id} className="relative group">
              <motion.p 
                layout
                onClick={() => handleParagraphClick(p)}
                className={`
                  text-lg leading-loose cursor-pointer rounded-lg px-2 -mx-2 transition-colors duration-200
                  ${activeParagraph === p.id ? 'bg-sherry-50 text-gray-900 font-medium ring-1 ring-sherry-100' : 'text-gray-700 hover:bg-gray-100/50'}
                `}
              >
                {p.text}
              </motion.p>
              
              {/* Interaction Bubble */}
              <AnimatePresence>
                {activeParagraph === p.id && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute right-0 -bottom-10 z-10"
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChat(character, p.text);
                      }}
                      className="bg-sherry-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-sherry-600 transition-colors"
                    >
                      <Sparkles size={12} />
                      <span>问问 {character.name.split(' ')[0]}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Character FAB (Floating Action Button) */}
      <div className="fixed bottom-8 right-6 z-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onOpenChat(character)}
          className="relative group"
        >
          <div className="w-14 h-14 rounded-full border-2 border-white shadow-lg overflow-hidden relative z-10 bg-white">
            <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
          </div>
          {/* Status Dot */}
          <div className="absolute bottom-1 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full z-20"></div>
          
          {/* Tooltip / Teaser */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white px-3 py-1.5 rounded-xl shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="text-xs font-medium text-gray-600">找我聊天?</span>
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white rotate-45"></div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
