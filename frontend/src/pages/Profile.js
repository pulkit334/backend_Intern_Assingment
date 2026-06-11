import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import LoadingScreen from '../components/common/LoadingScreen';

const Profile = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const { client: API, user, updateProfile } = useContext(AuthContext);

  const fetchMyPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/posts/user/${user.id}`);
      setPosts(data.posts || data);
    } catch (err) {
      console.error('Failed to fetch your posts', err);
    } finally {
      setLoading(false);
    }
  }, [API, user.id]);

  useEffect(() => { fetchMyPosts(); }, [fetchMyPosts]);

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    await updateProfile(newName);
    setEditingName(false);
    fetchMyPosts();
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try { await API.delete(`/posts/${postId}`); fetchMyPosts(); }
    catch (err) { console.error('Failed to delete', err); }
  };

  const handleLike = async (postId) => {
    try { await API.post(`/posts/${postId}/like`); fetchMyPosts(); }
    catch (err) { console.error('Failed to like', err); }
  };

  const handleComment = async (postId, commentText) => {
    if (!commentText.trim()) return;
    try { await API.post(`/posts/${postId}/comment`, { text: commentText }); fetchMyPosts(); }
    catch (err) { console.error('Failed to comment', err); }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try { await API.delete(`/posts/${postId}/comment/${commentId}`); fetchMyPosts(); }
    catch (err) { console.error('Failed to delete comment', err); }
  };

  const handleEditPost = async (postId, text, image) => {
    try { await API.patch(`/posts/${postId}`, { text, image }); fetchMyPosts(); }
    catch (err) { console.error('Failed to edit post', err); }
  };

  return (
    <div className="feed-page">
      <header className="feed-header">
        <h1>My Profile</h1>
        <div className="feed-header-right">
          <a href="/feed" className="feed-username">← Feed</a>
        </div>
      </header>

      <main className="feed-main">
        <div className="profile-card">
          <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          {editingName ? (
            <div className="edit-name-row">
              <input value={newName} onChange={e => setNewName(e.target.value)}
                className="edit-name-input" placeholder="New name" autoFocus />
              <button className="btn-save" onClick={handleSaveName}>Save</button>
              <button className="btn-cancel" onClick={() => setEditingName(false)}>Cancel</button>
            </div>
          ) : (
            <>
              <h2 className="profile-name" onClick={() => { setNewName(user?.name); setEditingName(true); }}>
                {user?.name}
                <button className="btn-edit-inline" title="Edit name">✏️</button>
              </h2>
              <p className="profile-email">{user?.email}</p>
              <p className="profile-count">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</p>
            </>
          )}
        </div>

        <h3 className="section-title">Your Posts</h3>
        <div className="posts-feed">
          {loading && <LoadingScreen message="Loading your posts..." />}
          {!loading && posts.map(post => (
            <PostCard
              key={post._id} post={post} currentUserId={user?.id}
              onLike={() => handleLike(post._id)}
              onComment={handleComment}
              onDelete={() => handleDelete(post._id)}
              onDeleteComment={(cid) => handleDeleteComment(post._id, cid)}
              onEdit={(t, i) => handleEditPost(post._id, t, i)}
            />
          ))}
          {!loading && posts.length === 0 && (
            <div className="empty-state">
              <p>You haven't posted anything yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
