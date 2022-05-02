import axios from 'axios';

export const requester = axios.create();

requester.interceptors.request.use(config => {
  return config;
})