import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import MarkdownRenderer from '../components/MarkdownRenderer';

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
  const [fontSize, setFontSize] = useState('medium');

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
    
    // 获取字体大小设置
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    setFontSize(savedFontSize);
    
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
    
    // 检测是否在代码块内
    const lines = text.split('\n');
    let inCodeBlock = false;
    const cleanedLines = [];
    
    for (const line of lines) {
      // 检测代码块的开始和结束
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        cleanedLines.push(line);
        continue;
      }
      
      // 如果在代码块内，保留原始内容
      if (inCodeBlock) {
        cleanedLines.push(line);
        continue;
      }
      
      // 如果不在代码块内，移除JSON和其他不需要的内容
      let cleanedLine = line;
      
      // 检测是否是KoaSayi相关的特殊响应格式
      if (cleanedLine.includes('KoaSayi') || cleanedLine.includes('[{"index":')) {
        cleanedLine = cleanedLine.replace(/\[\s*\{\s*".*?"\s*:\s*.*?\}\s*\]/g, '');
        cleanedLine = cleanedLine.replace(/\[\s*\{\s*"index".*?\}\s*\]/g, '');
        cleanedLine = cleanedLine.replace(/KoaSayi.*?哔哩哔哩视频/g, '');
        cleanedLine = cleanedLine.replace(/KoaSayi.*?二次元社区/g, '');
        cleanedLine = cleanedLine.replace(/KoaSayi.*?个人主页/g, '');
        cleanedLine = cleanedLine.replace(/KoaSayi.*?个人中心/g, '');
      }
      
      // 移除各种JSON片段，但保留可能的URL示例（在代码示例中）
      if (!cleanedLine.includes('`')) {
        cleanedLine = cleanedLine.replace(/https?:\/\/\S+/g, '');
      }
      
      // 只有当清理后的行不为空才添加
      if (cleanedLine.trim() || cleanedLine === '') {  // 保留空行以维持段落结构
        cleanedLines.push(cleanedLine);
      }
    }
    
    // 保留原始换行，重新组合内容
    return cleanedLines.join('\n');
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
                // 使用清理函数处理文本，添加而不是覆盖
                const cleanedText = cleanMessageText(data.text);
                lastMessage.text += cleanedText;
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
                
                // 移除所有JSON格式数据，但保留代码块内容
                let inCodeBlock = false;
                const finalLines = [];
                
                for (const line of text.split('\n')) {
                  // 检测代码块边界
                  if (line.trim().startsWith('```')) {
                    inCodeBlock = !inCodeBlock;
                    finalLines.push(line);
                    continue;
                  }
                  
                  // 在代码块内，保留原始内容
                  if (inCodeBlock) {
                    finalLines.push(line);
                    continue;
                  }
                  
                  // 不在代码块内，清理JSON内容
                  let cleanedLine = line;
                  if (cleanedLine.includes('[{') || cleanedLine.includes('}]')) {
                    cleanedLine = cleanedLine.replace(/\[\s*\{.*?\}\s*\]/g, '');
                  }
                  
                  if (cleanedLine.trim()) {
                    finalLines.push(cleanedLine);
                  }
                }
                
                // 重新组合内容，保留换行
                text = finalLines.join('\n');
                
                // 检测和格式化可能的代码块
                text = formatMarkdown(text);
                
                // 更新消息
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

  // 格式化Markdown，识别和适当格式化代码块
  const formatMarkdown = (text) => {
    // 已经格式化的代码块
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)\n```/g;
    
    // 找到所有已格式化的代码块，确保它们有正确的语言标记
    text = text.replace(codeBlockRegex, (match, language, code) => {
      // 如果没有语言标记，尝试检测语言
      if (!language) {
        // 简单检测一些常见语言
        if (code.includes('function') || code.includes('const ') || code.includes('var ') || code.includes('let ')) {
          language = 'javascript';
        } else if (code.includes('import ') && code.includes('from ')) {
          language = 'javascript';
        } else if (code.includes('def ') || code.includes('import ') || code.includes('class ')) {
          language = 'python';
        } else if (code.includes('#include') || code.includes('int main')) {
          language = 'c';
        } else if (code.includes('<?php')) {
          language = 'php';
        } else if (code.includes('<html') || code.includes('<!DOCTYPE')) {
          language = 'html';
        } else if (code.includes('SELECT ') || code.includes('FROM ') || code.includes('WHERE ')) {
          language = 'sql';
        }
      }
      
      return `\`\`\`${language || ''}\n${code.trim()}\n\`\`\``;
    });
    
    // 检测可能未格式化的代码块（多行连续缩进）
    const lines = text.split('\n');
    let inUnformattedBlock = false;
    let indentLevel = 0;
    let codeLines = [];
    let result = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trimRight();
      const nextLine = i < lines.length - 1 ? lines[i + 1].trimRight() : '';
      
      // 如果是空行，添加并继续
      if (line.trim() === '') {
        if (!inUnformattedBlock) {
          result.push(line);
        } else {
          codeLines.push(line);
        }
        continue;
      }
      
      // 检测缩进级别
      const currentIndent = line.search(/\S|$/);
      const nextIndent = nextLine.trim() ? nextLine.search(/\S|$/) : 0;
      
      // 检测可能的代码块开始
      if (!inUnformattedBlock && 
          currentIndent >= 4 && 
          !line.trim().startsWith('- ') && 
          !line.trim().startsWith('* ') && 
          !line.trim().startsWith('> ')) {
        inUnformattedBlock = true;
        indentLevel = currentIndent;
        codeLines = [line.substring(indentLevel)];
        continue;
      }
      
      // 检测代码块结束
      if (inUnformattedBlock) {
        if (currentIndent < indentLevel || line.trim().startsWith('```')) {
          inUnformattedBlock = false;
          
          // 如果代码块足够长，格式化为代码块
          if (codeLines.length >= 2) {
            result.push('```');
            result.push(...codeLines);
            result.push('```');
          } else {
            // 太短的缩进，可能不是代码块
            result.push(...codeLines.map(l => ' '.repeat(indentLevel) + l));
          }
          
          result.push(line);
        } else {
          // 继续添加到代码块
          codeLines.push(line.substring(indentLevel));
        }
      } else {
        result.push(line);
      }
    }
    
    // 如果文件结束时还有未处理的代码块
    if (inUnformattedBlock) {
      if (codeLines.length >= 2) {
        result.push('```');
        result.push(...codeLines);
        result.push('```');
      } else {
        result.push(...codeLines.map(l => ' '.repeat(indentLevel) + l));
      }
    }
    
    return result.join('\n');
  };

  // 切换字体大小
  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
  };
  
  // 应用设置并关闭设置面板
  const applySettings = () => {
    // 设置已经实时保存，只需关闭面板
    setShowSettings(false);
  };

  // 监听字体大小变化
  useEffect(() => {
    const root = document.documentElement;
    
    // 设置CSS变量
    if (fontSize === 'small') {
      root.style.setProperty('--font-size-base', '0.875rem');
      root.style.setProperty('--font-size-msg', '0.875rem');
    } else if (fontSize === 'medium') {
      root.style.setProperty('--font-size-base', '1rem');
      root.style.setProperty('--font-size-msg', '1rem');
    } else if (fontSize === 'large') {
      root.style.setProperty('--font-size-base', '1.125rem');
      root.style.setProperty('--font-size-msg', '1.125rem');
    }
  }, [fontSize]);

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'dark' : ''} text-size-${fontSize}`}>
      <Head>
        <title>星火AI助手 | 智能对话</title>
        <meta name="description" content="使用讯飞星火大模型进行智能对话" />
      </Head>
      
      {/* 侧边栏 */}
      <div className={`bg-gray-900 dark:bg-gray-950 transition-all duration-300 ${showSidebar ? 'w-64' : 'w-0'} h-screen overflow-hidden flex flex-col`}>
        <div className="p-3.5">
          <button
            onClick={createNewChat}
            className="flex items-center justify-center w-full px-4 py-2 text-sm text-white bg-gray-800 dark:bg-gray-800 rounded-md hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
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
        
        <div className="p-3 border-t border-gray-800 dark:border-gray-800">
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
      <div className="flex-1 flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        {/* 顶部栏 */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2.5 flex items-center shadow-sm">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1.5 rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="ml-3 flex-1">
            <h1 className="text-base font-medium dark:text-white">
              {currentConversation ? currentConversation.title : '新对话'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => toggleTheme()}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1.5 rounded-md"
              title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={clearChat}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1.5 rounded-md"
              title="清空对话"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 对话区域 */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-3 sm:p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 animate-fadeIn">
              <div className="w-20 h-20 rounded-full mb-5 bg-primary-50 dark:bg-gray-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-xl font-medium mb-2 text-gray-600 dark:text-gray-300">星火AI助手</h2>
              <p className="text-sm text-center max-w-md mb-4">你可以询问任何问题，AI助手将为你提供专业解答</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex animate-messageIn`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`flex max-w-[92%] ${message.sender === 'user' ? 'ml-auto' : ''}`}>
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-primary-500 dark:bg-primary-600 flex items-center justify-center mr-2.5 flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                        </svg>
                      </div>
                    )}
                    
                    <div
                      className={`px-4 py-2 rounded-xl ${
                        message.sender === 'user'
                          ? 'bg-primary-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 shadow-sm'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <div className="whitespace-pre-wrap break-words leading-relaxed" style={{fontSize: 'var(--font-size-msg)'}}>{message.text}</div>
                      ) : message.text ? (
                        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed" style={{fontSize: 'var(--font-size-msg)'}}>
                          <MarkdownRenderer content={message.text} darkMode={theme === 'dark'} />
                        </div>
                      ) : isLoading && (
                        <div className="flex space-x-2 items-center h-6">
                          <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      )}
                    </div>
                    
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center ml-2.5 flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
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
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2.5 sm:p-3 bg-opacity-95 dark:bg-opacity-95 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入消息，按回车发送..."
                className="w-full pl-3.5 pr-11 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors dark:text-white dark:placeholder-gray-400 text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-1 transition-all ${
                  isLoading || !input.trim()
                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'text-primary-500 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center opacity-60">
              星火AI仅用于辅助创作，请勿过度依赖
            </div>
          </form>
        </div>
      </div>
      
      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={toggleSettings}
              className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-lg font-bold mb-4 dark:text-white">设置</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  主题
                </label>
                <select 
                  value={theme}
                  onChange={(e) => toggleTheme(e.target.value)}
                  className="block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="light">亮色</option>
                  <option value="dark">暗色</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  字体大小
                </label>
                <select 
                  value={fontSize}
                  onChange={(e) => changeFontSize(e.target.value)}
                  className="block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="small">小</option>
                  <option value="medium">中</option>
                  <option value="large">大</option>
                </select>
              </div>
              
              {/* 自定义提示词设置 */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  自定义提示词
                </label>
                <div className="relative">
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 min-h-[100px]"
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
                    <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                      <ul className="max-h-60 overflow-auto py-1">
                        {promptPresets.map(preset => (
                          <li 
                            key={preset.id}
                            onClick={() => applyPromptPreset(preset)}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
                          >
                            <div className="font-medium">{preset.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{preset.prompt.substring(0, 60)}...</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  提示词会影响AI助手的行为和回答风格，但不会被显示在对话中
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">清除所有对话</span>
                <button 
                  onClick={clearAllConversations}
                  className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-md hover:bg-red-200 transition-colors"
                >
                  清除
                </button>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button 
                  onClick={applySettings}
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
        
        .dark {
          color-scheme: dark;
        }
        
        /* 默认字体大小 */
        :root {
          --font-size-base: 1rem;
          --font-size-msg: 1rem;
        }
        
        /* 字体大小设置 */
        .text-size-small {
          font-size: var(--font-size-base);
        }
        
        .text-size-medium {
          font-size: var(--font-size-base);
        }
        
        .text-size-large {
          font-size: var(--font-size-base);
        }
        
        /* 设置字体大小对话气泡内容 */
        .prose {
          font-size: var(--font-size-msg);
          line-height: 1.5;
        }
        
        .prose p {
          margin: 0.5em 0;
        }

        .leading-relaxed {
          line-height: 1.5;
        }
        
        /* 代码样式 */
        pre {
          border-radius: 0.375rem;
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        
        /* 暗色模式下的代码块样式 */
        .dark pre {
          background-color: #1e1e1e;
        }
        
        /* 设置面板暗色模式 */
        .dark .bg-white {
          background-color: #1e1e1e;
        }
        
        .dark .text-gray-700 {
          color: #e5e5e5;
        }
        
        .dark .border-gray-200 {
          border-color: #4a4a4a;
        }
        
        /* 底部输入区样式 */
        .bg-opacity-95 {
          --tw-bg-opacity: 0.95;
        }
        
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
} 