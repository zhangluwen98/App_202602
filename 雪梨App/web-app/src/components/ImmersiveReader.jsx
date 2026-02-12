import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Settings, Share2, Sparkles, Send, BookOpen, X, Heart, Quote, CheckCircle, Gift, ChevronRight, Wand2, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImmersiveReader({ storyId, onBack, isMobileMode }) {
  const [story, setStory] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthorMode, setIsAuthorMode] = useState(false);
  const [activeQuote, setActiveQuote] = useState(null);
  const [dialogueCount, setDialogueCount] = useState(0);
  const [showChapterEnding, setShowChapterEnding] = useState(false);
  const [triggeredParagraphs, setTriggeredParagraphs] = useState(new Set());
  const [chapterDividerAdded, setChapterDividerAdded] = useState(false);
  const [showChapterDirectory, setShowChapterDirectory] = useState(false);
  const [unlockedChapters, setUnlockedChapters] = useState(new Set([0]));
  const [activeCharacter, setActiveCharacter] = useState(null);
  const [characterIntimacy, setCharacterIntimacy] = useState({});
  const [showIntimacyChange, setShowIntimacyChange] = useState(null);
  const [currentParagraphs, setCurrentParagraphs] = useState([]);
  const [showChapterComplete, setShowChapterComplete] = useState(false);
  const [userChoices, setUserChoices] = useState([]);
  const messagesEndRef = useRef(null);

  const validateStoryAvatars = (storyData) => {
    const errors = [];
    const warnings = [];
    
    if (!storyData.characters || !Array.isArray(storyData.characters)) {
      errors.push('故事缺少角色配置');
      return { errors, warnings };
    }
    
    const allSpeakers = new Set();
    
    storyData.chapters.forEach(chapter => {
      chapter.paragraphs.forEach(paragraph => {
        if (paragraph.parts) {
          paragraph.parts.forEach(part => {
            if (part.type === 'dialogue' && part.speaker && part.speaker !== '我') {
              allSpeakers.add(part.speaker);
            }
          });
        }
      });
      
      if (chapter.extendedParagraphs) {
        chapter.extendedParagraphs.forEach(paragraph => {
          if (paragraph.parts) {
            paragraph.parts.forEach(part => {
              if (part.type === 'dialogue' && part.speaker && part.speaker !== '我') {
                allSpeakers.add(part.speaker);
              }
            });
          }
        });
      }
    });
    
    allSpeakers.forEach(speaker => {
      const character = storyData.characters.find(c => {
        const exactNameMatch = c.name === speaker;
        const exactIdMatch = c.id === speaker;
        const nameIncludes = c.name.includes(speaker);
        const speakerIncludes = speaker.includes(c.name.split(' ')[0]);
        const speakerIncludesFullName = speaker.includes(c.name);
        
        return exactNameMatch || exactIdMatch || nameIncludes || speakerIncludes || speakerIncludesFullName;
      });
      
      if (!character) {
        errors.push(`对话角色 "${speaker}" 未在角色配置中找到`);
      } else if (!character.avatar) {
        errors.push(`角色 "${character.name}" 缺少头像配置`);
      } else if (!character.avatar.startsWith('http')) {
        warnings.push(`角色 "${character.name}" 的头像URL可能无效: ${character.avatar}`);
      }
    });
    
    storyData.characters.forEach(char => {
      if (!char.avatar) {
        warnings.push(`角色 "${char.name}" 配置了但未设置头像`);
      }
    });
    
    return { errors, warnings };
  };

  useEffect(() => {
    loadStory();
  }, [storyId]);

  const loadStory = async () => {
    try {
      const API_BASE = `http://${window.location.hostname}:3001`;
      const response = await fetch(`${API_BASE}/api/novels/${storyId}`);
      if (!response.ok) {
        throw new Error(`Failed to load story: ${response.statusText}`);
      }
      const storyData = await response.json();
      setStory(storyData);
      
      const { errors, warnings } = validateStoryAvatars(storyData);
      if (errors.length > 0) {
        console.error('头像校验错误:', errors);
      }
      if (warnings.length > 0) {
        console.warn('头像校验警告:', warnings);
      }
      
      const intimacyMap = {};
      storyData.characters.forEach(char => {
        if (char.intimacy) {
          intimacyMap[char.id] = {
            currentStatus: char.intimacy.currentStatus,
            upgradePath: char.intimacy.upgradePath
          };
        }
      });
      setCharacterIntimacy(intimacyMap);
      
      initializeChapter(storyData, 0);
    } catch (error) {
      console.error('Failed to load story:', error);
    }
  };

  const initializeChapter = (storyData, chapterIndex) => {
    const chapter = storyData.chapters[chapterIndex];
    const character = storyData.characters[0];
    
    const initialMessages = [
      { id: 1, sender: 'narrator', type: 'story', text: chapter.title, isTitle: true },
      ...chapter.paragraphs.map((p, index) => ({
        id: 2 + index,
        sender: 'narrator',
        type: 'story',
        parts: p.parts,
        paragraphId: p.id
      })),
      { id: 100, sender: 'character', text: chapter.initialMessage || character.initialMessage, time: '刚刚' }
    ];
    
    setMessages(initialMessages);
    setCurrentParagraphs(chapter.paragraphs);
    setDialogueCount(0);
    setShowChapterEnding(false);
    setShowChapterComplete(false);
    setTriggeredParagraphs(new Set());
    setChapterDividerAdded(false);
    setActiveCharacter(storyData.characters[0]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getCharacterBySpeaker = (speaker) => {
    if (speaker === '我') return null;
    
    const character = story?.characters?.find(c => {
      const exactNameMatch = c.name === speaker;
      const exactIdMatch = c.id === speaker;
      const nameIncludes = c.name.includes(speaker);
      const speakerIncludes = speaker.includes(c.name.split(' ')[0]);
      const speakerIncludesFullName = speaker.includes(c.name);
      
      return exactNameMatch || exactIdMatch || nameIncludes || speakerIncludes || speakerIncludesFullName;
    });
    
    if (!character) {
      console.warn(`未找到角色: ${speaker}，请检查角色配置。可用角色:`, story?.characters?.map(c => c.name));
      return story?.characters?.[0];
    }
    
    return character;
  };

  const renderTextWithDialogues = (parts, paragraphId) => {
    if (!parts || !Array.isArray(parts)) return null;
    
    return parts.map((part, index) => {
      if (part.type === 'dialogue') {
        const isProtagonist = part.speaker === '我';
        const isSystem = part.speaker === '系统';
        const isLeft = !isProtagonist;
        const character = getCharacterBySpeaker(part.speaker);
        
        return (
          <div key={`${paragraphId}-dialogue-${index}`} className="w-full flex items-start my-4 honor-flex-fix" style={{ display: 'flex', flexDirection: isLeft ? 'row' : 'row-reverse', alignItems: 'flex-start', justifyContent: isLeft ? 'flex-start' : 'flex-end' }}>
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className={`flex items-start gap-3 honor-flex-fix ${isLeft ? '' : 'flex-row-reverse'}`}
              style={{ display: 'flex', flexDirection: isLeft ? 'row' : 'row-reverse', alignItems: 'flex-start', maxWidth: isMobileMode ? '90%' : '75%' }}
            >
              {isLeft && character && (
                <div 
                  className={`rounded-xl overflow-hidden flex-shrink-0 shadow-sm border honor-avatar-fix ${isSystem ? 'bg-gray-100 border-gray-200 p-1.5' : 'border-gray-100'}`}
                  style={{ width: isMobileMode ? '36px' : '44px', height: isMobileMode ? '36px' : '44px', minWidth: isMobileMode ? '36px' : '44px', flexShrink: 0 }}
                >
                  <img src={character.avatar} alt="Avatar" className="w-full h-full object-cover honor-avatar-fix" style={{ width: '100%', height: '100%', display: 'block' }} />
                </div>
              )}
              <div className="flex flex-col gap-1 honor-flex-fix" style={{ display: 'flex', flexDirection: 'column', alignItems: isLeft ? 'flex-start' : 'flex-end', minWidth: 0 }}>
                {isLeft && character && (
                  <span className={`text-[10px] font-black ml-1 mb-0.5 ${isSystem ? 'text-sherry-500' : 'text-gray-400'}`}>{character.name}</span>
                )}
                <div className={`
                  px-4 py-3 shadow-sm text-sm leading-relaxed word-break-all
                  ${isProtagonist 
                    ? 'bg-gradient-to-br from-sherry-500 to-sherry-600 text-white rounded-2xl rounded-tr-none' 
                    : isSystem
                    ? 'bg-gray-100 text-gray-700 rounded-2xl rounded-tl-none border border-gray-200 font-medium'
                    : 'bg-white text-gray-700 rounded-2xl rounded-tl-none border border-gray-100'
                  }
                `} style={{ wordBreak: 'break-word' }}>
                  {part.text}
                </div>
              </div>
            </motion.div>
          </div>
        );
      }
      return (
        <motion.div 
          key={`${paragraphId}-narration-${index}`} 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: index * 0.02 }}
          className="text-sm sm:text-base leading-6 sm:leading-7 text-gray-700 my-2 px-1"
        >
          {part.text}
        </motion.div>
      );
    });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleParagraphClick = (paragraphId, parts) => {
    setActiveQuote(paragraphId);
    const text = parts.map(p => p.text).join('');
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'system',
      type: 'quote',
      text: text,
      time: '刚刚'
    }]);
  };

  const checkDialogueTrigger = (chapter) => {
    if (!chapter.dialogueTriggers) return null;
    
    const settings = story?.settings || {};
    const minDialogues = settings.minDialoguesPerChapter || 1;
    
    if (dialogueCount < minDialogues) return null;
    
    for (const trigger of chapter.dialogueTriggers) {
      if (!triggeredParagraphs.has(trigger.paragraphId)) {
        return trigger;
      }
    }
    
    return null;
  };

  const triggerStoryProgression = (trigger) => {
    const chapter = story.chapters[currentChapterIndex];
    const extendedParagraphs = chapter.extendedParagraphs.filter(p => 
      trigger.nextParagraphs.includes(p.id)
    );
    
    const newMessages = extendedParagraphs.map((p, index) => ({
      id: Date.now() + index,
      sender: 'narrator',
      type: 'story',
      parts: p.parts,
      paragraphId: p.id,
      isExtended: true
    }));
    
    setMessages(prev => [...prev, ...newMessages]);
    setCurrentParagraphs(prev => [...prev, ...extendedParagraphs]);
    setTriggeredParagraphs(prev => new Set([...prev, trigger.paragraphId]));
    
    if (!chapterDividerAdded) {
      if (!chapter.isLastChapter) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now() + 1000,
            sender: 'system',
            type: 'chapter-divider',
            text: '本章结束'
          }]);
          setChapterDividerAdded(true);
        }, 2000);
      } else {
        setTimeout(() => {
          setShowChapterEnding(true);
        }, 2000);
      }
    }
  };

  const handleUserChoice = (chapterId, choiceText, characterId) => {
    const choice = { chapterId, choice: choiceText, characterId, timestamp: Date.now() };
    setUserChoices(prev => [...prev, choice]);
    
    if (characterId && characterIntimacy[characterId]) {
      const intimacyData = characterIntimacy[characterId];
      const upgradePath = intimacyData.upgradePath;
      
      for (let i = 0; i < upgradePath.length; i++) {
        const level = upgradePath[i];
        if (level.triggerConditions.some(condition => 
          condition.chapterId === chapterId && condition.choice === choiceText
        )) {
          if (level.status !== intimacyData.currentStatus) {
            const newIntimacy = { ...characterIntimacy };
            newIntimacy[characterId] = {
              ...intimacyData,
              currentStatus: level.status
            };
            setCharacterIntimacy(newIntimacy);
            
            const character = story.characters.find(c => c.id === characterId);
            setShowIntimacyChange({
              characterName: character?.name || '未知角色',
              oldStatus: intimacyData.currentStatus,
              newStatus: level.status,
              description: level.description
            });
            
            setTimeout(() => {
              setShowIntimacyChange(null);
            }, 4000);
          }
          break;
        }
      }
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: isAuthorMode ? 'narrator' : 'user',
      text: inputValue,
      time: '刚刚',
      isAuthorAction: isAuthorMode
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setActiveQuote(null);
    
    if (!isAuthorMode) {
      setDialogueCount(prev => prev + 1);
      setIsTyping(true);
      
      setTimeout(() => {
        const chapter = story.chapters[currentChapterIndex];
        const character = story.characters[0];
        setActiveCharacter(character);
        
        const trigger = checkDialogueTrigger(chapter);
        
        if (trigger) {
          const contextReplies = [
            "你问到了关键点...",
            "让我告诉你更多...",
            "这正是我想说的...",
            "看来你开始理解了..."
          ];
          const randomReply = contextReplies[Math.floor(Math.random() * contextReplies.length)];
          
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: 'character',
            text: randomReply,
            time: '刚刚'
          }]);
          
          setTimeout(() => {
            triggerStoryProgression(trigger);
          }, 1000);
        } else {
          const normalReplies = [
            "很有趣的想法。",
            "你真的这么觉得吗？",
            "我不知道该怎么回答你...",
            "这种感觉...很奇妙。",
            "哼，勉强算你说的对。"
          ];
          const randomReply = normalReplies[Math.floor(Math.random() * normalReplies.length)];
          
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: 'character',
            text: randomReply,
            time: '刚刚'
          }]);
        }
        
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleChapterChoice = (choice) => {
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: choice.dialoguePrompt,
      time: '刚刚'
    };
    
    setMessages(prev => [...prev, newMsg]);
    setShowChapterEnding(false);
    
    const currentChapter = story.chapters[currentChapterIndex];
    const characterId = choice.characterId || currentChapter.characterId;
    
    handleUserChoice(currentChapter.id, choice.dialoguePrompt, characterId);
    
    setTimeout(() => {
      if (choice.nextChapter) {
        const nextChapterIndex = story.chapters.findIndex(c => c.id === choice.nextChapter);
        if (nextChapterIndex !== -1) {
          setUnlockedChapters(prev => new Set([...prev, nextChapterIndex]));
          setCurrentChapterIndex(nextChapterIndex);
          initializeChapter(story, nextChapterIndex);
        }
      }
    }, 1000);
  };

  if (!story) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F6] to-[#F5F3EF]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sherry-200 border-t-sherry-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  const chapter = story.chapters[currentChapterIndex];
  const character = story.characters[0];

  return (
    <div className={`fixed inset-0 flex flex-col z-50 ${isAuthorMode ? 'bg-gray-900' : 'bg-gray-50'} ${isMobileMode ? 'w-full h-full' : ''}`} style={isMobileMode ? { width: '100vw', height: '100vh', left: 0, right: 0, top: 0, bottom: 0 } : {}}>
      {/* Header */}
      <div className={`sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between honor-flex-fix ${isMobileMode ? 'w-full' : ''}`} style={{ minHeight: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 min-w-0 px-3 text-center flex flex-col items-center justify-center honor-flex-fix" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className={`font-black text-gray-900 truncate w-full ${isMobileMode ? 'text-[13px]' : 'text-base'}`} style={{ maxWidth: '180px' }}>{story.title}</h2>
          <div className="flex items-center gap-1 mt-0.5 honor-flex-fix" style={{ display: 'flex', alignItems: 'center' }}>
            <span className="w-1 h-1 bg-sherry-400 rounded-full flex-shrink-0"></span>
            <p className="text-[10px] text-gray-400 font-bold truncate max-w-[150px]">
              {chapter.title}
            </p>
          </div>
        </div>
        <div className="flex items-center flex-shrink-0 honor-flex-fix" style={{ display: 'flex', alignItems: 'center' }}>
          <button className="p-2 text-gray-400 hover:text-gray-600"><Share2 size={18} /></button>
          <button 
            onClick={() => setShowChapterDirectory(!showChapterDirectory)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <BookOpen size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600"><Settings size={18} /></button>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 overflow-y-auto honor-flex-fix ${isMobileMode ? 'w-full px-3 py-3 space-y-2' : 'px-6 py-6 space-y-4'} ${isAuthorMode ? 'bg-gray-900' : 'bg-transparent'}`} style={{ display: 'flex', flexDirection: 'column' }}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            {/* Story Narrator (Non-bubble) */}
            {msg.sender === 'narrator' && msg.type === 'story' && (
              <div className="w-full">
                {msg.isTitle ? (
                  <h1 className={`${isMobileMode ? 'text-2xl' : 'text-4xl'} font-bold text-gray-900 mb-4 text-center`}>{msg.text}</h1>
                ) : (
                  <div 
                    onClick={() => handleParagraphClick(msg.paragraphId, msg.parts)}
                    className={`
                      cursor-pointer rounded-xl transition-all duration-300
                      ${isMobileMode ? 'px-3 py-2.5' : 'px-6 py-4'}
                      ${activeQuote === msg.paragraphId 
                        ? 'bg-gradient-to-r from-sherry-50 to-orange-50 shadow-md ring-2 ring-sherry-200' 
                        : 'hover:bg-white/60 hover:shadow-sm'
                    }
                    `}
                  >
                    {renderTextWithDialogues(msg.parts, msg.paragraphId)}
                    <AnimatePresence>
                      {activeQuote === msg.paragraphId && (
                        <motion.div 
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          className={`mt-2 flex items-center gap-2 ${isMobileMode ? 'text-xs' : 'text-sm'} text-sherry-600 font-medium`}
                        >
                          <Sparkles size={isMobileMode ? 14 : 18} />
                          <span>已引用到对话</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {/* Quote Message */}
            {msg.sender === 'system' && msg.type === 'quote' && (
              <div className="w-full flex justify-center my-2 honor-flex-fix" style={{ display: 'flex', justifyContent: 'center' }}>
                <div className={`bg-white/90 border-l-4 border-sherry-400 rounded-r-lg shadow-sm honor-flex-fix ${isMobileMode ? 'p-3 max-w-[85%]' : 'p-6 max-w-[70%]'}`} style={{ display: 'flex' }}>
                  <div className="flex items-start gap-2 honor-flex-fix" style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Quote size={isMobileMode ? 14 : 20} className="text-sherry-400 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col honor-flex-fix" style={{ display: 'flex', flexDirection: 'column' }}>
                      <p className={`${isMobileMode ? 'text-xs' : 'text-sm'} text-sherry-600 font-medium mb-1`}>故事引用</p>
                      <p className={`${isMobileMode ? 'text-sm' : 'text-base'} text-gray-600 italic leading-6 word-break-all`} style={{ wordBreak: 'break-word' }}>{msg.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter Divider */}
            {msg.sender === 'system' && msg.type === 'chapter-divider' && (
              <div className="w-full flex flex-col items-center justify-center my-4 honor-flex-fix" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className={`flex items-center gap-3 w-full honor-flex-fix ${isMobileMode ? 'max-w-[80%]' : 'max-w-[60%]'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className={`${isMobileMode ? 'text-xs' : 'text-sm'} text-gray-500 font-medium whitespace-nowrap px-2`}>{msg.text}</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
                {!chapter.isLastChapter && story.chapters[currentChapterIndex + 1] && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    onClick={() => {
                      const nextChapterIndex = currentChapterIndex + 1;
                      setUnlockedChapters(prev => new Set([...prev, nextChapterIndex]));
                      setCurrentChapterIndex(nextChapterIndex);
                      initializeChapter(story, nextChapterIndex);
                    }}
                    className={`mt-3 bg-gradient-to-r from-sherry-500 to-orange-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 border-none outline-none honor-flex-fix ${isMobileMode ? 'px-6 py-2.5 text-sm' : 'px-8 py-3 text-base'}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <BookOpen size={isMobileMode ? 16 : 20} />
                    <span>探索下一章：{story.chapters[currentChapterIndex + 1].title}</span>
                  </motion.button>
                )}
              </div>
            )}

            {/* Author Narrator (Non-bubble) */}
            {msg.sender === 'narrator' && !msg.type && (
              <div className="w-full flex justify-center my-4 px-4 honor-flex-fix" style={{ display: 'flex', justifyContent: 'center' }}>
                <div className={`
                  bg-gray-50 border border-gray-100 text-gray-500 font-medium rounded-2xl flex items-center gap-2 shadow-sm italic honor-flex-fix
                  ${isMobileMode ? 'px-4 py-3 text-xs max-w-[90%]' : 'px-8 py-4 text-sm max-w-[80%]'}
                `} style={{ display: 'flex', alignItems: 'center' }}>
                  <Quote size={isMobileMode ? 12 : 16} className="text-gray-300 flex-shrink-0" />
                  <span className="leading-relaxed word-break-all" style={{ wordBreak: 'break-word' }}>{msg.text}</span>
                </div>
              </div>
            )}

            {/* Character Message (Bubble) */}
            {msg.sender === 'character' && (
              <div className="w-full flex flex-row justify-start my-4 px-2 honor-flex-fix" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex flex-row items-start honor-flex-fix ${isMobileMode ? 'max-w-[90%]' : 'max-w-[75%]'}`}
                  style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}
                >
                  {/* Avatar Container - Fixed Size */}
                  <div 
                    style={{ width: isMobileMode ? '40px' : '48px', height: isMobileMode ? '40px' : '48px', minWidth: isMobileMode ? '40px' : '48px', marginRight: '12px' }}
                    className="rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-100 honor-avatar-fix"
                  >
                    <img src={(activeCharacter || character).avatar} alt="Avatar" className="w-full h-full object-cover honor-avatar-fix" style={{ width: '100%', height: '100%', display: 'block' }} />
                  </div>
                  
                  <div className="flex flex-col honor-flex-fix" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span className="text-[10px] text-gray-400 font-black ml-1 mb-1.5">{(activeCharacter || character).name}</span>
                    <div className={`
                      bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm word-break-all
                      ${isMobileMode ? 'px-4 py-3 text-sm leading-relaxed' : 'px-5 py-3.5 text-base leading-relaxed'}
                    `} style={{ wordBreak: 'break-word' }}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* User Message (Bubble) */}
            {msg.sender === 'user' && (
              <div className="w-full flex justify-end my-4 px-2 honor-flex-fix" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex flex-col items-end honor-flex-fix ${isMobileMode ? 'max-w-[90%]' : 'max-w-[75%]'}`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
                >
                  <span className="text-[10px] text-gray-400 font-black mr-1 mb-1.5">我</span>
                  <div className={`
                    bg-gradient-to-br from-sherry-500 to-sherry-600 text-white rounded-2xl rounded-tr-none shadow-md word-break-all
                    ${isMobileMode ? 'px-4 py-3 text-sm leading-relaxed' : 'px-5 py-3.5 text-base leading-relaxed'}
                  `} style={{ wordBreak: 'break-word' }}>
                    {msg.text}
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        ))}
        
        {/* Chapter Ending Choices */}
        <AnimatePresence>
          {showChapterEnding && chapter.ending && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full my-4 px-2"
            >
              {chapter.ending.type === 'finished' ? (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-gray-100 honor-flex-fix" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="text-center mb-4 honor-flex-fix" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg honor-flex-fix"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <CheckCircle size={28} className="text-white" />
                    </motion.div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">故事完结</h3>
                    <p className="text-xs text-gray-500 font-medium">感谢您的陪伴</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-4">
                    <p className="text-sm text-gray-700 text-center leading-relaxed font-medium word-break-all">
                      {chapter.ending.text}
                    </p>
                  </div>
                  
                  <div className="flex gap-3 honor-flex-fix" style={{ display: 'flex', flexDirection: 'row' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowChapterEnding(false)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm border-none outline-none honor-flex-fix"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Heart size={16} />
                      <span>收藏作品</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onBack}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all duration-200 text-sm border-none outline-none"
                    >
                      返回首页
                    </motion.button>
                  </div>
                </div>
              ) : chapter.ending.type === 'complete' ? (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-gray-100 honor-flex-fix" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="text-center mb-4 honor-flex-fix" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-sherry-400 to-orange-400 flex items-center justify-center shadow-lg honor-flex-fix"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Sparkles size={28} className="text-white" />
                    </motion.div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">连载中</h3>
                    <p className="text-xs text-gray-500 font-medium">精彩内容持续更新中</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-sherry-50 to-orange-50 rounded-2xl p-4 mb-4">
                    <p className="text-sm text-gray-700 text-center leading-relaxed font-medium word-break-all">
                      感谢您的阅读！<br />
                      打赏可以催更，支持作者继续创作
                    </p>
                  </div>
                  
                  <div className="flex gap-3 honor-flex-fix" style={{ display: 'flex', flexDirection: 'row' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-sherry-500 to-orange-500 text-white px-4 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm border-none outline-none honor-flex-fix"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Gift size={16} />
                      <span>打赏催更</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onBack}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all duration-200 text-sm border-none outline-none"
                    >
                      返回首页
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-xl border border-gray-100 honor-flex-fix" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 honor-flex-fix" style={{ display: 'flex', alignItems: 'center' }}>
                    <Sparkles size={20} className="text-sherry-500" />
                    <h3 className="font-bold text-gray-800 text-base sm:text-lg">剧情选择</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5 leading-relaxed font-medium word-break-all">{chapter.ending.text}</p>
                  <div className="space-y-2.5 honor-flex-fix" style={{ display: 'flex', flexDirection: 'column' }}>
                    {chapter.ending.options.map((option) => (
                      <motion.button
                        key={option.id}
                        onClick={() => handleChapterChoice(option)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full text-left px-4 py-3.5 sm:px-5 sm:py-4 bg-gradient-to-r from-sherry-50 to-orange-50 hover:from-sherry-100 hover:to-orange-100 rounded-2xl border border-sherry-200 transition-all duration-200 flex items-center justify-between group outline-none honor-flex-fix"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <span className="text-xs sm:text-sm font-bold text-gray-700">{option.text}</span>
                        <ChevronRight size={16} className="text-sherry-400 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {isTyping && (
          <div className="w-full flex justify-start my-3 px-2 honor-flex-fix" style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-row items-start gap-2.5 honor-flex-fix ${isMobileMode ? 'max-w-[85%]' : 'max-w-[75%]'}`}
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}
            >
              <div 
                className="rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-100 honor-avatar-fix"
                style={{ width: isMobileMode ? '36px' : '44px', height: isMobileMode ? '44px' : '44px', minWidth: isMobileMode ? '36px' : '44px', marginRight: '8px' }}
              >
                <img src={(activeCharacter || character).avatar} alt="Avatar" className="w-full h-full object-cover honor-avatar-fix" style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>
              <div className="flex flex-col gap-1 honor-flex-fix" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span className="text-[10px] text-gray-400 font-black ml-1 mb-1">{(activeCharacter || character).name}</span>
                <div className={`bg-white rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex flex-row items-center gap-1.5 honor-flex-fix ${isMobileMode ? 'px-4 py-3' : 'px-5 py-4'}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <span className="w-1.5 h-1.5 bg-sherry-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-sherry-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-sherry-500 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Character Info Bar */}
      <div className={`
        ${isMobileMode ? 'w-full px-4 py-3' : 'px-8 py-4'} 
        border-t flex flex-row items-center justify-between transition-colors z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] honor-flex-fix
        ${isAuthorMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}
      `} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex flex-row items-center gap-3 honor-flex-fix" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div className="relative group cursor-pointer flex-shrink-0">
            <div 
              style={{ width: isMobileMode ? '40px' : '48px', height: isMobileMode ? '40px' : '48px', minWidth: isMobileMode ? '40px' : '48px' }}
              className="rounded-xl overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform honor-avatar-fix"
            >
              <img src={(activeCharacter || character).avatar} alt={(activeCharacter || character).name} className="w-full h-full object-cover honor-avatar-fix" style={{ width: '100%', height: '100%', display: 'block' }} />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="min-w-0 flex flex-col honor-flex-fix" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 className={`font-black ${isMobileMode ? 'text-sm' : 'text-base'} ${isAuthorMode ? 'text-white' : 'text-gray-900'} truncate`}>
              {(activeCharacter || character).name}
            </h3>
            <div className="flex flex-row items-center gap-1.5 mt-0.5 honor-flex-fix" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              {isAuthorMode ? (
                <span className={`${isMobileMode ? 'text-[10px]' : 'text-xs'} text-purple-400 font-bold flex flex-row items-center gap-1 bg-purple-900/20 px-1.5 py-0.5 rounded honor-flex-fix`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Wand2 size={isMobileMode ? 10 : 12} /> 作者模式
                </span>
              ) : (
                <div className="flex flex-row items-center gap-1.5 honor-flex-fix" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <div className="flex flex-row items-center gap-0.5 honor-flex-fix" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    {[1, 2, 3].map(i => (
                      <HeartIcon key={i} filled={i <= 2} />
                    ))}
                  </div>
                  <span className={`${isMobileMode ? 'text-[10px]' : 'text-xs'} text-sherry-500 font-black`}>
                    {characterIntimacy[(activeCharacter || character).id]?.currentStatus || '初次相遇'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-row items-center gap-2 honor-flex-fix" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <button 
            onClick={() => setIsAuthorMode(!isAuthorMode)}
            className={`
              flex flex-row items-center gap-1.5 px-4 py-2 rounded-full transition-all text-xs font-black border-none outline-none honor-flex-fix
              ${isAuthorMode 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
            `}
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <Wand2 size={14} />
            {!isMobileMode && <span>{isAuthorMode ? '退出创作' : '开始创作'}</span>}
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className={`
        ${isMobileMode ? 'w-full px-4 py-3 pb-8 safe-pb' : 'px-8 py-4'} 
        border-t flex flex-row items-center transition-colors z-20 min-h-[72px] honor-flex-fix
        ${isAuthorMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}
      `} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        {!isAuthorMode && (
          <button className="p-2.5 flex-shrink-0 text-gray-400 hover:text-gray-600 border-none outline-none bg-transparent" style={{ marginRight: '4px' }}>
            <Mic size={isMobileMode ? 22 : 26} />
          </button>
        )}
        
        <div className={`
          flex-1 rounded-2xl ${isMobileMode ? 'px-4 py-2.5' : 'px-6 py-3.5'} 
          flex flex-row items-center transition-all shadow-inner honor-flex-fix
          ${isAuthorMode ? 'bg-gray-800' : 'bg-gray-100'}
        `} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={isAuthorMode ? "续写剧情或添加旁白..." : "输入你想说的话..."}
            className={`
              flex-1 bg-transparent border-none outline-none appearance-none
              ${isMobileMode ? 'text-sm' : 'text-base'} 
              ${isAuthorMode ? 'text-white' : 'text-gray-700'}
              font-medium py-1
            `}
            style={{ WebkitAppearance: 'none', boxShadow: 'none', border: 'none', outline: 'none', width: '100%' }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
        </div>

        {!isAuthorMode && (
          <button className="p-2.5 flex-shrink-0 text-gray-400 hover:text-gray-600 border-none outline-none bg-transparent" style={{ marginLeft: '4px', marginRight: '4px' }}>
            <Gift size={isMobileMode ? 22 : 26} />
          </button>
        )}
        
        <button 
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className={`
            p-3.5 rounded-2xl transition-all flex-shrink-0 border-none outline-none honor-flex-fix
            ${inputValue.trim() 
              ? (isAuthorMode 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                  : 'bg-sherry-500 text-white shadow-lg shadow-sherry-200') 
              : 'bg-gray-200 text-gray-400'}
          `}
          style={{ marginLeft: isAuthorMode ? '10px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Send size={isMobileMode ? 20 : 22} />
        </button>
      </div>

      {/* Chapter Directory Modal */}
      <AnimatePresence>
        {showChapterDirectory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3"
            onClick={() => setShowChapterDirectory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white rounded-2xl overflow-hidden shadow-2xl ${isMobileMode ? 'w-[92vw] max-h-[80vh]' : 'w-full max-w-md max-h-[75vh]'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-gray-100 flex flex-row items-center justify-between honor-flex-fix" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="font-bold text-gray-800 text-sm">章节目录</h3>
                <button onClick={() => setShowChapterDirectory(false)} className="p-2 hover:bg-gray-100 rounded-full border-none outline-none bg-transparent">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <div className="p-3 overflow-y-auto max-h-[65vh] no-scrollbar">
                <div className="space-y-1.5 honor-flex-fix" style={{ display: 'flex', flexDirection: 'column' }}>
                  {story.chapters.map((chapter, index) => {
                    const isUnlocked = unlockedChapters.has(index);
                    const isCurrent = index === currentChapterIndex;
                    return (
                      <motion.button
                        key={chapter.id}
                        onClick={() => {
                          if (isUnlocked) {
                            setCurrentChapterIndex(index);
                            setShowChapterDirectory(false);
                          }
                        }}
                        disabled={!isUnlocked}
                        whileHover={isUnlocked ? { scale: 1.01 } : {}}
                        whileTap={isUnlocked ? { scale: 0.99 } : {}}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all border-none outline-none honor-flex-fix ${
                          isCurrent 
                            ? 'bg-sherry-500 text-white shadow-md' 
                            : isUnlocked 
                              ? 'bg-gray-50 text-gray-700 hover:bg-gray-100' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <div className="flex flex-row items-center gap-2 honor-flex-fix" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                          {isUnlocked ? (
                            <CheckCircle size={14} className={isCurrent ? 'text-white' : 'text-green-500'} />
                          ) : (
                            <ChevronRight size={14} className="text-gray-400" />
                          )}
                          <span className="font-bold text-xs">{chapter.title}</span>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">当前</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 honor-flex-fix" style={{ display: 'flex', alignItems: 'center' }}>
                <div className="flex flex-row items-center gap-4 text-[10px] text-gray-500 honor-flex-fix" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <div className="flex items-center gap-1 honor-flex-fix" style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle size={10} className="text-green-500" />
                    <span className="font-bold">已解锁</span>
                  </div>
                  <div className="flex items-center gap-1 honor-flex-fix" style={{ display: 'flex', alignItems: 'center' }}>
                    <ChevronRight size={10} className="text-gray-400" />
                    <span className="font-bold">未解锁</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intimacy Change Notification */}
      <AnimatePresence>
        {showIntimacyChange && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 sm:bottom-28 left-1/2 transform -translate-x-1/2 z-50 w-[90%] sm:w-auto"
          >
            <div className={`bg-gray-800/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl flex flex-row items-center gap-3 border border-white/10 honor-flex-fix`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <div className="w-10 h-10 bg-sherry-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart size={20} className="text-sherry-400" />
              </div>
              <div className="min-w-0 flex flex-col honor-flex-fix" style={{ display: 'flex', flexDirection: 'column' }}>
                <p className="text-xs sm:text-sm font-black tracking-wide">{showIntimacyChange.characterName} 亲密等级提升！</p>
                <div className="flex items-center gap-2 mt-0.5 honor-flex-fix" style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="text-[10px] sm:text-xs text-gray-400">{showIntimacyChange.oldStatus}</span>
                  <ChevronRight size={10} className="text-gray-500" />
                  <span className="text-[10px] sm:text-xs text-sherry-400 font-bold">{showIntimacyChange.newStatus}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1 italic opacity-80 truncate max-w-[200px]">{showIntimacyChange.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="10" 
      height="10" 
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
