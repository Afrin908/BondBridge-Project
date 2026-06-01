// import axios from 'axios';

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const userInfo = localStorage.getItem('userInfo');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (userInfo) {
    const parsedUser = JSON.parse(userInfo);

    if (parsedUser.token) {
      config.headers.Authorization = `Bearer ${parsedUser.token}`;
    }
  }

  return config;
});

export default API;