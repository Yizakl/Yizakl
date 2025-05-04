import { getCommentsByPostSlug, addComment, deleteComment } from '../../lib/comments';

export default function handler(req, res) {
  const { slug } = req.query;
  
  // 验证文章slug
  if (!slug) {
    return res.status(400).json({ error: '缺少文章slug参数' });
  }
  
  // 获取评论列表
  if (req.method === 'GET') {
    const comments = getCommentsByPostSlug(slug);
    return res.status(200).json(comments);
  }
  
  // 添加新评论
  if (req.method === 'POST') {
    const { author, content } = req.body;
    
    // 验证评论内容
    if (!author || !content) {
      return res.status(400).json({ error: '评论必须包含作者和内容' });
    }
    
    const newComment = addComment(slug, { author, content });
    
    if (!newComment) {
      return res.status(500).json({ error: '添加评论失败' });
    }
    
    return res.status(201).json(newComment);
  }
  
  // 删除评论
  if (req.method === 'DELETE') {
    const { commentId } = req.body;
    
    if (!commentId) {
      return res.status(400).json({ error: '缺少评论ID' });
    }
    
    const success = deleteComment(slug, commentId);
    
    if (!success) {
      return res.status(404).json({ error: '评论不存在或删除失败' });
    }
    
    return res.status(200).json({ success: true, message: '评论已删除' });
  }
  
  // 不支持的请求方法
  return res.status(405).json({ error: `不支持${req.method}请求方法` });
}