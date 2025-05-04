import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Comments({ postSlug }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ author: '', content: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  const router = useRouter();
  
  // 加载评论
  useEffect(() => {
    if (!postSlug) return;
    
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/comments?slug=${postSlug}`);
        
        if (!response.ok) {
          throw new Error('获取评论失败');
        }
        
        const data = await response.json();
        setComments(data);
      } catch (err) {
        console.error('加载评论出错:', err);
        setError('加载评论时出错，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [postSlug]);
  
  // 提交评论
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.author.trim() || !newComment.content.trim()) {
      setError('请填写昵称和评论内容');
      return;
    }
    
    try {
      const response = await fetch(`/api/comments?slug=${postSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newComment),
      });
      
      if (!response.ok) {
        throw new Error('提交评论失败');
      }
      
      const addedComment = await response.json();
      
      // 更新评论列表
      setComments([...comments, addedComment]);
      
      // 清空表单
      setNewComment({ author: '', content: '' });
      setError(null);
    } catch (err) {
      console.error('提交评论出错:', err);
      setError('提交评论时出错，请稍后再试');
    }
  };
  
  // 删除评论
  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`/api/comments?slug=${postSlug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId }),
      });
      
      if (!response.ok) {
        throw new Error('删除评论失败');
      }
      
      // 更新评论列表
      setComments(comments.filter(comment => comment.id !== commentId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('删除评论出错:', err);
      setError('删除评论时出错，请稍后再试');
    }
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  return (
    <div className="card p-6 md:p-10">
      <h3 className="text-xl font-bold mb-6">评论 ({comments.length})</h3>
      
      <div className="space-y-6">
        {/* 评论表单 */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-4">发表评论</h4>
          {error && (
            <div className="bg-red-900 text-white p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmitComment}>
            <div className="mb-4">
              <input
                type="text"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-200"
                placeholder="你的昵称"
                value={newComment.author}
                onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
              />
            </div>
            <div className="flex space-x-4 mb-4">
              <div className="flex-grow">
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-200"
                  placeholder="输入你的评论..."
                  rows={3}
                  value={newComment.content}
                  onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                ></textarea>
              </div>
            </div>
            <div className="text-right">
              <button 
                type="submit" 
                className="btn py-2 px-6"
                disabled={isLoading}
              >
                {isLoading ? '提交中...' : '提交评论'}
              </button>
            </div>
          </form>
        </div>
        
        {/* 评论列表 */}
        {isLoading ? (
          <div className="text-center py-4">加载评论中...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-gray-400">暂无评论，来发表第一条评论吧！</div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-gray-300">
                  {comment.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <h5 className="font-semibold">{comment.author}</h5>
                      <span className="text-gray-400 text-sm ml-2">
                        {comment.createdAt ? formatDate(comment.createdAt) : '未知时间'}
                      </span>
                    </div>
                    <button 
                      onClick={() => setShowDeleteConfirm(comment.id)}
                      className="text-sm text-gray-400 hover:text-red-400"
                    >
                      删除
                    </button>
                  </div>
                  <p className="text-gray-300">{comment.content}</p>
                  
                  {/* 删除确认对话框 */}
                  {showDeleteConfirm === comment.id && (
                    <div className="mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg">
                      <p className="text-sm mb-2">确定要删除这条评论吗？</p>
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => setShowDeleteConfirm(null)}
                          className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                        >
                          取消
                        </button>
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs px-2 py-1 bg-red-700 hover:bg-red-600 rounded"
                        >
                          确认删除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}