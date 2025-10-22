import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add user session for vote tracking
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      config.headers['User-Session'] = userSession;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const pollService = {
  getPolls: async (params = {}) => {
    const response = await api.get('/polls', { params });
    return response.data;
  },

  getPollById: async (pollId) => {
    const response = await api.get(`/polls/${pollId}`);
    return response.data;
  },

  createPoll: async (pollData) => {
    const response = await api.post('/polls', pollData);
    return response.data;
  },

  vote: async (pollId, optionId) => {
    const response = await api.post(`/polls/${pollId}/vote`, { optionId });
    return response.data;
  },

  getPollResults: async (pollId) => {
    const response = await api.get(`/polls/${pollId}/results`);
    return response.data;
  },

  deletePoll: async (pollId) => {
    const response = await api.delete(`/polls/${pollId}`);
    return response.data;
  }
};

export default pollService;