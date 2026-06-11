import client from './client';

export const postsApi = {
  getAll: (sort = 'newest') => client.get(`/posts${sort === 'likes' ? '?sort=likes' : ''}`),
  getUserPosts: (userId) => client.get(`/posts/user/${userId}`),
  create: (data) => client.post('/posts', data),
  update: (id, data) => client.patch(`/posts/${id}`, data),
  delete: (id) => client.delete(`/posts/${id}`),
  like: (id) => client.post(`/posts/${id}/like`),
  comment: (id, text) => client.post(`/posts/${id}/comment`, { text }),
  deleteComment: (postId, commentId) => client.delete(`/posts/${postId}/comment/${commentId}`),
  uploadImage: (formData) => client.post('/upload', formData),
};
