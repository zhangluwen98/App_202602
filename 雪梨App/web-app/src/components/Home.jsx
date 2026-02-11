import React from 'react';
import { BookOpen, Heart } from 'lucide-react';

export default function Home({ novels, onSelectStory, isMobileMode }) {
  return (
    <div className="pb-16">
      {/* Header */}
      <div className={`bg-white sticky top-0 z-10 shadow-sm flex justify-between items-center ${isMobileMode ? 'px-3 py-2' : 'px-6 py-4'}`}>
        <h1 className={`${isMobileMode ? 'text-lg' : 'text-2xl'} font-bold text-sherry-500`}>雪梨 App</h1>
        <div className={`${isMobileMode ? 'w-7 h-7' : 'w-10 h-10'} bg-gray-100 rounded-full overflow-hidden`}>
          <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop" alt="User" />
        </div>
      </div>

      {/* Banner */}
      <div className={isMobileMode ? 'p-3' : 'p-6'}>
        <div className={`bg-gradient-to-r from-sherry-400 to-sherry-600 rounded-2xl text-white shadow-lg shadow-sherry-200 ${isMobileMode ? 'p-4' : 'p-8'}`}>
          <h2 className={`${isMobileMode ? 'text-xl' : 'text-3xl'} font-bold mb-1.5`}>与故事相遇</h2>
          <p className={`${isMobileMode ? 'text-xs' : 'text-sm'} opacity-90`}>开启你的跨次元对话之旅</p>
        </div>
      </div>

      {/* Section Title */}
      <div className={`${isMobileMode ? 'px-3 py-2' : 'px-6 py-4'}`}>
        <h3 className={`${isMobileMode ? 'text-sm' : 'text-lg'} font-bold text-gray-800`}>热门推荐</h3>
      </div>

      {/* Story Grid */}
      <div className={`${isMobileMode ? 'grid grid-cols-1 gap-3 px-3' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6'}`}>
        {novels.map(novel => (
          <div 
            key={novel.id} 
            onClick={() => onSelectStory(novel.id)}
            className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${isMobileMode ? 'flex' : ''}`}
          >
            <div className={`${isMobileMode ? 'w-20 h-28 flex-shrink-0' : 'w-full h-48'}`}>
              <img src={novel.cover} alt={novel.title} className="w-full h-full object-cover" />
            </div>
            <div className={`${isMobileMode ? 'p-2.5 flex-1 flex flex-col justify-between' : 'p-4'}`}>
              <div>
                <h4 className={`font-bold text-gray-900 ${isMobileMode ? 'text-sm line-clamp-1' : 'text-base line-clamp-2'}`}>{novel.title}</h4>
                <p className={`${isMobileMode ? 'text-[10px]' : 'text-sm'} text-gray-500 mt-0.5`}>{novel.author}</p>
                <p className={`${isMobileMode ? 'text-[10px]' : 'text-sm'} text-gray-400 mt-1.5 line-clamp-2`}>{novel.description}</p>
              </div>
              <div className={`flex gap-1 ${isMobileMode ? 'mt-1.5' : 'mt-3'}`}>
                {novel.tags.slice(0, 2).map(tag => (
                  <span key={tag} className={`${isMobileMode ? 'text-[9px]' : 'text-xs'} bg-sherry-50 text-sherry-600 px-1.5 py-0.5 rounded-full`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
