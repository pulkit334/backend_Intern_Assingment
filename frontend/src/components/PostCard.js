import { useState } from 'react';
import { timeAgo } from '../utils/helpers';

const PostCard = ({ post, currentUserId, onLike, onComment, onDelete, onDeleteComment, onEdit }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.text || '');
  const [editImage, setEditImage] = useState(post.image || '');
  const [imgError, setImgError] = useState(false);

  const isLiked = post.likes?.includes(currentUserId) || post.likes?.some?.(id => id._id === currentUserId || id === currentUserId);
  const isOwner = post.userId?._id === currentUserId || post.userId === currentUserId;

  const handleSaveEdit = () => {
    onEdit(editText, editImage);
    setEditing(false);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-avatar">{post.username?.[0]?.toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <p className="post-username">{post.username}</p>
          <p className="post-time">{timeAgo(post.createdAt)}</p>
        </div>
        {isOwner && !editing && (
          <div className="post-owner-actions">
            <button className="btn-icon" onClick={() => setEditing(true)} title="Edit" aria-label="Edit post">✏️</button>
            <button className="btn-icon btn-icon-danger" onClick={onDelete} title="Delete" aria-label="Delete post">🗑️</button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="edit-box">
          <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3} />
          <input value={editImage} onChange={e => setEditImage(e.target.value)} placeholder="Image URL" />
          <div className="edit-actions">
            <button className="btn-save" onClick={handleSaveEdit}>Save</button>
            <button className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {post.text && <p className="post-text">{post.text}</p>}
          {post.image && !imgError && (
            <img className="post-image" src={post.image} alt="Post content" loading="lazy"
              onError={() => setImgError(true)} />
          )}
        </>
      )}

      <div className="post-actions">
        <button className={`action-btn ${isLiked ? 'liked' : ''}`} onClick={onLike}>
          <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
          <span className="action-count">{post.likes?.length || 0}</span>
        </button>
        <button className="action-btn" onClick={() => setShowComments(!showComments)}>
          <span className="action-icon">💬</span>
          <span className="action-count">{post.comments?.length || 0}</span>
        </button>
      </div>

      {showComments && (
        <div className="post-comments">
          {post.comments?.map(c => (
            <div key={c._id} className="comment">
              <div className="comment-avatar">{c.username?.[0]?.toUpperCase()}</div>
              <div className="comment-body">
                <span className="comment-username">{c.username}</span>
                <span className="comment-text">{c.text}</span>
              </div>
              {(c.userId === currentUserId || c.userId?._id === currentUserId) && (
                <button className="btn-del-comment" onClick={() => onDeleteComment(c._id)} aria-label="Delete comment">×</button>
              )}
            </div>
          ))}
          <form className="comment-form" onSubmit={e => { e.preventDefault(); if (commentText.trim()) { onComment(post._id, commentText); setCommentText(''); } }}>
            <input type="text" placeholder="Write a comment..." value={commentText}
              onChange={e => setCommentText(e.target.value)} maxLength={1000} />
            <button type="submit" disabled={!commentText.trim()}>Post</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
