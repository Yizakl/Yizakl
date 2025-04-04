import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// 全局状态（简单实现，实际项目中可以使用Context或Redux等）
let globalBlogTitle = '我的技术博客';
let globalContactInfo = {
  email: 'yizakl@iCloud.com',
  github: 'https://github.com/Yizakl',
  twitter: ''
};

// 提供全局更新函数
export function updateBlogSettings(title, contactInfo) {
  console.log('开始更新博客设置:', { title, contactInfo });
  
  if (title) globalBlogTitle = title;
  if (contactInfo) globalContactInfo = {...globalContactInfo, ...contactInfo};
  
  // 触发自定义事件以通知组件更新
  if (typeof window !== 'undefined') {
    // 使用CustomEvent并传递数据，这样更可靠
    const event = new CustomEvent('blog-settings-updated', { 
      detail: { 
        title: globalBlogTitle, 
        contactInfo: globalContactInfo 
      } 
    });
    window.dispatchEvent(event);
    
    // 保存到localStorage以便页面刷新后保留
    try {
      localStorage.setItem('blogTitle', globalBlogTitle);
      localStorage.setItem('contactInfo', JSON.stringify(globalContactInfo));
      console.log('设置已保存到本地存储');
    } catch (error) {
      console.error('保存设置到localStorage失败:', error);
    }
    
    console.log('设置已更新:', { title: globalBlogTitle, contactInfo: globalContactInfo });
  }
  
  return { title: globalBlogTitle, contactInfo: globalContactInfo };
}

export default function Layout({ children, title, description }) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [blogTitle, setBlogTitle] = useState(globalBlogTitle);
  const [contactInfo, setContactInfo] = useState(globalContactInfo);
  
  // 初始化时从localStorage加载设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTitle = localStorage.getItem('blogTitle');
      const savedContactInfo = localStorage.getItem('contactInfo');
      
      if (savedTitle) {
        globalBlogTitle = savedTitle;
        setBlogTitle(savedTitle);
      }
      
      if (savedContactInfo) {
        try {
          const parsedInfo = JSON.parse(savedContactInfo);
          globalContactInfo = parsedInfo;
          setContactInfo(parsedInfo);
        } catch (e) {
          console.error('解析保存的联系信息失败:', e);
        }
      }
    }
  }, []);
  
  // 监听设置更新事件
  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      // 从事件数据中获取更新后的值
      const { title, contactInfo } = event.detail || {};
      
      if (title) {
        setBlogTitle(title);
      }
      
      if (contactInfo) {
        setContactInfo(contactInfo);
      }
      
      console.log('组件收到设置更新:', { title, contactInfo });
    };
    
    window.addEventListener('blog-settings-updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('blog-settings-updated', handleSettingsUpdate);
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title ? `${title} | ${blogTitle}` : blogTitle}</title>
        <meta name="description" content={description || '一个由Next.js构建的个人博客'} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="bg-gray-800 shadow-md border-b border-gray-700">
        <div className="container-custom">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-400 hover:text-primary-300">
                {blogTitle}
              </Link>
            </div>
            
            <nav className="flex items-center space-x-1">
              <Link href="/" className={`nav-link ${router.pathname === '/' ? 'nav-link-active' : ''}`}>
                首页
              </Link>
              <Link href="/posts" className={`nav-link ${router.pathname.startsWith('/posts') ? 'nav-link-active' : ''}`}>
                博客
              </Link>
              <Link href="/about" className={`nav-link ${router.pathname === '/about' ? 'nav-link-active' : ''}`}>
                关于
              </Link>
              <Link href="/chat" className={`nav-link ${router.pathname === '/chat' ? 'nav-link-active' : ''}`}>
                AI聊天
                <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold text-white bg-primary-700 rounded-full">新</span>
              </Link>
              {/* 添加后台管理链接 */}
              {router.pathname.startsWith('/admin') && (
                <Link href="/admin" className={`nav-link ${router.pathname.startsWith('/admin') ? 'nav-link-active' : ''}`}>
                  后台管理
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-grow py-10">
        <div className="container-custom">
          {children}
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-12 border-t border-gray-700">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">{blogTitle}</h3>
              <p className="text-gray-300 mb-4">
                分享技术、知识和个人经验的个人博客平台
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">链接</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    首页
                  </Link>
                </li>
                <li>
                  <Link href="/posts" className="text-gray-300 hover:text-white transition-colors">
                    博客文章
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                    关于我
                  </Link>
                </li>
                <li>
                  <Link href="/chat" className="text-gray-300 hover:text-white transition-colors">
                    AI聊天
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-gray-300 hover:text-white transition-colors">
                    后台管理
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">联系方式</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {contactInfo.email}
                </li>
                <li className="flex items-center text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <a href={contactInfo.github} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {contactInfo.github.replace('https://', '')}
                  </a>
                </li>
                {contactInfo.twitter && (
                  <li className="flex items-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l3 3 9-9-9-9-3 3 6 6-6 6z" />
                    </svg>
                    <a href={contactInfo.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                      {contactInfo.twitter.replace('https://', '')}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© {currentYear} {blogTitle} - 保留所有权利</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 