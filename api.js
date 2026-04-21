const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api';
    }
    
    return '/api';
  }
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = {
  auth: {
    register: async (username, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return response.json();
    },
    
    login: async (username, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return response.json();
    },
    
    profile: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    }
  },
  
  bondians: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/bondians?${query}`);
      return response.json();
    },
    
    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/bondians/${id}`);
      return response.json();
    },
    
    create: async (data) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bondians`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    
    update: async (id, data) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bondians/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    
    delete: async (id) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bondians/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    
    getTypes: async () => {
      const response = await fetch(`${API_BASE_URL}/bondians/types/all`);
      return response.json();
    },
    
    getRegions: async () => {
      const response = await fetch(`${API_BASE_URL}/bondians/regions/all`);
      return response.json();
    }
  },
  
  comments: {
    getByBondian: async (bondianId) => {
      const response = await fetch(`${API_BASE_URL}/comments/bondian/${bondianId}`);
      return response.json();
    },
    
    create: async (bondianId, content, parentId = null) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bondianId, content, parentId })
      });
      return response.json();
    },
    
    delete: async (id) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    }
  },
  
  favorites: {
    add: async (bondianId) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bondianId })
      });
      return response.json();
    },
    
    remove: async (bondianId) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/favorites/bondian/${bondianId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    
    getUserFavorites: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/favorites/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    
    check: async (bondianId) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/favorites/check/${bondianId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    }
  },
  
  stats: {
    get: async () => {
      const response = await fetch(`${API_BASE_URL}/stats`);
      return response.json();
    },
    
    getAdmin: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stats/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    
    getUser: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stats/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    }
  }
};

const auth = {
  isLoggedIn: () => {
    return localStorage.getItem('token') !== null;
  },
  
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  clearToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export { api, auth };
