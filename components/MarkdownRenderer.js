import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const MarkdownRenderer = ({ content, darkMode }) => {
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
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        // 确保段落和换行正确渲染
        p({ children }) {
          return <p className="mb-2">{children}</p>;
        },
        // 设置链接在新窗口打开
        a({ node, ...props }) {
          return <a target="_blank" rel="noopener noreferrer" {...props} />;
        },
        // 设置标题样式
        h1({ children }) {
          return <h1 className="text-xl font-bold my-3">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-bold my-2">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-md font-bold my-2">{children}</h3>;
        },
        // 设置列表样式
        ul({ children }) {
          return <ul className="list-disc ml-5 my-2">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal ml-5 my-2">{children}</ol>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer; 