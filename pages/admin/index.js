import { useState } from 'react';
import Link from 'next/link';
import Layout, { updateBlogSettings } from '../../components/Layout';

// 模拟的博客文章数据
const initialPosts = [
  {
    id: 1,
    title: '开始使用Next.js构建博客',
    date: '2025-04-04',
    status: '已发布',
    slug: 'getting-started-with-nextjs'
  },
  {
    id: 2,
    title: 'React Hooks完全指南',
    date: '2025-04-03',
    status: '已发布',
    slug: 'complete-guide-to-react-hooks'
  },
  {
    id: 3,
    title: '现代CSS技巧与窍门',
    date: '2025-04-02',
    status: '已发布',
    slug: 'modern-css-tips-and-tricks'
  },
  {
    id: 4,
    title: '如何优化Next.js应用性能',
    date: '2025-04-01',
    status: '草稿',
    slug: 'how-to-optimize-nextjs-performance'
  },
  {
    id: 5,
    title: '响应式网页设计基础',
    date: '2025-03-30',
    status: '已发布',
    slug: 'responsive-web-design-basics'
  },
  {
    id: 6,
    title: 'JavaScript性能优化技巧',
    date: '2025-03-28',
    status: '草稿',
    slug: 'javascript-performance-tips'
  },
  {
    id: 7,
    title: 'Web安全入门指南',
    date: '2025-03-26',
    status: '已发布',
    slug: 'web-security-basics'
  }
];

export default function AdminIndex() {
  const [posts, setPosts] = useState(initialPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [blogTitle, setBlogTitle] = useState('我的技术博客');
  const [aboutText, setAboutText] = useState('这是一个关于Web开发和技术的博客。');
  const [personalInfo, setPersonalInfo] = useState({
    name: '管理员',
    email: 'yizakl@iCloud.com',
    github: 'https://github.com/Yizakl',
    twitter: ''
  });
  
  // 搜索和过滤处理
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '全部' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  // 分页处理
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  
  // 删除文章处理
  const handleDeletePost = (id) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      setPosts(posts.filter(post => post.id !== id));
    }
  };
  
  // 页码改变处理
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  // 生成页码按钮
  const renderPageNumbers = () => {
    const pageNumbers = [];
    // 最多显示5个页码按钮
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 border-t border-b ${
            i === currentPage ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return pageNumbers;
  };
  
  // 保存设置
  const saveSettings = (e) => {
    e.preventDefault();
    
    try {
      console.log('正在保存设置，更新前的值:', {
        title: blogTitle, 
        contactInfo: personalInfo
      });
      
      // 确保updateBlogSettings函数可用
      if (typeof updateBlogSettings !== 'function') {
        throw new Error('updateBlogSettings 函数未定义或不是一个函数');
      }
      
      // 准备联系信息对象，确保所有字段存在
      const contactInfoObj = {
        name: personalInfo.name || '',
        email: personalInfo.email || '',
        github: personalInfo.github || '',
        twitter: personalInfo.twitter || ''
      };
      
      // 使用导出的全局更新函数更新设置
      const result = updateBlogSettings(blogTitle, contactInfoObj);
      
      console.log('设置已更新，返回结果:', result);
      
      // 提示用户设置已保存
      alert('设置已保存！博客标题和联系方式已更新。');
      setShowSettings(false);
      
      // 强制刷新页面以确保所有组件都显示最新设置
      window.location.reload();
    } catch (error) {
      console.error('保存设置时出错:', error);
      alert('保存设置时出错: ' + (error.message || '未知错误'));
    }
  };
  
  return (
    <Layout title="博客管理后台" description="管理您的博客文章">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">博客管理后台</h1>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              设置
            </button>
            <Link href="/admin/new" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建文章
            </Link>
          </div>
        </div>
        
        {/* 博客设置面板 */}
        {showSettings && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6 space-y-6 border border-gray-700">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
              <h2 className="text-xl font-bold text-gray-100">博客设置</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={saveSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 基本设置 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-200">基本设置</h3>
                  
                  <div>
                    <label htmlFor="blogTitle" className="block text-sm font-medium text-gray-300 mb-1">
                      博客标题
                    </label>
                    <input
                      type="text"
                      id="blogTitle"
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-200"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="aboutText" className="block text-sm font-medium text-gray-300 mb-1">
                      关于博客
                    </label>
                    <textarea
                      id="aboutText"
                      value={aboutText}
                      onChange={(e) => setAboutText(e.target.value)}
                      rows={3}
                      className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-200"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="postsPerPage" className="block text-sm font-medium text-gray-300 mb-1">
                      每页文章数
                    </label>
                    <select
                      id="postsPerPage"
                      value={postsPerPage}
                      onChange={(e) => setPostsPerPage(Number(e.target.value))}
                      className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-200"
                    >
                      <option value={3}>3</option>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                    </select>
                  </div>
                </div>
                
                {/* 个人信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-200">个人信息</h3>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                      姓名
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                      className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-200"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      邮箱
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                      className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-200"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="github" className="block text-sm font-medium text-gray-300 mb-1">
                      GitHub链接
                    </label>
                    <input
                      type="url"
                      id="github"
                      value={personalInfo.github}
                      onChange={(e) => setPersonalInfo({...personalInfo, github: e.target.value})}
                      className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-200"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-300 mb-1">
                      Twitter链接
                    </label>
                    <input
                      type="url"
                      id="twitter"
                      value={personalInfo.twitter}
                      onChange={(e) => setPersonalInfo({...personalInfo, twitter: e.target.value})}
                      className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-200"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-700 border border-primary-700 rounded-md text-white hover:bg-primary-800"
                >
                  保存设置
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* 筛选控制 */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-700">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="搜索文章..."
                className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-200"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // 重置到第一页
                }}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-300">状态筛选：</label>
            <select
              className="block w-full pl-3 pr-10 py-2 bg-gray-700 border border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md text-gray-200"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // 重置到第一页
              }}
            >
              <option>全部</option>
              <option>已发布</option>
              <option>草稿</option>
            </select>
          </div>
        </div>
        
        {/* 文章列表 */}
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">文章标题</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">发布日期</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">状态</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {currentPosts.length > 0 ? (
                  currentPosts.map(post => (
                    <tr key={post.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-200">{post.title}</div>
                        <div className="text-sm text-gray-400">/{post.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{post.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.status === '已发布' ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/posts/${post.slug}`} className="text-gray-400 hover:text-gray-200" title="查看">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link href={`/admin/edit/${post.id}`} className="text-indigo-400 hover:text-indigo-300" title="编辑">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button 
                            onClick={() => handleDeletePost(post.id)} 
                            className="text-red-400 hover:text-red-300"
                            title="删除"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-400">
                      没有找到符合条件的文章
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 分页 */}
        {filteredPosts.length > 0 && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center">
              <button 
                className="px-3 py-2 border rounded-l-md bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 disabled:opacity-50" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                上一页
              </button>
              
              {renderPageNumbers()}
              
              <button 
                className="px-3 py-2 border rounded-r-md bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                下一页
              </button>
            </nav>
          </div>
        )}
      </div>
    </Layout>
  );
}
