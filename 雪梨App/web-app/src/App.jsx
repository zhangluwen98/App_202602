import { useState, useEffect } from 'react';
import Home from './components/Home';
import ImmersiveReader from './components/ImmersiveReader';
import { Home as HomeIcon, Book, User, Smartphone, Monitor } from 'lucide-react';

function App() {
  const [view, setView] = useState('home');
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [novels, setNovels] = useState([]);
  const [isMobileMode, setIsMobileMode] = useState(true);
  const [isRealMobile, setIsRealMobile] = useState(false);
  const [isHonorSim, setIsHonorSim] = useState(false);

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/novels');
        if (!response.ok) throw new Error('Failed to fetch novels');
        const data = await response.json();
        setNovels(data);
      } catch (error) {
        console.error('Error fetching novels:', error);
      }
    };
    fetchNovels();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobile = mobileRegex.test(userAgent) || window.innerWidth <= 768;
      const isHonor = userAgent.includes('honor') || userAgent.includes('huawei') || userAgent.includes('magic');
      
      setIsRealMobile(isMobile);
      if (isMobile) {
        setIsMobileMode(true);
      }
      if (isHonor && isMobile) {
        setIsHonorSim(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
    <div className="bg-gray-100 min-h-screen font-sans flex justify-center items-start overflow-x-hidden">
      {/* Main Container: Full width on mobile, limited on desktop in mobile mode */}
      <div className={`
        w-full 
        ${isMobileMode ? (isRealMobile ? 'max-w-none' : 'max-w-md my-4 rounded-3xl') : 'max-w-6xl my-0 rounded-none'} 
        bg-white min-h-screen shadow-2xl relative overflow-hidden flex flex-col transition-all duration-500
        ${isHonorSim ? 'border-x-[10px] border-t-[35px] border-b-[15px] border-gray-900 rounded-[45px] mt-4 mb-8 h-[820px] min-h-0' : ''}
      `} style={isHonorSim ? { height: '820px', maxHeight: '90vh' } : {}}>
        
        {/* Mock Status Bar for Honor Sim */}
        {isHonorSim && (
          <div className="absolute top-0 left-0 w-full h-[35px] bg-gray-900 flex justify-between items-center px-8 z-[70]">
            <span className="text-white text-[11px] font-bold">9:41</span>
            <div className="flex gap-2 items-center">
              <div className="flex gap-0.5">
                <div className="w-0.5 h-1 bg-white/40"></div>
                <div className="w-0.5 h-1.5 bg-white/40"></div>
                <div className="w-0.5 h-2 bg-white"></div>
                <div className="w-0.5 h-2.5 bg-white"></div>
              </div>
              <div className="w-5 h-2.5 rounded-[2px] border border-white/40 relative">
                <div className="absolute left-0.5 top-0.5 bottom-0.5 right-1.5 bg-white rounded-[1px]"></div>
              </div>
            </div>
          </div>
        )}
        {!isRealMobile && (
          <div className="fixed top-6 right-6 z-[150] flex flex-col gap-3">
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
          <div className="flex flex-col h-full overflow-hidden honor-flex-fix" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
              <Home novels={novels} onSelectStory={handleSelectStory} isMobileMode={isMobileMode || isRealMobile} />
            </div>
            
            <div className="h-16 bg-white border-t border-gray-100 flex flex-row justify-around items-center fixed bottom-0 left-0 right-0 w-full z-[100] safe-pb honor-flex-fix" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', position: isRealMobile ? 'fixed' : 'absolute' }}>
              <div className="flex flex-col items-center text-sherry-500 cursor-pointer py-1 px-4">
                <HomeIcon size={20} />
                <span className="text-[10px] font-bold mt-1">首页</span>
              </div>
              <div className="flex flex-col items-center text-gray-400 cursor-pointer hover:text-gray-600 transition-colors py-1 px-4">
                <Book size={20} />
                <span className="text-[10px] font-medium mt-1">书架</span>
              </div>
              <div className="flex flex-col items-center text-gray-400 cursor-pointer hover:text-gray-600 transition-colors py-1 px-4">
                <User size={20} />
                <span className="text-[10px] font-medium mt-1">我的</span>
              </div>
            </div>
          </div>
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
