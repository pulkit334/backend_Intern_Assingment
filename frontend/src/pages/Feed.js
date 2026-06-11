import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { STORAGE_KEYS } from '../utils/constants';
import PostCard from '../components/PostCard';
import LoadingScreen from '../components/common/LoadingScreen';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const fileRef = useRef();
  const { client: API, user, logout } = useContext(AuthContext);

  useEffect(() => {
    try {
      const draft = localStorage.getItem(STORAGE_KEYS.DRAFT_POST);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.text || parsed.image) {
          setText(parsed.text || '');
          setImage(parsed.image || '');
        }
      }
    } catch {}
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/posts${sort === 'likes' ? '?sort=likes' : ''}`);
      setPosts(data.posts || data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  }, [sort, API]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    if (showCreate) {
      localStorage.setItem(STORAGE_KEYS.DRAFT_POST, JSON.stringify({ text, image }));
    }
  }, [text, image, showCreate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!text && !imageFile && !image) return;
    setCreating(true);
    try {
      let imgUrl = image || '';
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const { data } = await API.post('/upload', fd);
        imgUrl = data.url;
      }
      await API.post('/posts', { text, image: imgUrl });
      setText(''); setImage(''); setImageFile(null);
      setShowCreate(false);
      localStorage.removeItem(STORAGE_KEYS.DRAFT_POST);
      fetchPosts();
    } catch (err) {
      console.error('Failed to create post', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try { await API.delete(`/posts/${postId}`); fetchPosts(); }
    catch (err) { console.error('Failed to delete', err); }
  };

  const handleLike = async (postId) => {
    try { await API.post(`/posts/${postId}/like`); fetchPosts(); }
    catch (err) { console.error('Failed to like', err); }
  };

  const handleComment = async (postId, commentText) => {
    if (!commentText.trim()) return;
    try {
      await API.post(`/posts/${postId}/comment`, { text: commentText });
      fetchPosts();
    } catch (err) {
      console.error('Failed to comment', err);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try { await API.delete(`/posts/${postId}/comment/${commentId}`); fetchPosts(); }
    catch (err) { console.error('Failed to delete comment', err); }
  };

  const handleEditPost = async (postId, newText, newImage) => {
    try { await API.patch(`/posts/${postId}`, { text: newText, image: newImage }); fetchPosts(); }
    catch (err) { console.error('Failed to edit post', err); }
  };

  const filtered = search
    ? posts.filter(p =>
        p.text?.toLowerCase().includes(search.toLowerCase()) ||
        p.username?.toLowerCase().includes(search.toLowerCase())
      )
    : posts;

  return (
    <div className="feed-page">
      <header className="feed-header">
        <h1>Social</h1>
        <div className="feed-header-right">
          <a href="/profile" className="feed-username">{user?.name}</a>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="feed-main">
        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search posts or people..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>

        <button className="btn-create" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ Create Post'}
        </button>

        {showCreate && (
          <form className="create-post" onSubmit={handleCreate}>
            <textarea
              placeholder="What's on your mind?"
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
            />
            <input
              type="text" placeholder="Image URL (optional)"
              value={image} onChange={e => { setImage(e.target.value); setImageFile(null); }}
            />
            <div className="file-upload-row">
              <span>or upload:</span>
              <input type="file" accept="image/*" ref={fileRef}
                onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImage(''); } }} />
              {imageFile && <span className="file-name">{imageFile.name}</span>}
            </div>
            <button type="submit" disabled={(!text && !image && !imageFile) || creating}>
              {creating ? 'Posting...' : 'Post'}
            </button>
          </form>
        )}

        <div className="posts-feed">
          {loading && <LoadingScreen message="Loading posts..." />}
          {!loading && filtered.map(post => (
            <PostCard
              key={post._id} post={post} currentUserId={user?.id}
              onLike={() => handleLike(post._id)}
              onComment={handleComment}
              onDelete={() => handleDelete(post._id)}
              onDeleteComment={(cid) => handleDeleteComment(post._id, cid)}
              onEdit={(t, i) => handleEditPost(post._id, t, i)}
            />
          ))}
          {!loading && filtered.length === 0 && (
            <div className="empty-state">
              <p>{search ? 'No matching posts' : 'No posts yet. Be the first!'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Feed;
