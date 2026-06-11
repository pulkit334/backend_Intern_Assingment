import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const usePosts = (endpoint, deps = []) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { client: API } = useContext(AuthContext);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get(endpoint);
      setPosts(data.posts || data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetchPosts(); }, deps);

  const invalidate = () => fetchPosts();

  return { posts, loading, error, setPosts, invalidate };
};
