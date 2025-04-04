import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';

export default function NewPost() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState('草稿');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  
  // 标题变更时自动生成slug
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(createSlug(newTitle));
  };
  
  // 创建slug的辅助函数
  const createSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };
  
  // 表单提交处理
  const handleSubmit = async (e, submitStatus = status) => {
    e.preventDefault();
    
    // 表单验证
    if (!title.trim()) {
      setError('标题不能为空');
      return;
    }
    
    if (!content.trim()) {
      setError('内容不能为空');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // 将标签数组转换为字符串数组，确保兼容API
      const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const postData = {
        title,
        slug: slug || createSlug(title),
        content,
        excerpt: excerpt || content.substring(0, 150) + '...',
        status: submitStatus,
        tags: tagsArray
      };
      
      console.log('提交的文章数据:', postData);
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API响应错误:', response.status, errorText);
        throw new Error(`API错误: ${response.status} - ${errorText || '未知错误'}`);
      }
      
      const data = await response.json();
      console.log('创建文章成功:', data);
      
      alert(`文章"${title}"已${submitStatus === '已发布' ? '发布' : '保存为草稿'}成功！`);
      
      // 重定向到文章管理页面
      router.push('/admin');
    } catch (error) {
      console.error('提交文章时出错:', error);
      setError(`提交失败: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 保存为草稿
  const saveDraft = (e) => {
    handleSubmit(e, '草稿');
  };
  
  // 发布文章
  const publishPost = (e) => {
    handleSubmit(e, '已发布');
  };
  
  // 添加标签
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  // 删除标签
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // 处理标签输入的回车事件
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  return (
    <Layout title="创建新文章" description="创建一篇新的博客文章">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">创建新文章</h1>
          <Link href="/admin" className="text-primary-600 hover:text-primary-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回管理页面
          </Link>
        </div>
        
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
        
        <form className="bg-white p-6 rounded-lg shadow-sm space-y-6">
          {/* 标题输入 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              文章标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              required
              value={title}
              onChange={handleTitleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="输入文章标题"
            />
          </div>
          
          {/* Slug输入 */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              文章Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                /posts/
              </span>
              <input
                type="text"
                id="slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 block w-full rounded-none rounded-r-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="your-article-slug"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              这是文章的URL路径，自动根据标题生成。可以手动修改，只能包含小写字母、数字和连字符。
            </p>
          </div>
          
          {/* 摘要输入 */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
              文章摘要
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="输入文章摘要（可选，不填将自动提取正文前150个字符）"
            ></textarea>
          </div>
          
          {/* 标签输入 */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              文章标签
            </label>
            <div className="flex">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="输入标签，回车添加"
              />
              <button
                type="button"
                onClick={addTag}
                className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100"
              >
                添加
              </button>
            </div>
            
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary-200 text-primary-800 hover:bg-primary-300"
                    >
                      <svg className="h-2 w-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* 内容输入 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              文章内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono"
              placeholder="在这里输入文章内容..."
            ></textarea>
            <p className="mt-1 text-sm text-gray-500">
              支持Markdown格式（加粗、斜体、链接、图片、列表等）
            </p>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={saveDraft}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {isSubmitting ? '保存中...' : '保存草稿'}
            </button>
            <button
              type="button"
              onClick={publishPost}
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 border border-primary-600 rounded-md text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? '发布中...' : '发布文章'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
