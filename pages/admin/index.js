import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout, { updateBlogSettings } from '../../components/Layout';

export default function AdminIndex() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  
  // 获取文章列表
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/posts');
      if (!response.ok) {
        throw new Error(`获取文章失败: ${response.status}`);
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error('获取文章列表出错:', err);
      setError('获取文章列表失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 组件挂载时获取文章
  useEffect(() => {
    fetchPosts();
  }, []);
  
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
  const handleDeletePost = async (id) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      try {
        const response = await fetch(`/api/posts?id=${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`删除失败: ${response.status}`);
        }
        
        // 删除成功后更新列表
        setPosts(posts.filter(post => post.id !== id));
        alert('文章已成功删除');
      } catch (err) {
        console.error('删除文章出错:', err);
        alert('删除文章失败: ' + err.message);
      }
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
        
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        )}
        
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
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          {/* 搜索和过滤 */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="搜索文章..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // 重置到第一页
                  }}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <label htmlFor="status-filter" className="text-sm text-gray-600">状态:</label>
              <select
                id="status-filter"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1); // 重置到第一页
                }}
              >
                <option value="全部">全部</option>
                <option value="已发布">已发布</option>
                <option value="草稿">草稿</option>
              </select>
              
              <button 
                onClick={fetchPosts}
                className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-md flex items-center"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                刷新
              </button>
            </div>
          </div>
          
          {!loading && (
            <>
              {/* 表格 */}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      标题
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日期
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPosts.length > 0 ? (
                    currentPosts.map((post) => (
                      <tr key={post.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{post.title}</div>
                          <div className="text-sm text-gray-500">/posts/{post.slug}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{post.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.status === '已发布' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/posts/${post.slug}`} className="text-primary-600 hover:text-primary-900" target="_blank">
                              查看
                            </Link>
                            <Link href={`/admin/edit/${post.id}`} className="text-indigo-600 hover:text-indigo-900">
                              编辑
                            </Link>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        {error ? '加载文章失败' : '没有找到符合条件的文章'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* 分页 */}
              {filteredPosts.length > 0 && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        显示第 <span className="font-medium">{indexOfFirstPost + 1}</span> 到 <span className="font-medium">{Math.min(indexOfLastPost, filteredPosts.length)}</span> 条，共 <span className="font-medium">{filteredPosts.length}</span> 条
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">上一页</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {renderPageNumbers()}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">下一页</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
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
