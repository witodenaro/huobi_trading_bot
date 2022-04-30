import axios from 'axios';

export const requester = axios.create({ baseURL: 'https://api.huobi.pro' });

requester.interceptors.request.use(config => {
  return config;
})