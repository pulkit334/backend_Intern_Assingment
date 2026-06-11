import client from './client';

export const authApi = {
  signup: (data) => client.post('/auth/signup', data),
  login: (data) => client.post('/auth/login', data),
  logout: () => client.post('/auth/logout'),
  getMe: () => client.get('/auth/me'),
  updateProfile: (name) => client.patch('/auth/profile', { name }),
};
