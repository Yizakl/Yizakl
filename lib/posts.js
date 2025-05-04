import fs from 'fs';
import path from 'path';

// 文章存储目录
const postsDirectory = path.join(process.cwd(), 'content/posts');

// 确保文章目录存在
function ensurePostsDirectory() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

// 获取所有文章
export function getAllPosts() {
  ensurePostsDirectory();
  
  // 如果目录为空，返回API中的默认文章
  const fileNames = fs.readdirSync(postsDirectory);
  if (fileNames.length === 0) {
    return [];
  }
  
  const allPosts = fileNames.map(fileName => {
    // 移除 .json 扩展名获取 slug
    const slug = fileName.replace(/\.json$/, '');
    
    // 读取文章内容
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const post = JSON.parse(fileContents);
    
    // 确保文章有slug
    return {
      ...post,
      slug
    };
  });
  
  // 按日期排序
  return allPosts.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

// 通过slug获取文章
export function getPostBySlug(slug) {
  ensurePostsDirectory();
  
  try {
    const fullPath = path.join(postsDirectory, `${slug}.json`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const post = JSON.parse(fileContents);
    
    return {
      ...post,
      slug
    };
  } catch (error) {
    console.error(`获取文章出错: ${error.message}`);
    return null;
  }
}

// 创建或更新文章
export function savePost(post) {
  ensurePostsDirectory();
  
  try {
    const { slug } = post;
    if (!slug) {
      throw new Error('文章必须有slug');
    }
    
    const fullPath = path.join(postsDirectory, `${slug}.json`);
    fs.writeFileSync(fullPath, JSON.stringify(post, null, 2), 'utf8');
    
    return true;
  } catch (error) {
    console.error(`保存文章出错: ${error.message}`);
    return false;
  }
}

// 删除文章
export function deletePost(slug) {
  ensurePostsDirectory();
  
  try {
    const fullPath = path.join(postsDirectory, `${slug}.json`);
    if (!fs.existsSync(fullPath)) {
      return false;
    }
    
    fs.unlinkSync(fullPath);
    return true;
  } catch (error) {
    console.error(`删除文章出错: ${error.message}`);
    return false;
  }
}

// 初始化默认文章
export function initializeDefaultPosts(defaultPosts) {
  ensurePostsDirectory();
  
  // 检查文章目录是否为空
  const fileNames = fs.readdirSync(postsDirectory);
  if (fileNames.length > 0) {
    return; // 已有文章，不初始化
  }
  
  // 保存默认文章到文件系统
  defaultPosts.forEach(post => {
    savePost(post);
  });
}