// 模拟的博客文章数据存储
let posts = [
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
    `,
    status: '已发布',
    slug: 'getting-started-with-nextjs',
    tags: ['Next.js', 'React', 'Web开发']
  },
  {
    id: 2,
    title: 'React Hooks完全指南',
    date: '2025-04-03',
    excerpt: '深入了解React Hooks的使用方法和最佳实践...',
    content: `
      <p>React Hooks是React 16.8引入的新特性，它允许你在不编写class组件的情况下使用state和其他React特性。</p>
      
      <h2>为什么使用Hooks?</h2>
      
      <p>Hooks解决了React中的许多问题：</p>
      
      <ul>
        <li>复用有状态逻辑困难</li>
        <li>复杂组件难以理解</li>
        <li>类组件的缺点（this指向问题等）</li>
      </ul>
    `,
    status: '已发布',
    slug: 'complete-guide-to-react-hooks',
    tags: ['React', 'Hooks', 'JavaScript']
  },
  {
    id: 3,
    title: '现代CSS技巧与窍门',
    date: '2025-04-02',
    excerpt: '探索现代CSS的强大功能和一些有用的技巧...',
    content: `
      <p>CSS在近年来有了长足的发展，现代CSS提供了许多强大的功能，帮助开发者创建更加灵活和响应式的布局。</p>
      
      <h2>CSS Grid布局</h2>
      
      <p>CSS Grid是一个二维布局系统，非常适合创建复杂的页面布局。</p>
    `,
    status: '已发布',
    slug: 'modern-css-tips-and-tricks',
    tags: ['CSS', 'Web设计', '前端']
  }
];

export default function handler(req, res) {
  // 处理获取所有文章请求
  if (req.method === 'GET') {
    // 可以添加分页和过滤逻辑
    const { status } = req.query;
    
    if (status) {
      const filteredPosts = posts.filter(post => post.status === status);
      return res.status(200).json(filteredPosts);
    }
    
    return res.status(200).json(posts);
  }
  
  // 处理创建新文章请求
  if (req.method === 'POST') {
    const { title, content, excerpt, slug, status, tags } = req.body;
    
    // 简单的验证
    if (!title || !content) {
      return res.status(400).json({ error: '请提供文章标题和内容' });
    }
    
    // 生成新文章
    const newPost = {
      id: posts.length + 1,
      title,
      date: new Date().toISOString().split('T')[0],
      excerpt: excerpt || `${content.substring(0, 150)}...`,
      content,
      status: status || '草稿',
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      tags: tags || []
    };
    
    // 将新文章添加到数组
    posts.push(newPost);
    
    return res.status(201).json(newPost);
  }
  
  // 处理更新文章请求
  if (req.method === 'PUT') {
    const { id, title, content, excerpt, slug, status, tags } = req.body;
    
    // 简单的验证
    if (!id || !title || !content) {
      return res.status(400).json({ error: '请提供文章ID、标题和内容' });
    }
    
    // 查找要更新的文章
    const postIndex = posts.findIndex(post => post.id === parseInt(id));
    
    if (postIndex === -1) {
      return res.status(404).json({ error: '未找到该文章' });
    }
    
    // 更新文章
    posts[postIndex] = {
      ...posts[postIndex],
      title,
      content,
      excerpt: excerpt || posts[postIndex].excerpt,
      slug: slug || posts[postIndex].slug,
      status: status || posts[postIndex].status,
      tags: tags || posts[postIndex].tags,
      updatedAt: new Date().toISOString()
    };
    
    return res.status(200).json(posts[postIndex]);
  }
  
  // 处理删除文章请求
  if (req.method === 'DELETE') {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: '请提供文章ID' });
    }
    
    const postIndex = posts.findIndex(post => post.id === parseInt(id));
    
    if (postIndex === -1) {
      return res.status(404).json({ error: '未找到该文章' });
    }
    
    // 删除文章
    const deletedPost = posts[postIndex];
    posts = posts.filter(post => post.id !== parseInt(id));
    
    return res.status(200).json(deletedPost);
  }
  
  // 如果请求方法不支持
  return res.status(405).json({ error: '不支持的请求方法' });
} 