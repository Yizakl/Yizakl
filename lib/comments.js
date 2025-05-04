import fs from 'fs';
import path from 'path';

// 评论存储目录
const commentsDirectory = path.join(process.cwd(), 'content/comments');

// 确保评论目录存在
function ensureCommentsDirectory() {
  if (!fs.existsSync(commentsDirectory)) {
    fs.mkdirSync(commentsDirectory, { recursive: true });
  }
}

// 获取文章的所有评论
export function getCommentsByPostSlug(postSlug) {
  ensureCommentsDirectory();
  
  const commentFilePath = path.join(commentsDirectory, `${postSlug}.json`);
  
  if (!fs.existsSync(commentFilePath)) {
    return [];
  }
  
  try {
    const fileContents = fs.readFileSync(commentFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`获取评论出错: ${error.message}`);
    return [];
  }
}

// 添加评论
export function addComment(postSlug, comment) {
  ensureCommentsDirectory();
  
  try {
    const comments = getCommentsByPostSlug(postSlug);
    
    // 创建新评论
    const newComment = {
      id: Date.now(), // 使用时间戳作为ID
      ...comment,
      createdAt: new Date().toISOString()
    };
    
    // 添加到评论列表
    comments.push(newComment);
    
    // 保存到文件
    const commentFilePath = path.join(commentsDirectory, `${postSlug}.json`);
    fs.writeFileSync(commentFilePath, JSON.stringify(comments, null, 2), 'utf8');
    
    return newComment;
  } catch (error) {
    console.error(`添加评论出错: ${error.message}`);
    return null;
  }
}

// 删除评论
export function deleteComment(postSlug, commentId) {
  ensureCommentsDirectory();
  
  try {
    const commentFilePath = path.join(commentsDirectory, `${postSlug}.json`);
    
    if (!fs.existsSync(commentFilePath)) {
      return false;
    }
    
    // 获取当前评论
    const comments = getCommentsByPostSlug(postSlug);
    
    // 找到要删除的评论索引
    const commentIndex = comments.findIndex(comment => comment.id === commentId);
    
    if (commentIndex === -1) {
      return false;
    }
    
    // 删除评论
    comments.splice(commentIndex, 1);
    
    // 保存更新后的评论列表
    fs.writeFileSync(commentFilePath, JSON.stringify(comments, null, 2), 'utf8');
    
    return true;
  } catch (error) {
    console.error(`删除评论出错: ${error.message}`);
    return false;
  }
}