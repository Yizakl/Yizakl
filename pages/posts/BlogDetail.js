import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';

// 这个文件将作为博客详情页面的样板，稍后会将它的样式集成到[slug].js中
export default function BlogDetail({ post = {} }) {
  if (!post || Object.keys(post).length === 0) {
    return (
      <Layout title="文章未找到" description="无法加载文章内容">
        <div className="max-w-3xl mx-auto text-center py-12">
          <h1 className="text-3xl font-bold mb-4">文章未找到</h1>
          <p className="mb-8">抱歉，无法加载请求的文章内容</p>
          <Link href="/posts" className="btn-outline py-2 px-4 inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回文章列表
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={post.title} description={post.excerpt}>
      <article className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{post.title}</h1>
          <div className="flex items-center text-gray-500 text-sm">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {post.date}
            </span>
            <span className="mx-3">•</span>
            <span>5 分钟阅读</span>
          </div>
        </div>
        
        <div className="card p-6 md:p-10 mb-10">
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
        
        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags && post.tags.map((tag, index) => (
            <span key={index} className="bg-primary-700 text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
          {!post.tags && (
            <>
              <span className="bg-primary-700 text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded-full">Next.js</span>
              <span className="bg-primary-700 text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded-full">React</span>
              <span className="bg-primary-700 text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded-full">Web开发</span>
            </>
          )}
        </div>
        
        {/* 分享和导航 */}
        <div className="flex flex-wrap justify-between items-center bg-gray-800 p-6 rounded-lg mb-10 border border-gray-700">
          <div className="flex space-x-4">
            <button className="text-gray-400 hover:text-primary-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-primary-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-primary-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
          
          <Link href="/posts" className="btn-outline py-2 px-4 mt-4 sm:mt-0 inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回文章列表
          </Link>
        </div>
        
        {/* 评论部分 */}
        <div className="card p-6 md:p-10">
          <h3 className="text-xl font-bold mb-6">评论 (3)</h3>
          
          <div className="space-y-6">
            {/* 评论表单 */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4">发表评论</h4>
              <div className="flex space-x-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"></div>
                <div className="flex-grow">
                  <textarea
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-200"
                    placeholder="输入你的评论..."
                    rows={3}
                  ></textarea>
                </div>
              </div>
              <div className="text-right">
                <button className="btn py-2 px-6">提交评论</button>
              </div>
            </div>
            
            {/* 单个评论 */}
            <div className="flex space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"></div>
              <div>
                <div className="flex items-center mb-1">
                  <h5 className="font-semibold">张三</h5>
                  <span className="text-gray-400 text-sm ml-2">3天前</span>
                </div>
                <p className="text-gray-300">
                  非常棒的文章！我学到了很多关于Next.js的知识。
                </p>
                <div className="mt-2 flex space-x-4">
                  <button className="text-sm text-gray-400 hover:text-primary-400">
                    回复
                  </button>
                  <button className="text-sm text-gray-400 hover:text-primary-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    赞 (2)
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"></div>
              <div>
                <div className="flex items-center mb-1">
                  <h5 className="font-semibold">李四</h5>
                  <span className="text-gray-400 text-sm ml-2">2天前</span>
                </div>
                <p className="text-gray-300">
                  请问有没有更多关于API路由的介绍？
                </p>
                <div className="mt-2 flex space-x-4">
                  <button className="text-sm text-gray-400 hover:text-primary-400">
                    回复
                  </button>
                  <button className="text-sm text-gray-400 hover:text-primary-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    赞 (0)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
} 