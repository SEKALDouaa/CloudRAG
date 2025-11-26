import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_email');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  getLLM: () => api.get('/get-llm'),
  updateLLM: (llmData) => api.put('/update-llm', llmData),
};

// Documents API
export const documentsAPI = {
  uploadDocument: (formData) =>
    api.post('/process-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getDocument: (documentId) => api.get(`/document/${documentId}`),
  getDocumentFile: (documentId) => api.get(`/document_file/${documentId}`, {
    responseType: 'blob',
  }),
  getAllDocuments: () => api.get('/all_document_files'),
  getDocumentsMetadata: () => api.get('/documents/metadata'),
  deleteDocument: (documentId) => api.delete(`/document/${documentId}`),
};

// RAG/Chat API
export const chatAPI = {
  askQuestion: (query) => api.post('/ask', { query }),
  getChatHistory: () => api.get('/chat/history'),
  deleteChatHistory: (historyId) => api.delete(`/chat/history/${historyId}`),
  clearChatHistory: () => api.delete('/chat/history'),
};

export default api;
