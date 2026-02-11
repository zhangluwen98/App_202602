import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import ImmersiveReader from './components/ImmersiveReader';
import { NOVELS } from './novels/index';
import { Home as HomeIcon, Book, User, Smartphone, Monitor } from 'lucide-react';

function App() {
  const [view, setView] = useState('home');
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [isMobileMode, setIsMobileMode] = useState(true);
  const [isRealMobile, setIsRealMobile] = useState(false);
  const [isHonorSim, setIsHonorSim] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobile = mobileRegex.test(userAgent);
      const isHonor = userAgent.includes('honor') || userAgent.includes('huawei') || userAgent.includes('magic');
      
      setIsRealMobile(isMobile);
      if (isMobile) {
        setIsMobileMode(true);
      }
      if (isHonor) {
        setIsHonorSim(true);
      }
    };
    checkMobile();
  }, []);

  const handleSelectStory = (storyId) => {
    setSelectedStoryId(storyId);
    setView('reader');
  };

  const handleBackToHome = () => {
    setView('home');
    setSelectedStoryId(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans flex justify-center">
      {/* Main Container: Full width on mobile, limited on desktop in mobile mode */}
      <div className={`
        ${(isMobileMode || isRealMobile) ? (isRealMobile ? 'w-full' : 'w-full max-w-md') : 'w-full max-w-6xl'} 
        bg-white min-h-screen shadow-xl relative overflow-hidden flex flex-col transition-all duration-300
        ${isHonorSim ? 'border-x-8 border-t-[30px] border-black rounded-[40px] mt-4 mb-4 h-[800px] min-h-0' : ''}
      `}>
        
        {/* Mock Status Bar for Honor Sim */}
        {isHonorSim && (
          <div className="absolute top-0 left-0 w-full h-[30px] bg-black flex justify-between items-center px-8 z-[70]">
            <span className="text-white text-[10px] font-bold">9:41</span>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full border border-white/40"></div>
              <div className="w-3 h-3 rounded-full bg-white"></div>
            </div>
          </div>
        )}
        {!isRealMobile && (
          <div className="absolute top-4 right-4 z-[60] flex flex-col gap-2">
            <button 
              onClick={() => setIsMobileMode(!isMobileMode)}
              className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-100 group"
            >
              {isMobileMode ? (
                <>
                  <Monitor size={16} className="text-sherry-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-gray-700">网页版</span>
                </>
              ) : (
                <>
                  <Smartphone size={16} className="text-sherry-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-gray-700">移动版</span>
                </>
              )}
            </button>
            
            <button 
              onClick={() => setIsHonorSim(!isHonorSim)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-100 group ${isHonorSim ? 'bg-sherry-500 text-white' : 'bg-white/80 backdrop-blur-sm text-gray-700'}`}
            >
              <Smartphone size={16} className={isHonorSim ? 'text-white' : 'text-sherry-500'} />
              <span className="text-xs font-bold">模拟荣耀</span>
            </button>
          </div>
        )}
        
        {view === 'home' && (
          <>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <Home novels={NOVELS} onSelectStory={handleSelectStory} isMobileMode={isMobileMode || isRealMobile} />
            </div>
            
            <div className="h-14 bg-white border-t border-gray-100 flex justify-around items-center absolute bottom-0 w-full z-10">
              <div className="flex flex-col items-center gap-0.5 text-sherry-500 cursor-pointer">
                <HomeIcon size={18} />
                <span className="text-[9px] font-medium">首页</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
                <Book size={18} />
                <span className="text-[9px] font-medium">书架</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
                <User size={18} />
                <span className="text-[9px] font-medium">我的</span>
              </div>
            </div>
          </>
        )}

        {view === 'reader' && selectedStoryId && (
          <ImmersiveReader 
            storyId={selectedStoryId} 
            onBack={handleBackToHome}
            isMobileMode={isMobileMode || isRealMobile}
          />
        )}

      </div>
    </div>
  );
}

export default App;
