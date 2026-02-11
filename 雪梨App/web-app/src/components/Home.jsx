import React from 'react';
import { BookOpen, Heart } from 'lucide-react';

export default function Home({ novels, onSelectStory }) {
  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold text-sherry-500">雪梨 App</h1>
        <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden">
          <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop" alt="User" />
        </div>
      </div>

      {/* Banner */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-sherry-400 to-sherry-600 rounded-2xl p-6 text-white shadow-lg shadow-sherry-200">
          <h2 className="text-2xl font-bold mb-2">与故事相遇</h2>
          <p className="text-sm opacity-90">开启你的跨次元对话之旅</p>
        </div>
      </div>

      {/* Section Title */}
      <div className="px-4 py-2">
        <h3 className="text-lg font-bold text-gray-800">热门推荐</h3>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 gap-4 px-4">
        {novels.map(novel => (
          <div 
            key={novel.id} 
            onClick={() => onSelectStory(novel.id)}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex"
          >
            <div className="w-24 h-32 flex-shrink-0">
              <img src={novel.cover} alt={novel.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-base line-clamp-1">{novel.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{novel.author}</p>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{novel.description}</p>
              </div>
              <div className="flex gap-1 mt-2">
                {novel.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[10px] bg-sherry-50 text-sherry-600 px-2 py-0.5 rounded-full">
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
