import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BlogDetail from './BlogDetail';

// 模拟的博客文章数据
const posts = [
  {
    id: 1,
    title: '开始使用Next.js构建博客',
    date: '2025-04-04',
    excerpt: '本文介绍了如何使用Next.js从零开始构建一个个人博客网站...',
    content: `
      <p>在当今数字时代，拥有一个个人博客是展示自己专业技能和分享知识的绝佳方式。Next.js作为一个功能强大的React框架，为构建现代化的博客网站提供了完美的解决方案。</p>
      
      <h2>为什么选择Next.js?</h2>
      
      <p>Next.js提供了许多强大的功能，使其成为构建博客的理想选择：</p>
      
      <ul>
        <li><strong>服务器端渲染(SSR)</strong>：提高页面加载速度和SEO表现</li>
        <li><strong>静态站点生成(SSG)</strong>：预渲染页面，进一步提升性能</li>
        <li><strong>文件系统路由</strong>：简化路由配置</li>
        <li><strong>API路由</strong>：轻松创建后端API</li>
        <li><strong>内置CSS支持</strong>：包括CSS模块、Styled JSX等</li>
      </ul>
      
      <h2>博客项目基本结构</h2>
      
      <p>一个典型的Next.js博客项目结构如下：</p>
      
      <pre><code>
      /pages
        /index.js        # 首页
        /about.js        # 关于页面
        /posts           
          /index.js      # 博客文章列表
          /[slug].js     # 博客文章详情页
      /public            # 静态资源
      /styles            # 全局样式
      /components        # React组件
      /lib               # 工具函数
      </code></pre>
      
      <h2>如何开始</h2>
      
      <p>创建一个新的Next.js项目非常简单：</p>
      
      <pre><code>
      npx create-next-app my-blog
      cd my-blog
      npm run dev
      </code></pre>
      
      <p>就这么简单！现在你可以开始构建你的博客了。</p>
      
      <h2>下一步</h2>
      
      <p>接下来，你可以考虑以下内容：</p>
      
      <ul>
        <li>添加一个Markdown解析器来处理博客内容</li>
        <li>集成CMS或使用静态内容系统如MDX</li>
        <li>添加评论功能</li>
        <li>实现搜索功能</li>
        <li>添加分类和标签</li>
      </ul>
      
      <p>持续关注我的博客，我将在未来的文章中详细介绍这些功能的实现。</p>
    `,
    slug: 'getting-started-with-nextjs'
  },
  {
    id: 2,
    title: 'React Hooks完全指南',
    date: '2025-04-03',
    excerpt: '深入了解React Hooks的使用方法和最佳实践...',
    content: `
      <p>自从React 16.8引入Hooks以来，函数组件的能力得到了极大的增强。Hooks使我们能够在不使用类组件的情况下使用状态和其他React特性。</p>
      
      <h2>基础Hooks</h2>
      
      <h3>useState</h3>
      
      <p>useState允许在函数组件中添加状态：</p>
      
      <pre><code>
      import { useState } from 'react';
      
      function Counter() {
        const [count, setCount] = useState(0);
        
        return (
          &lt;div&gt;
            &lt;p&gt;You clicked {count} times&lt;/p&gt;
            &lt;button onClick={() => setCount(count + 1)}&gt;
              Click me
            &lt;/button&gt;
          &lt;/div&gt;
        );
      }
      </code></pre>
      
      <h3>useEffect</h3>
      
      <p>useEffect让你在函数组件中执行副作用：</p>
      
      <pre><code>
      import { useState, useEffect } from 'react';
      
      function Example() {
        const [count, setCount] = useState(0);
        
        useEffect(() => {
          document.title = \`You clicked \${count} times\`;
        }, [count]);
        
        return (
          &lt;div&gt;
            &lt;p&gt;You clicked {count} times&lt;/p&gt;
            &lt;button onClick={() => setCount(count + 1)}&gt;
              Click me
            &lt;/button&gt;
          &lt;/div&gt;
        );
      }
      </code></pre>
      
      <h3>useContext</h3>
      
      <p>useContext让你在不使用Consumer组件的情况下使用React Context：</p>
      
      <pre><code>
      import { useContext } from 'react';
      import { ThemeContext } from './theme-context';
      
      function ThemedButton() {
        const theme = useContext(ThemeContext);
        return (
          &lt;button style={{ background: theme.background, color: theme.foreground }}&gt;
            Styled by theme context!
          &lt;/button&gt;
        );
      }
      </code></pre>
      
      <h2>自定义Hooks</h2>
      
      <p>你可以创建自己的Hooks来复用组件逻辑：</p>
      
      <pre><code>
      import { useState, useEffect } from 'react';
      
      function useFetch(url) {
        const [data, setData] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        
        useEffect(() => {
          const fetchData = async () => {
            try {
              setLoading(true);
              const response = await fetch(url);
              const json = await response.json();
              setData(json);
              setLoading(false);
            } catch (error) {
              setError(error);
              setLoading(false);
            }
          };
          
          fetchData();
        }, [url]);
        
        return { data, loading, error };
      }
      </code></pre>
      
      <p>这只是React Hooks的基础介绍。在实践中，还有许多高级用法和模式值得探索。</p>
    `,
    slug: 'complete-guide-to-react-hooks'
  },
  {
    id: 3,
    title: '现代CSS技巧与窍门',
    date: '2025-04-02',
    excerpt: '探索现代CSS的强大功能和一些有用的技巧...',
    content: `
      <p>CSS在近年来有了长足的发展，现代CSS提供了许多强大的功能，帮助开发者创建更加灵活和响应式的布局。</p>
      
      <h2>CSS Grid布局</h2>
      
      <p>CSS Grid是一个二维布局系统，非常适合创建复杂的页面布局：</p>
      
      <pre><code>
      .grid-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        grid-gap: 20px;
      }
      </code></pre>
      
      <p>上面的代码创建了一个响应式网格，每列最小宽度为250px，且能自动填充可用空间。</p>
      
      <h2>CSS变量（自定义属性）</h2>
      
      <p>CSS变量允许你定义可重用的值，使得主题化和全局样式修改变得简单：</p>
      
      <pre><code>
      :root {
        --primary-color: #0070f3;
        --secondary-color: #ff4081;
        --font-family: 'Segoe UI', Roboto, sans-serif;
      }
      
      .button {
        background-color: var(--primary-color);
        font-family: var(--font-family);
        padding: 10px 15px;
        border: none;
        border-radius: 4px;
        color: white;
      }
      </code></pre>
      
      <h2>Flexbox布局</h2>
      
      <p>Flexbox是一种一维布局方法，用于排列项目组：</p>
      
      <pre><code>
      .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      </code></pre>
      
      <h2>媒体查询与响应式设计</h2>
      
      <p>使用媒体查询创建响应式设计：</p>
      
      <pre><code>
      /* 基础样式适用于所有设备 */
      .content {
        padding: 20px;
      }
      
      /* 针对平板和更大设备的样式 */
      @media (min-width: 768px) {
        .content {
          padding: 40px;
          max-width: 700px;
          margin: 0 auto;
        }
      }
      
      /* 针对桌面设备的样式 */
      @media (min-width: 1024px) {
        .content {
          max-width: 960px;
        }
      }
      </code></pre>
      
      <h2>CSS动画与过渡</h2>
      
      <p>使用CSS创建平滑的动画效果：</p>
      
      <pre><code>
      .button {
        background-color: #0070f3;
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 4px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
      }
      </code></pre>
      
      <p>这些只是现代CSS的一小部分功能。随着CSS的不断发展，我们有了更多强大的工具来创建现代化的网页设计。</p>
    `,
    slug: 'modern-css-tips-and-tricks'
  }
];

export default function Post() {
  const router = useRouter();
  const { slug } = router.query;
  
  // 查找与当前slug匹配的文章
  const post = posts.find(post => post.slug === slug);
  
  // 如果文章不存在或页面仍在加载中
  if (router.isFallback || !post) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }
  
  return <BlogDetail post={post} />;
} 