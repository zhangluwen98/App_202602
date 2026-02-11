import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Settings, Share2, Sparkles, Mic, Gift, Send, Wand2, Quote, BookOpen, MessageSquare, X, MoreHorizontal, ChevronRight, ChevronDown, CheckCircle, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NOVELS } from '../novels/index';

const BASE_URL = import.meta.env.BASE_URL || '/';

export default function ImmersiveReader({ storyId, onBack }) {
  const [story, setStory] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthorMode, setIsAuthorMode] = useState(false);
  const [activeQuote, setActiveQuote] = useState(null);
  const [dialogueCount, setDialogueCount] = useState(0);
  const [showChapterEnding, setShowChapterEnding] = useState(false);
  const [showChapterComplete, setShowChapterComplete] = useState(false);
  const [currentParagraphs, setCurrentParagraphs] = useState([]);
  const [triggeredParagraphs, setTriggeredParagraphs] = useState(new Set());
  const [chapterDividerAdded, setChapterDividerAdded] = useState(false);
  const [showChapterDirectory, setShowChapterDirectory] = useState(false);
  const [unlockedChapters, setUnlockedChapters] = useState(new Set([0]));
  const [activeCharacter, setActiveCharacter] = useState(null);
  const [characterIntimacy, setCharacterIntimacy] = useState({});
  const [userChoices, setUserChoices] = useState([]);
  const [showIntimacyChange, setShowIntimacyChange] = useState(null);
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
      const novel = NOVELS.find(n => n.id === storyId);
      if (!novel) {
        throw new Error(`Novel with id ${storyId} not found`);
      }
      
      const response = await fetch(`${BASE_URL}novels/${novel.file}`);
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
        const isLeft = !isProtagonist;
        const character = getCharacterBySpeaker(part.speaker);
        
        return (
          <div key={`${paragraphId}-dialogue-${index}`} className={`w-full flex ${isLeft ? 'justify-start' : 'justify-end'} my-2`}>
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className={`flex items-end gap-2 max-w-[70%] ${isLeft ? '' : 'flex-row-reverse'}`}
            >
              {isLeft && character && (
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                  <img src={character.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              )}
              <div className={`px-4 py-2.5 shadow-sm text-sm leading-6 ${
                isProtagonist 
                  ? 'bg-sherry-500 text-white rounded-2xl rounded-br-sm' 
                  : 'bg-white text-gray-700 rounded-2xl rounded-bl-sm border border-gray-100'
              }`}>
                {part.text}
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
    <div className="h-full flex flex-col bg-gradient-to-br from-[#FAF9F6] to-[#F5F3EF] font-sans">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-3 py-2 flex justify-between items-center shadow-sm z-20">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
          <button onClick={() => setShowChapterDirectory(true)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <BookOpen size={16} className="text-gray-600" />
          </button>
          <div className="min-w-0">
            <h2 className="text-xs font-semibold text-gray-800 line-clamp-1">{story.title}</h2>
            <p className="text-[10px] text-gray-400">{chapter.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400">
            <Settings size={14} />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400">
            <Share2 size={14} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 overflow-y-auto px-3 py-3 space-y-2 ${isAuthorMode ? 'bg-gray-900' : 'bg-transparent'}`}>
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
                  <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">{msg.text}</h1>
                ) : (
                  <div 
                    onClick={() => handleParagraphClick(msg.paragraphId, msg.parts)}
                    className={`
                      cursor-pointer rounded-xl px-3 py-2.5 transition-all duration-300
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
                          className="mt-2 flex items-center gap-2 text-xs text-sherry-600 font-medium"
                        >
                          <Sparkles size={14} />
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
              <div className="w-full flex justify-center my-2">
                <div className="bg-white/90 border-l-4 border-sherry-400 rounded-r-lg p-3 max-w-[85%] shadow-sm">
                  <div className="flex items-start gap-2">
                    <Quote size={14} className="text-sherry-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-sherry-600 font-medium mb-1">故事引用</p>
                      <p className="text-sm text-gray-600 italic leading-6">{msg.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter Divider */}
            {msg.sender === 'system' && msg.type === 'chapter-divider' && (
              <div className="w-full flex flex-col items-center justify-center my-4">
                <div className="flex items-center gap-3 w-full max-w-[80%]">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{msg.text}</span>
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
                    className="mt-3 bg-gradient-to-r from-sherry-500 to-orange-500 text-white px-6 py-2.5 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm"
                  >
                    <BookOpen size={16} />
                    <span>探索下一章：{story.chapters[currentChapterIndex + 1].title}</span>
                  </motion.button>
                )}
              </div>
            )}

            {/* Author Narrator (Non-bubble) */}
            {msg.sender === 'narrator' && !msg.type && (
              <div className="w-full flex justify-center my-2">
                <div className="bg-purple-100 border border-purple-200 text-purple-800 text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-sm max-w-[85%]">
                  <Sparkles size={14} />
                  {msg.text}
                </div>
              </div>
            )}

            {/* Character Message (Bubble) */}
            {msg.sender === 'character' && (
              <div className="w-full flex justify-start my-2">
                <motion.div 
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-end gap-2 max-w-[75%]"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                    <img src={character.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-white text-gray-700 px-3 py-2 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm text-xs leading-5">
                    {msg.text}
                  </div>
                </motion.div>
              </div>
            )}

            {/* User Message (Bubble) */}
            {msg.sender === 'user' && (
              <div className="w-full flex justify-end my-2">
                <motion.div 
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-end gap-2 max-w-[75%]"
                >
                  <div className="bg-sherry-500 text-white px-3 py-2 rounded-2xl rounded-br-sm shadow-md text-xs leading-5">
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
              className="w-full my-3"
            >
              {chapter.ending.type === 'finished' ? (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100">
                  <div className="text-center mb-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg"
                    >
                      <CheckCircle size={24} className="text-white" />
                    </motion.div>
                    <h3 className="font-bold text-gray-800 text-base mb-0.5">故事完结</h3>
                    <p className="text-xs text-gray-500">感谢您的陪伴</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 mb-3">
                    <p className="text-sm text-gray-700 text-center leading-relaxed">
                      {chapter.ending.text}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowChapterEnding(false)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 text-sm"
                    >
                      <Heart size={14} />
                      <span>收藏作品</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onBack}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 text-sm"
                    >
                      返回首页
                    </motion.button>
                  </div>
                </div>
              ) : chapter.ending.type === 'complete' ? (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100">
                  <div className="text-center mb-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-sherry-400 to-orange-400 flex items-center justify-center shadow-lg"
                    >
                      <Sparkles size={24} className="text-white" />
                    </motion.div>
                    <h3 className="font-bold text-gray-800 text-base mb-0.5">连载中</h3>
                    <p className="text-xs text-gray-500">精彩内容持续更新中</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-sherry-50 to-orange-50 rounded-xl p-3 mb-3">
                    <p className="text-sm text-gray-700 text-center leading-relaxed">
                      感谢您的阅读！<br />
                      打赏可以催更，支持作者继续创作
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-sherry-500 to-orange-500 text-white px-3 py-2 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 text-sm"
                    >
                      <Gift size={14} />
                      <span>打赏催更</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onBack}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 text-sm"
                    >
                      返回首页
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Sparkles size={16} className="text-sherry-500" />
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">剧情选择</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{chapter.ending.text}</p>
                  <div className="space-y-2">
                    {chapter.ending.options.map((option) => (
                      <motion.button
                        key={option.id}
                        onClick={() => handleChapterChoice(option)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-left px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-sherry-50 to-orange-50 hover:from-sherry-100 hover:to-orange-100 rounded-xl border border-sherry-200 transition-all duration-200 flex items-center justify-between group"
                      >
                        <span className="text-xs sm:text-sm font-medium text-gray-700">{option.text}</span>
                        <ChevronRight size={14} className="text-sherry-400 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {isTyping && (
          <div className="w-full flex justify-start my-2">
            <motion.div 
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-end gap-2 max-w-[70%]"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                <img src={character.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </motion.div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Character Info Bar */}
      <div className={`px-3 py-1.5 border-t flex items-center justify-between transition-colors ${isAuthorMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img src={(activeCharacter || character).avatar} alt={(activeCharacter || character).name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="min-w-0">
            <h3 className={`font-bold text-xs ${isAuthorMode ? 'text-white' : 'text-gray-800'}`}>{(activeCharacter || character).name}</h3>
            <div className="flex items-center gap-0.5">
              {isAuthorMode ? (
                <span className="text-[10px] text-purple-400 font-medium flex items-center gap-0.5">
                  <Wand2 size={8} /> 作者模式
                </span>
              ) : (
                <>
                  <HeartIcon filled />
                  <span className="text-[10px] text-sherry-500 font-medium">
                    {characterIntimacy[(activeCharacter || character).id]?.currentStatus || '初次相遇'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsAuthorMode(!isAuthorMode)}
          className={`p-1 rounded-full transition-colors ${isAuthorMode ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400 hover:text-purple-600'}`}
        >
          <Wand2 size={12} />
        </button>
      </div>

      {/* Input Area */}
      <div className={`px-3 py-2 border-t flex items-center gap-2 transition-colors ${isAuthorMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        {!isAuthorMode && (
          <button className="text-gray-400 hover:text-gray-600">
            <Mic size={16} />
          </button>
        )}
        <div className={`flex-1 rounded-full px-3 py-1.5 flex items-center ${isAuthorMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <input
            type="text"
            placeholder={isAuthorMode ? "输入剧情旁白..." : "和TA说点什么..."}
            className={`flex-1 bg-transparent border-none outline-none text-xs placeholder-gray-400 ${isAuthorMode ? 'text-white' : 'text-gray-700'}`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
        </div>
        {!isAuthorMode && (
          <button className="text-gray-400 hover:text-gray-600">
            <Gift size={16} />
          </button>
        )}
        <button 
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className={`p-1.5 rounded-full transition-colors ${
            inputValue.trim() 
              ? (isAuthorMode ? 'bg-purple-600 text-white' : 'bg-sherry-500 text-white shadow-md') 
              : (isAuthorMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-white')
          }`}
        >
          <Send size={14} />
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
              className="bg-white rounded-2xl w-full max-w-md max-h-[75vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-sm">章节目录</h3>
                <button onClick={() => setShowChapterDirectory(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <div className="p-3 overflow-y-auto max-h-[65vh]">
                <div className="space-y-1.5">
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
                        className={`w-full text-left px-3 py-2 rounded-xl transition-all ${
                          isCurrent 
                            ? 'bg-sherry-500 text-white shadow-md' 
                            : isUnlocked 
                              ? 'bg-gray-50 text-gray-700 hover:bg-gray-100' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isUnlocked ? (
                              <CheckCircle size={14} className={isCurrent ? 'text-white' : 'text-green-500'} />
                            ) : (
                              <ChevronRight size={14} className="text-gray-400" />
                            )}
                            <span className="font-medium text-xs">{chapter.title}</span>
                          </div>
                          {isCurrent && (
                            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">当前</span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <CheckCircle size={10} className="text-green-500" />
                    <span>已解锁</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRight size={10} className="text-gray-400" />
                    <span>未解锁</span>
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
            className="fixed bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 z-50 w-[90%] sm:w-auto"
          >
            <div className="bg-gray-800/90 backdrop-blur-sm text-white px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl shadow-lg flex items-center gap-2 sm:gap-3">
              <Heart size={16} className="text-sherry-400" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium">{showIntimacyChange.characterName} 亲密状态变化</p>
                <p className="text-[10px] sm:text-xs text-gray-300">
                  {showIntimacyChange.oldStatus} → {showIntimacyChange.newStatus}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{showIntimacyChange.description}</p>
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
