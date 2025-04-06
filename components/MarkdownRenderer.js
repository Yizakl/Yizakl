import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const MarkdownRenderer = ({ content, darkMode }) => {
  // 预处理内容，确保代码块正确格式化
  const processContent = (text) => {
    if (!text) return '';

    // 正确格式化的代码块处理
    const lines = text.split('\n');
    let inCodeBlock = false;
    let currentLanguage = '';
    let codeContent = [];
    let result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 检测代码块开始
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          // 代码块开始
          inCodeBlock = true;
          const langMatch = line.trim().match(/^```(\w*)$/);
          currentLanguage = langMatch ? langMatch[1] : '';
          codeContent = [];
          result.push(line); // 保留原始的```标记行
        } else {
          // 代码块结束
          inCodeBlock = false;
          result.push(line); // 保留原始的```标记行
        }
        continue;
      }
      
      // 处理代码块内容
      if (inCodeBlock) {
        codeContent.push(line);
        result.push(line);
        continue;
      }
      
      // 非代码块内容正常添加
      result.push(line);
    }
    
    // 确保所有代码块都正确关闭
    if (inCodeBlock) {
      result.push('```');
    }
    
    return result.join('\n');
  };

  // 处理的内容
  const processedContent = processContent(content);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={atomDark}
              language={match[1]}
              PreTag="div"
              {...props}
              customStyle={darkMode ? { backgroundColor: '#1e1e1e' } : {}}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code 
              className={`${className} ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'}`} 
              {...props}
            >
              {children}
            </code>
          );
        },
        // 减小段落间距
        p({ children }) {
          return <p className="my-1 whitespace-pre-wrap">{children}</p>;
        },
        // 设置链接在新窗口打开
        a({ node, ...props }) {
          return <a target="_blank" rel="noopener noreferrer" {...props} />;
        },
        // 设置标题样式
        h1({ children }) {
          return <h1 className="text-xl font-bold my-2">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-bold my-2">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-md font-bold my-1.5">{children}</h3>;
        },
        // 设置列表样式
        ul({ children }) {
          return <ul className="list-disc ml-5 my-1.5">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal ml-5 my-1.5">{children}</ol>;
        },
        li({ children }) {
          return <li className="my-0.5">{children}</li>;
        },
        // 设置预格式化文本样式
        pre({ children }) {
          return <pre className="rounded-md overflow-x-auto my-2">{children}</pre>;
        },
        // 增加对引用块的支持
        blockquote({ children }) {
          return <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-1.5">{children}</blockquote>;
        }
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer; 