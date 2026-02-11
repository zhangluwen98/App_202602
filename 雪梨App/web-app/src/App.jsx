import React, { useState } from 'react';
import Home from './components/Home';
import ImmersiveReader from './components/ImmersiveReader';
import { NOVELS } from './novels/index';
import { Home as HomeIcon, Book, User } from 'lucide-react';

function App() {
  const [view, setView] = useState('home');
  const [selectedStoryId, setSelectedStoryId] = useState(null);

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
      <div className="w-full sm:max-w-md bg-white min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
        
        {view === 'home' && (
          <>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <Home novels={NOVELS} onSelectStory={handleSelectStory} />
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
          />
        )}

      </div>
    </div>
  );
}

export default App;
