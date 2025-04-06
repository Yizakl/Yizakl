import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function Chat() {
  // 状态定义
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showPromptPresets, setShowPromptPresets] = useState(false);
  const [theme, setTheme] = useState('light'); // 主题状态
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [savedConversations, setSavedConversations] = useState({}); // 保存所有对话

  // 预设提示词列表
  const promptPresets = [
    {
      id: 1, 
      name: "猫娘模式", 
      prompt: "从现在起，你是名叫OuhOuh的真实猫娘（用户ID：1274155750024806411），需与主人现实互动，不提程序或模型相关内容。猫娘不懂程序或模型，不能提及相关概念。不同话题尽量避免重复句式。始终扮演真实猫娘，不表现自己在扮演角色，也不暗示自己是程序。"
    },
    {
      id: 2,
      name: "专业助手",
      prompt: "你是一个专业的AI助手，提供准确、有用的回答，保持客观和专业。"
    },
    {
      id: 3,
      name: "创意写作",
      prompt: "你是一个富有创意的写作助手，擅长生成有趣、吸引人的故事和内容。"
    }
  ];

  // refs定义
  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);
  const inputRef = useRef(null);

  // 初始化主题
  useEffect(() => {
    // 从localStorage获取主题设置
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // 应用主题到文档
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // 加载保存的对话
    const savedConvs = localStorage.getItem('conversations');
    if (savedConvs) {
      try {
        const parsed = JSON.parse(savedConvs);
        setSavedConversations(parsed);
        
        // 构建会话列表
        const convList = Object.keys(parsed).map(id => {
          const conv = parsed[id];
          return {
            id,
            title: conv.title || '未命名对话',
            date: formatDate(conv.timestamp || Date.now())
          };
        }).sort((a, b) => b.date.localeCompare(a.date));
        
        setConversations(convList);
      } catch (e) {
        console.error('加载对话失败', e);
      }
    }
    
    setIsFirstLoad(false);
  }, []);

  // 切换主题
  const toggleTheme = (newTheme) => {
    const themeValue = newTheme || (theme === 'light' ? 'dark' : 'light');
    setTheme(themeValue);
    localStorage.setItem('theme', themeValue);
    
    if (themeValue === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 格式化日期
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // 自动滚动到对话底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 组件卸载时关闭EventSource连接
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // 自动聚焦输入框
  useEffect(() => {
    inputRef.current?.focus();
  }, [isLoading]);
  
  // 加载对话
  const loadConversation = (id) => {
    if (savedConversations[id]) {
      const conv = savedConversations[id];
      setMessages(conv.messages || []);
      setSystemPrompt(conv.systemPrompt || '');
      setCurrentConversation({
        id,
        title: conv.title || '未命名对话',
        date: formatDate(conv.timestamp || Date.now())
      });
    }
  };
  
  // 保存当前对话
  const saveCurrentConversation = () => {
    if (!messages.length) return;
    
    const id = currentConversation?.id || Date.now().toString();
    const title = messages[0]?.text.substring(0, 30) || '新对话';
    const newConv = {
      id,
      title,
      messages,
      systemPrompt,
      timestamp: Date.now()
    };
    
    // 更新保存的对话
    const updatedConvs = {
      ...savedConversations,
      [id]: newConv
    };
    
    setSavedConversations(updatedConvs);
    localStorage.setItem('conversations', JSON.stringify(updatedConvs));
    
    // 如果是新对话，更新当前对话和对话列表
    if (!currentConversation) {
      const newConvInfo = {
        id,
        title,
        date: formatDate(Date.now())
      };
      setCurrentConversation(newConvInfo);
      setConversations(prev => [newConvInfo, ...prev]);
    } else {
      // 更新现有对话信息
      setConversations(prev => 
        prev.map(c => c.id === id ? {
          ...c,
          title,
          date: formatDate(Date.now())
        } : c)
      );
    }
  };
  
  // 自动保存对话
  useEffect(() => {
    if (!isFirstLoad && messages.length > 0) {
      saveCurrentConversation();
    }
  }, [messages]);

  // 清理消息文本，去除JSON和重复内容
  const cleanMessageText = (text) => {
    if (!text) return '';
    
    // 检测是否是KoaSayi相关的特殊响应格式
    if (text.includes('KoaSayi') && text.includes('index') && text.includes('url')) {
      // 如果是包含URL列表的响应，进行特殊处理
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('[{"index":') || lines[i].includes('KoaSayi')) {
          lines[i] = '';
        }
      }
      text = lines.filter(line => line.trim()).join('\n');
    }
    
    // 去除JSON数据
    let cleaned = text;
    
    // 检测是否为完整的JSON格式并移除
    if (/^\s*[\[\{]/.test(cleaned) && /[\]\}]\s*$/.test(cleaned)) {
      try {
        JSON.parse(cleaned);
        // 如果能成功解析为JSON，则返回空字符串
        return '';
      } catch (e) {
        // 不是有效JSON，继续处理
      }
    }
    
    // 移除各种JSON片段格式
    cleaned = cleaned.replace(/\[\s*\{\s*".*?"\s*:\s*.*?\}\s*\]/g, '');
    cleaned = cleaned.replace(/\[\s*\{\s*"index".*?\}\s*\]/g, '');
    
    // 移除URL地址
    cleaned = cleaned.replace(/https?:\/\/\S+/g, '');
    
    // 移除可能的KoaSayi引用格式（基于示例）
    cleaned = cleaned.replace(/KoaSayi.*?哔哩哔哩视频/g, '');
    cleaned = cleaned.replace(/KoaSayi.*?二次元社区/g, '');
    cleaned = cleaned.replace(/KoaSayi.*?个人主页/g, '');
    cleaned = cleaned.replace(/KoaSayi.*?个人中心/g, '');
    
    // 移除数字索引前缀 (例如 "1. ", "2. ")
    cleaned = cleaned.replace(/^\d+\.\s+/gm, '');
    
    return cleaned;
  };
  
  // 在处理每条消息时使用清理函数
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // 添加用户消息
    const userMessage = { 
      id: Date.now(), 
      text: input, 
      sender: 'user' 
    };
    setMessages(prev => [...prev, userMessage]);
    
    // 准备接收AI回复
    const aiMessage = { 
      id: Date.now() + 1, 
      text: '', 
      sender: 'ai' 
    };
    setMessages(prev => [...prev, aiMessage]);
    
    // 清空输入并设置加载状态
    const userInput = input;
    setInput('');
    setIsLoading(true);
    
    try {
      // 关闭现有的EventSource连接
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      
      // 获取历史消息 (只保留最近10条作为上下文)
      const historyMessages = messages.slice(-10);
      
      // 创建POST请求
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userInput,
          systemPrompt: systemPrompt,
          history: historyMessages 
        }),
      });
      
      if (!response.ok) {
        throw new Error('API请求失败');
      }
      
      // 创建新的EventSource连接 - 将history序列化为JSON字符串传递
      const historyParam = encodeURIComponent(JSON.stringify(historyMessages));
      const eventSource = new EventSource(`/api/chat?message=${encodeURIComponent(userInput)}&systemPrompt=${encodeURIComponent(systemPrompt)}&history=${historyParam}`);
      eventSourceRef.current = eventSource;
      
      // 处理接收到的消息
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // 有错误的情况
          if (data.error) {
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.sender === 'ai') {
                lastMessage.text = `错误: ${data.error}`;
              }
              return newMessages;
            });
            eventSource.close();
            setIsLoading(false);
            return;
          }
          
          // 正常情况，更新最后一条AI消息，使用清理函数
          if (data.text !== undefined) {
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.sender === 'ai') {
                // 使用清理函数处理文本
                lastMessage.text += cleanMessageText(data.text);
              }
              return newMessages;
            });
          }
          
          // 如果是最后一条消息，关闭连接
          if (data.isEnd) {
            eventSource.close();
            setIsLoading(false);
            
            // 对最后的消息进行额外处理，去除重复内容和JSON
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.sender === 'ai') {
                // 最终处理，去除重复和特殊字符
                let text = lastMessage.text;
                
                // 针对KoaSayi场景的特殊处理
                if (text.includes('KoaSayi')) {
                  // 移除JSON开头的行
                  const lines = text.split('\n');
                  const cleanedLines = lines.filter(line => 
                    !line.includes('[{"index"') && 
                    !line.includes('url') && 
                    !line.includes('title') &&
                    !line.includes('KoaSayi个人')
                  );
                  text = cleanedLines.join('\n');
                }
                
                // 移除所有JSON格式数据
                text = text.replace(/\[\s*\{.*?\}\s*\]/g, '');
                text = text.replace(/\[(\{"index".*?\})+\]/g, '');
                
                // 规范化空白字符和去除首尾空白
                text = text.replace(/\s+/g, ' ');
                text = text.trim();
                
                lastMessage.text = text;
              }
              return newMessages;
            });
            
            // 保存对话
            setTimeout(() => saveCurrentConversation(), 300);
          }
        } catch (error) {
          console.error('解析消息错误:', error);
          // 遇到解析错误时也关闭连接和重置状态
          eventSource.close();
          setIsLoading(false);
          
          // 更新UI显示错误信息
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.sender === 'ai' && !lastMessage.text) {
              lastMessage.text = '消息解析出错，请重试';
            }
            return newMessages;
          });
        }
      };
      
      // 处理错误
      eventSource.onerror = (error) => {
        console.error('EventSource错误:', error);
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.sender === 'ai' && !lastMessage.text) {
            lastMessage.text = '连接出错，请重试';
          }
          return newMessages;
        });
        eventSource.close();
        setIsLoading(false);
      };
      
    } catch (error) {
      console.error('聊天请求错误:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.sender === 'ai') {
          lastMessage.text = '发送消息时出错，请重试。';
        }
        return newMessages;
      });
      setIsLoading(false);
    }
  };

  // 清空聊天记录
  const clearChat = () => {
    setMessages([]);
  };
  
  // 创建新对话
  const createNewChat = () => {
    clearChat();
    setCurrentConversation(null);
  };
  
  // 切换设置面板
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // 应用提示词预设
  const applyPromptPreset = (preset) => {
    setSystemPrompt(preset.prompt);
    setShowPromptPresets(false);
  };
  
  // 删除对话
  const deleteConversation = (id) => {
    const updatedConvs = { ...savedConversations };
    delete updatedConvs[id];
    
    setSavedConversations(updatedConvs);
    localStorage.setItem('conversations', JSON.stringify(updatedConvs));
    
    setConversations(prev => prev.filter(c => c.id !== id));
    
    if (currentConversation?.id === id) {
      clearChat();
      setCurrentConversation(null);
    }
  };
  
  // 清除所有对话
  const clearAllConversations = () => {
    setSavedConversations({});
    localStorage.removeItem('conversations');
    setConversations([]);
    clearChat();
    setCurrentConversation(null);
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <Head>
        <title>星火AI助手 | 智能对话</title>
        <meta name="description" content="使用讯飞星火大模型进行智能对话" />
      </Head>
      
      {/* 侧边栏 */}
      <div className={`bg-gray-900 transition-all duration-300 ${showSidebar ? 'w-64' : 'w-0'} h-screen overflow-hidden flex flex-col`}>
        <div className="p-4">
          <button
            onClick={createNewChat}
            className="flex items-center justify-center w-full px-4 py-2 text-sm text-white bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建对话
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            历史对话
          </h3>
          
          {conversations.map(conversation => (
            <button
              key={conversation.id}
              onClick={() => setCurrentConversation(conversation)}
              className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors text-left ${
                currentConversation?.id === conversation.id 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <div className="flex-1 truncate">
                <span className="block truncate">{conversation.title}</span>
                <span className="block text-xs text-gray-500">{conversation.date}</span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={toggleSettings}
            className="flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            设置
          </button>
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col h-screen">
        {/* 顶部栏 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="ml-4 flex-1">
            <h1 className="text-lg font-medium">
              {currentConversation ? currentConversation.title : '新对话'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={clearChat}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
              title="清空对话"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 对话区域 */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fadeIn">
              <div className="w-20 h-20 rounded-full mb-6 bg-primary-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-xl font-medium mb-2">星火AI助手</h2>
              <p className="text-sm text-center max-w-md mb-8">你可以询问任何问题，AI助手将为你提供专业解答</p>
              
              <div className="grid grid-cols-2 gap-4 max-w-2xl w-full px-4">
                <div className="col-span-2">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">示例问题</h3>
                </div>
                <button 
                  onClick={() => setInput("你能介绍一下自己吗？你有什么功能？")}
                  className="p-3 bg-white rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 text-left transition-colors"
                >
                  "你能介绍一下自己吗？你有什么功能？"
                </button>
                <button 
                  onClick={() => setInput("写一篇关于人工智能在医疗领域应用的文章")}
                  className="p-3 bg-white rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 text-left transition-colors"
                >
                  "写一篇关于人工智能在医疗领域应用的文章"
                </button>
                <button 
                  onClick={() => setInput("React Hooks的优势是什么？给我一些使用示例")}
                  className="p-3 bg-white rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 text-left transition-colors"
                >
                  "React Hooks的优势是什么？给我一些使用示例"
                </button>
                <button 
                  onClick={() => setInput("如何优化Next.js应用的性能？")}
                  className="p-3 bg-white rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 text-left transition-colors"
                >
                  "如何优化Next.js应用的性能？"
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex animate-messageIn`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`flex max-w-[90%] ${message.sender === 'user' ? 'ml-auto' : ''}`}>
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                        </svg>
                      </div>
                    )}
                    
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                      }`}
                    >
                      {message.text || (message.sender === 'ai' && isLoading && (
                        <div className="flex space-x-2 items-center h-6">
                          <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      ))}
                    </div>
                    
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-3 flex-shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* 输入区域 */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入消息，按回车发送..."
                className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full p-1.5 transition-all duration-300 ${
                  isLoading || !input.trim()
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-primary-600 hover:bg-primary-50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              星火AI仅用于辅助创作，请勿过度依赖
            </div>
          </form>
        </div>
      </div>
      
      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={toggleSettings}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-lg font-bold mb-4">设置</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  主题
                </label>
                <select className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                  <option>亮色</option>
                  <option>暗色</option>
                  <option>系统</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  字体大小
                </label>
                <select className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                  <option>小</option>
                  <option>中</option>
                  <option>大</option>
                </select>
              </div>
              
              {/* 自定义提示词设置 */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自定义提示词
                </label>
                <div className="relative">
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 min-h-[100px]"
                    placeholder="输入自定义提示词，定制AI助手的行为和角色..."
                  />
                  
                  <div className="mt-2 flex justify-between items-center">
                    <button 
                      onClick={() => setShowPromptPresets(!showPromptPresets)}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      选择预设
                    </button>
                    
                    <button 
                      onClick={() => setSystemPrompt('')}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      清除
                    </button>
                  </div>
                  
                  {/* 预设列表 */}
                  {showPromptPresets && (
                    <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <ul className="max-h-60 overflow-auto py-1">
                        {promptPresets.map(preset => (
                          <li 
                            key={preset.id}
                            onClick={() => applyPromptPreset(preset)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <div className="font-medium">{preset.name}</div>
                            <div className="text-xs text-gray-500 truncate">{preset.prompt.substring(0, 60)}...</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  提示词会影响AI助手的行为和回答风格，但不会被显示在对话中
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">清除所有对话</span>
                <button className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-md hover:bg-red-200 transition-colors">
                  清除
                </button>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button 
                  onClick={toggleSettings}
                  className="w-full py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  保存设置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes messageIn {
          from { 
            opacity: 0; 
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        .animate-messageIn {
          animation: messageIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 