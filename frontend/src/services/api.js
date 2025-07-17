import axios from 'axios';

const API_BASE = 'http://localhost:3000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const searchMovies = async (search) => {
  const { data } = await axios.get(`${API_BASE}/movies`, { params: { search } });
  return data;
};

export const getMovieById = async (id) => {
  const { data } = await axios.get(`${API_BASE}/movies/${id}`);
  return data;
};

export const clearCache = async () => {
  const { data } = await axios.delete(`${API_BASE}/cache`, { headers: authHeaders() });
  return data;
};

export const getStats = async () => {
  const { data } = await axios.get(`${API_BASE}/stats`, { headers: authHeaders() });
  return data;
};

export const login = async (username, password) => {
  const { data } = await axios.post(`${API_BASE}/users/login`, { username, password });
  return data;
};

export const register = async (username, password) => {
  const { data } = await axios.post(`${API_BASE}/users/register`, { username, password });
  return data;
};

export const getPaginatedMovies = async ({ search = '', limit = 10, offset = 0, sort = '', filter = '' }) => {
  const { data } = await axios.get(`${API_BASE}/movies-paginated`, { params: { search, limit, offset, sort, filter } });
  return data;
};

export const downloadCSV = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE}/movies-csv`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    responseType: 'blob',
  });
  return response.data;
}; 