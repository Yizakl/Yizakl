import { savePost } from '../../lib/posts';

export default function handler(req, res) {
  // 只处理POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  try {
    const { title, content, slug } = req.body;
    
    // 简单的验证
    if (!title || !content || !slug) {
      return res.status(400).json({ error: '请提供文章标题、内容和slug' });
    }
    
    // 生成新文章
    const newPost = {
      id: Date.now(), // 使用时间戳作为ID
      title,
      date: new Date().toISOString().split('T')[0],
      excerpt: content.length > 150 ? `${content.substring(0, 150)}...` : content,
      content,
      status: '已发布',
      slug,
      tags: []
    };
    
    // 保存新文章到文件系统
    const success = savePost(newPost);
    
    if (!success) {
      return res.status(500).json({ error: '保存文章失败' });
    }
    
    // 重定向到新创建的文章页面
    res.setHeader('Content-Type', 'application/json');
    return res.status(201).json({ 
      success: true, 
      message: '文章创建成功',
      post: newPost,
      redirect: `/posts/${slug}`
    });
  } catch (error) {
    console.error('创建文章出错:', error);
    return res.status(500).json({ error: '创建文章时发生错误' });
  }
}