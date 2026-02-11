import React, { useState } from 'react';
import Home from './components/Home';
import ImmersiveReader from './components/ImmersiveReader';
import { NOVELS } from './novels/index';
import { Home as HomeIcon, Book, User, Smartphone, Monitor } from 'lucide-react';

function App() {
  const [view, setView] = useState('home');
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [isMobileMode, setIsMobileMode] = useState(true);

  const handleSelectStory = (storyId) => {
    setSelectedStoryId(storyId);
    setView('reader');
  };

  const handleBackToHome = () => {
    setView('home');
    setSelectedStoryId(null);
  };

  return (
    <div className="flex justify-center bg-gray-200 min-h-screen font-sans">
      <div className={`${isMobileMode ? 'w-[448px]' : 'w-full max-w-6xl'} bg-white min-h-screen shadow-2xl relative overflow-hidden flex flex-col`}>
        
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={() => setIsMobileMode(!isMobileMode)}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            {isMobileMode ? (
              <>
                <Smartphone size={16} className="text-sherry-500" />
                <span className="text-xs font-medium text-gray-700">移动版</span>
              </>
            ) : (
              <>
                <Monitor size={16} className="text-sherry-500" />
                <span className="text-xs font-medium text-gray-700">网页版</span>
              </>
            )}
          </button>
        </div>
        
        {view === 'home' && (
          <>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <Home novels={NOVELS} onSelectStory={handleSelectStory} isMobileMode={isMobileMode} />
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
            isMobileMode={isMobileMode}
          />
        )}

      </div>
    </div>
  );
}

export default App;
