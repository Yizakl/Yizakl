import { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import PostCard from '../../components/PostCard';
import { getAllPosts } from '../../lib/posts';

export async function getStaticProps() {
  // 从文件系统获取所有文章
  const posts = getAllPosts();
  
  return {
    props: {
      allPosts: posts
    },
    // 每60秒重新生成页面
    revalidate: 60
  };
}

export default function Posts({ allPosts = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const postsPerPage = 3;
  
  // 过滤和搜索文章
  const filteredPosts = searchTerm 
    ? allPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allPosts;
  
  // 计算总页数
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  
  // 获取当前页面的文章
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  
  // 页码改变处理
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // 滚动到页面顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
  
  return (
    <Layout title="博客文章" description="我的博客文章列表">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-4">博客文章</h1>
          <div className="h-1 w-20 bg-primary-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            欢迎阅读我的博客文章。这里你可以找到关于Web开发、编程技巧和最佳实践的内容。
          </p>
        </header>
        
        {/* 搜索框 */}
        <div className="mb-8">
          <div className="relative max-w-lg mx-auto">
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

        {currentPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 mb-16">
            {currentPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">没有找到符合条件的文章</p>
          </div>
        )}

        {/* 分页 */}
        {filteredPosts.length > 0 && (
          <div className="flex justify-center mt-12 mb-8">
            <nav className="flex items-center">
              <button 
                className="px-3 py-2 border rounded-l-md bg-white text-gray-500 border-gray-300 hover:bg-gray-50 disabled:opacity-50" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                上一页
              </button>
              
              {renderPageNumbers()}
              
              <button 
                className="px-3 py-2 border rounded-r-md bg-white text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
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