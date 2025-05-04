import Link from 'next/link';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import { getAllPosts } from '../lib/posts';

export async function getStaticProps() {
  // 从文件系统获取所有文章
  const posts = getAllPosts();
  
  // 获取最新的3篇文章作为特色文章
  const featuredPosts = posts.slice(0, 3);
  
  return {
    props: {
      featuredPosts
    },
    // 每60秒重新生成页面
    revalidate: 60
  };
}

export default function Home({ featuredPosts = [] }) {
  return (
    <Layout>
      {/* 英雄区 */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
            欢迎来到我的博客
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-50 max-w-3xl mx-auto">
            这是一个使用Next.js和Tailwind CSS构建的个人博客，分享技术知识和个人见解
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/posts" className="btn text-base px-8 py-3 rounded-md">
              浏览文章
            </Link>
            <Link href="/about" className="btn btn-outline bg-white text-primary-700 text-base px-8 py-3 rounded-md">
              关于我
            </Link>
          </div>
        </div>
      </section>

      {/* 新功能提示 */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-10 flex items-center">
        <div className="bg-primary-100 rounded-full p-2 mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-grow">
          <h3 className="text-primary-800 font-bold text-lg">新功能：讯飞星火AI聊天助手</h3>
          <p className="text-primary-700">现在您可以与我们的AI助手进行实时对话，获取专业的问答服务。由讯飞星火API提供智能语言支持。</p>
        </div>
        <Link href="/chat" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg whitespace-nowrap flex items-center">
          立即体验
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      {/* 特色文章 */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">最新文章</h2>
          <Link href="/posts" className="text-primary-600 hover:text-primary-700 flex items-center">
            查看全部
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* 博客简介 */}
      <section className="grid md:grid-cols-2 gap-8 items-center bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="text-2xl font-bold mb-4">关于这个博客</h2>
          <p className="text-gray-600 mb-4">
            这个博客是我分享技术见解、编程经验和个人成长的平台。我热衷于探索前端和后端技术，并在这里记录我的学习历程。
          </p>
          <p className="text-gray-600 mb-6">
            如果你对Web开发、React、Next.js或其他技术话题感兴趣，我相信你会在这里找到有价值的内容。
          </p>
          <Link href="/about" className="btn px-6 py-2">
            了解更多
          </Link>
        </div>
        <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-gray-600">这里将来可以放置博主照片或个性化图标</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}