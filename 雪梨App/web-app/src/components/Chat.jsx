import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, Gift, Send, Quote, Sparkles, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chat({ character, onClose, initialContext }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'character', text: character.initialMessage, time: '刚刚' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthorMode, setIsAuthorMode] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialContext) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'system',
        type: 'quote',
        text: initialContext,
        time: '刚刚'
      }]);
    }
  }, [initialContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: isAuthorMode ? 'system' : 'user', // Author sends as 'system' (Narrator)
      text: inputValue,
      time: '刚刚',
      isAuthorAction: isAuthorMode
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    
    if (!isAuthorMode) {
      setIsTyping(true);
      // Mock Reply
      setTimeout(() => {
        const replies = [
          "很有趣的想法。",
          "你真的这么觉得吗？",
          "我不知道该怎么回答你...",
          "这种感觉...很奇妙。",
          "哼，勉强算你说的对。"
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'character',
          text: randomReply,
          time: '刚刚'
        }]);
        setIsTyping(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-full">
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b shadow-sm z-10 transition-colors duration-300 ${isAuthorMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className={`p-1 rounded-full ${isAuthorMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
            <ArrowLeft size={24} />
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
              <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className={`font-bold text-sm ${isAuthorMode ? 'text-white' : 'text-gray-800'}`}>{character.name}</h3>
            <div className="flex items-center gap-1">
               {isAuthorMode ? (
                 <span className="text-xs text-purple-400 font-medium flex items-center gap-1">
                   <Wand2 size={10} /> 作者模式已开启
                 </span>
               ) : (
                 <>
                   <HeartIcon filled />
                   <span className="text-xs text-sherry-500 font-medium">Lv.3 亲密无间</span>
                 </>
               )}
            </div>
          </div>
        </div>
        
        {/* Author Mode Toggle */}
        <button 
          onClick={() => setIsAuthorMode(!isAuthorMode)}
          className={`p-2 rounded-full transition-colors ${isAuthorMode ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400 hover:text-purple-600'}`}
        >
          <Wand2 size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 honor-flex-fix ${isAuthorMode ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ display: 'flex', flexDirection: 'column' }}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex honor-flex-fix ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}
          >
            {/* System/Quote Message */}
            {msg.sender === 'system' ? (
              <div className="w-full flex justify-center my-2 honor-flex-fix" style={{ display: 'flex', justifyContent: 'center' }}>
                {msg.type === 'quote' ? (
                  <div className="bg-white/80 border border-sherry-200 rounded-lg p-3 max-w-[85%] flex gap-2 text-sm text-gray-600 italic honor-flex-fix" style={{ display: 'flex' }}>
                    <Quote size={16} className="text-sherry-400 flex-shrink-0 honor-avatar-fix" style={{ flexShrink: 0 }} />
                    <span className="word-break-all" style={{ wordBreak: 'break-word' }}>{msg.text}</span>
                  </div>
                ) : (
                  // Author Action / Narrator
                  <div className="bg-purple-50 border border-purple-200 text-purple-800 text-xs font-medium px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm honor-flex-fix" style={{ display: 'flex', alignItems: 'center' }}>
                    <Sparkles size={12} className="flex-shrink-0 honor-avatar-fix" style={{ flexShrink: 0 }} />
                    <span className="word-break-all" style={{ wordBreak: 'break-word' }}>{msg.text}</span>
                  </div>
                )}
              </div>
            ) : (
              // Normal Chat Message
              <div 
                className={`flex items-end max-w-[80%] gap-2 honor-flex-fix ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                style={{ display: 'flex', flexDirection: msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row', alignItems: 'flex-end' }}
              >
                {msg.sender === 'character' && (
                  <div 
                    className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mb-1 honor-avatar-fix border border-gray-100 shadow-sm"
                    style={{ width: '32px', height: '32px', flexShrink: 0 }}
                  >
                    <img src={character.avatar} alt="Avatar" className="w-full h-full object-cover honor-avatar-fix" style={{ width: '100%', height: '100%', display: 'block' }} />
                  </div>
                )}
                
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm word-break-all honor-flex-fix
                    ${msg.sender === 'user' 
                      ? 'bg-sherry-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-700 rounded-bl-none border border-gray-100'
                    }`}
                  style={{ wordBreak: 'break-word', display: 'flex', flexDirection: 'column' }}
                >
                  {msg.text}
                </div>
              </div>
            )}
          </motion.div>
        ))}
        
        {isTyping && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start honor-flex-fix" style={{ display: 'flex', justifyContent: 'flex-start' }}>
             <div className="flex items-end gap-2 honor-flex-fix" style={{ display: 'flex', alignItems: 'flex-end' }}>
               <div 
                 className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mb-1 honor-avatar-fix border border-gray-100 shadow-sm"
                 style={{ width: '32px', height: '32px', flexShrink: 0 }}
               >
                  <img src={character.avatar} alt="Avatar" className="w-full h-full object-cover honor-avatar-fix" style={{ width: '100%', height: '100%', display: 'block' }} />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex gap-1 honor-flex-fix" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <span className="w-1.5 h-1.5 bg-sherry-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-sherry-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-sherry-500 rounded-full animate-bounce delay-150"></span>
                </div>
             </div>
           </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`px-4 py-3 border-t flex items-center gap-3 transition-colors honor-flex-fix safe-pb ${isAuthorMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`} style={{ display: 'flex', alignItems: 'center' }}>
        {!isAuthorMode && (
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <Mic size={24} />
          </button>
        )}
        <div className={`flex-1 rounded-full px-4 py-2 flex items-center honor-flex-fix ${isAuthorMode ? 'bg-gray-700' : 'bg-gray-100'}`} style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={isAuthorMode ? "输入剧情旁白或系统指令..." : "和TA说点什么..."}
            className={`flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-400 ${isAuthorMode ? 'text-white' : 'text-gray-700'}`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{ width: '100%' }}
          />
        </div>
        {!isAuthorMode && (
          <button className="text-gray-400 hover:text-gray-600 p-1">
             <Gift size={24} />
          </button>
        )}
        <button 
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className={`p-2 rounded-full transition-colors flex-shrink-0 ${
            inputValue.trim() 
              ? (isAuthorMode ? 'bg-purple-600 text-white' : 'bg-sherry-500 text-white shadow-md') 
              : (isAuthorMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-white')
          }`}
          style={{ flexShrink: 0 }}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="12" 
      height="12" 
      viewBox="0 0 24 24" 
      fill={filled ? "#FF8A65" : "none"} 
      stroke={filled ? "#FF8A65" : "currentColor"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
