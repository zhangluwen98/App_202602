import React from 'react';
import { BookOpen, Heart } from 'lucide-react';

export default function Home({ novels, onSelectStory, isMobileMode }) {
  return (
    <div className="pb-16">
      {/* Header */}
      <header className={`bg-white/80 backdrop-blur-md sticky top-0 z-[50] border-b border-gray-100 flex justify-between items-center transition-all ${isMobileMode ? 'px-4 py-3' : 'px-8 py-5'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sherry-500 rounded-lg flex items-center justify-center shadow-lg shadow-sherry-200">
            <span className="text-white font-black text-xl italic">S</span>
          </div>
          <h1 className={`${isMobileMode ? 'text-xl' : 'text-2xl'} font-black tracking-tight text-gray-900`}>
            雪梨<span className="text-sherry-500 italic">App</span>
          </h1>
        </div>
        <div className={`${isMobileMode ? 'w-8 h-8' : 'w-10 h-10'} rounded-full overflow-hidden border-2 border-white shadow-md ring-1 ring-gray-100 cursor-pointer hover:scale-105 transition-transform`}>
          <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop" alt="User" className="w-full h-full object-cover" />
        </div>
      </header>

      {/* Banner */}
      <div className={isMobileMode ? 'p-4' : 'p-8'}>
        <div className={`relative overflow-hidden bg-gradient-to-br from-sherry-400 via-sherry-500 to-orange-500 rounded-3xl text-white shadow-xl shadow-sherry-100 ${isMobileMode ? 'p-6' : 'p-12'}`}>
          <div className="relative z-10">
            <h2 className={`${isMobileMode ? 'text-2xl' : 'text-4xl'} font-black mb-2 tracking-tight`}>与故事相遇</h2>
            <p className={`${isMobileMode ? 'text-sm' : 'text-lg'} opacity-90 font-medium max-w-[80%]`}>开启你的跨次元对话之旅，每一个选择都将改变命运</p>
            <button className={`mt-4 bg-white text-sherry-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-all ${isMobileMode ? 'px-5 py-2 text-xs' : 'px-8 py-3 text-base'}`}>
              立即探索
            </button>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-orange-400/20 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Section Title */}
      <div className={`${isMobileMode ? 'px-4 py-2' : 'px-8 py-4'} flex items-center justify-between`}>
        <h3 className={`${isMobileMode ? 'text-lg' : 'text-xl'} font-black text-gray-900 flex items-center gap-2`}>
          <span className="w-1.5 h-6 bg-sherry-500 rounded-full"></span>
          热门推荐
        </h3>
        <button className="text-xs font-bold text-sherry-500 hover:text-sherry-600 transition-colors">查看全部</button>
      </div>

      {/* Story Grid */}
      <div className={`
        ${isMobileMode 
          ? 'grid grid-cols-1 gap-4 px-4' 
          : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-8'}
      `}>
        {novels.map(novel => (
          <div 
            key={novel.id} 
            onClick={() => onSelectStory(novel.id)}
            className={`
              group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-50
              ${isMobileMode ? 'flex h-36' : 'flex flex-col'}
            `}
          >
            <div className={`relative overflow-hidden ${isMobileMode ? 'w-28 flex-shrink-0' : 'w-full aspect-[3/4]'}`}>
              <img 
                src={novel.cover} 
                alt={novel.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                连载中
              </div>
            </div>
            <div className={`flex-1 flex flex-col justify-between ${isMobileMode ? 'p-3' : 'p-5'}`}>
              <div>
                <h4 className={`font-black text-gray-900 group-hover:text-sherry-500 transition-colors ${isMobileMode ? 'text-base line-clamp-1' : 'text-lg line-clamp-2'}`}>
                  {novel.title}
                </h4>
                <p className={`${isMobileMode ? 'text-[11px]' : 'text-sm'} text-gray-500 font-medium mt-0.5 italic`}>@ {novel.author}</p>
                <p className={`${isMobileMode ? 'text-[11px]' : 'text-sm'} text-gray-400 mt-2 line-clamp-2 leading-relaxed`}>
                  {novel.description}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-1.5">
                  {novel.tags.slice(0, 2).map(tag => (
                    <span key={tag} className={`${isMobileMode ? 'text-[9px]' : 'text-xs'} bg-gray-50 text-gray-500 font-bold px-2 py-0.5 rounded-md`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-sherry-500">
                  <Heart size={isMobileMode ? 12 : 14} fill="currentColor" />
                  <span className="text-[10px] font-black">9.8</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
