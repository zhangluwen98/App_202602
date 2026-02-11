import { Heart } from 'lucide-react';

export default function Home({ novels, onSelectStory, isMobileMode }) {
  return (
    <div className="pb-16">
      {/* Header */}
      <header className={`bg-white sticky top-0 z-[50] border-b border-gray-100 flex flex-row justify-between items-center transition-all honor-flex-fix ${isMobileMode ? 'px-4 py-3 h-14' : 'px-8 py-5 h-20'}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex flex-row items-center honor-flex-fix" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div className="w-8 h-8 bg-sherry-500 rounded-lg flex items-center justify-center shadow-lg shadow-sherry-200 flex-shrink-0" style={{ marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="text-white font-black text-xl italic leading-none">S</span>
          </div>
          <h1 className={`${isMobileMode ? 'text-xl' : 'text-2xl'} font-black tracking-tight text-gray-900 truncate`}>
            雪梨<span className="text-sherry-500 italic">App</span>
          </h1>
        </div>
        <div className={`${isMobileMode ? 'w-9 h-9' : 'w-10 h-10'} rounded-full overflow-hidden border-2 border-white shadow-md ring-1 ring-gray-100 cursor-pointer hover:scale-105 transition-transform flex-shrink-0 honor-avatar-fix`}>
          <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop" alt="User" className="w-full h-full object-cover" />
        </div>
      </header>

      {/* Banner */}
      <div className={isMobileMode ? 'px-4 pt-4 pb-2 w-full' : 'p-8'}>
        <div className={`relative overflow-hidden bg-gradient-to-br from-sherry-400 via-sherry-500 to-orange-500 rounded-3xl text-white shadow-xl shadow-sherry-100 ${isMobileMode ? 'p-6 min-h-[160px] w-full' : 'p-12'}`}>
          <div className="relative z-10 flex flex-col justify-center h-full honor-flex-fix" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <h2 className={`${isMobileMode ? 'text-2xl' : 'text-4xl'} font-black mb-2 tracking-tight`}>与故事相遇</h2>
            <p className={`${isMobileMode ? 'text-sm leading-relaxed' : 'text-lg'} opacity-90 font-medium max-w-[85%] mb-4`}>开启你的跨次元对话之旅，每一个选择都将改变命运</p>
            <div className="flex honor-flex-fix" style={{ display: 'flex' }}>
              <button className={`bg-white text-sherry-600 font-black rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 ${isMobileMode ? 'px-6 py-2.5 text-xs' : 'px-8 py-3 text-base'}`}>
                立即探索
              </button>
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-orange-400/20 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Section Title */}
      <div className={`${isMobileMode ? 'px-4 py-4' : 'px-8 py-6'} flex items-center justify-between honor-flex-fix w-full`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 className={`${isMobileMode ? 'text-lg' : 'text-xl'} font-black text-gray-900 flex items-center gap-2 honor-flex-fix`} style={{ display: 'flex', alignItems: 'center' }}>
          <span className="w-1.5 h-6 bg-sherry-500 rounded-full"></span>
          热门推荐
        </h3>
        <button className="text-xs font-bold text-sherry-500 hover:text-sherry-600 transition-colors bg-sherry-50 px-3 py-1.5 rounded-full">查看全部</button>
      </div>

      {/* Story Grid */}
      <div className={`
        w-full
        ${isMobileMode 
          ? 'grid grid-cols-1 gap-4 px-4' 
          : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-8'}
      `}>
        {novels.map(novel => (
          <div 
            key={novel.id} 
            onClick={() => onSelectStory(novel.id)}
            className={`
              group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 honor-flex-fix w-full
              ${isMobileMode ? 'flex flex-row h-40' : 'flex flex-col'}
            `}
            style={{ display: 'flex', flexDirection: isMobileMode ? 'row' : 'column' }}
          >
            <div className={`relative overflow-hidden flex-shrink-0 honor-avatar-fix ${isMobileMode ? 'w-32 h-40' : 'w-full aspect-[3/4]'}`} style={isMobileMode ? { width: '128px', height: '160px' } : {}}>
              <img 
                src={novel.cover} 
                alt={novel.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute top-2 left-2 bg-sherry-500/90 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                连载中
              </div>
            </div>
            <div className={`flex-1 flex flex-col justify-between min-w-0 honor-flex-fix ${isMobileMode ? 'p-4' : 'p-5'}`} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="min-w-0 flex flex-col honor-flex-fix" style={{ display: 'flex', flexDirection: 'column' }}>
                <h4 className={`font-black text-gray-900 group-hover:text-sherry-500 transition-colors truncate ${isMobileMode ? 'text-base' : 'text-lg line-clamp-2'}`}>
                  {novel.title}
                </h4>
                <div className="flex flex-row items-center gap-2 mt-1 honor-flex-fix" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <p className={`${isMobileMode ? 'text-[11px]' : 'text-sm'} text-gray-400 font-bold italic truncate`}>@ {novel.author}</p>
                </div>
                <p className={`${isMobileMode ? 'text-[11px]' : 'text-sm'} text-gray-400 mt-2 line-clamp-2 leading-relaxed font-medium word-break-all`} style={{ wordBreak: 'break-word' }}>
                  {novel.description}
                </p>
              </div>
              <div className="flex flex-row items-center justify-between mt-3 honor-flex-fix" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="flex flex-row gap-1.5 overflow-hidden honor-flex-fix" style={{ display: 'flex', flexDirection: 'row' }}>
                  {novel.tags.slice(0, 2).map(tag => (
                    <span key={tag} className={`${isMobileMode ? 'text-[9px]' : 'text-xs'} bg-gray-50 text-gray-500 font-bold px-2 py-0.5 rounded-md border border-gray-100 whitespace-nowrap`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-row items-center gap-1 text-sherry-500 flex-shrink-0 honor-flex-fix" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Heart size={isMobileMode ? 12 : 14} fill="currentColor" />
                  <span className="text-[10px] font-black tracking-tighter">9.8</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
