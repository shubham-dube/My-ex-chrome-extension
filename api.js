// API Handler
const API = {
  // Get stored token
  async getToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get([CONFIG.STORAGE_KEYS.TOKEN], (result) => {
        resolve(result[CONFIG.STORAGE_KEYS.TOKEN] || null);
      });
    });
  },

  // Set token
  async setToken(token) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.TOKEN]: token }, resolve);
    });
  },

  // Remove token
  async removeToken() {
    return new Promise((resolve) => {
      chrome.storage.local.remove([CONFIG.STORAGE_KEYS.TOKEN], resolve);
    });
  },

  // Make API request
  async request(endpoint, options = {}) {
    const token = await this.getToken();
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Auth endpoints
  auth: {
    register: async (name, email, password) => {
      const data = await API.request('/auth/register', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({ name, email, password })
      });
      if (data.success && data.data.token) {
        await API.setToken(data.data.token);
      }
      return data;
    },

    login: async (email, password) => {
      const data = await API.request('/auth/login', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({ email, password })
      });
      if (data.success && data.data.token) {
        await API.setToken(data.data.token);
      }
      return data;
    },

    logout: async () => {
      try {
        await API.request('/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        await API.removeToken();
      }
    },

    getMe: async () => {
      return await API.request('/auth/me');
    }
  },

  // Todo endpoints
  todos: {
    getAll: async () => {
      return await API.request('/todos');
    },

    getOne: async (id) => {
      return await API.request(`/todos/${id}`);
    },

    create: async (data) => {
      return await API.request('/todos', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    update: async (id, data) => {
      return await API.request(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    toggle: async (id) => {
      return await API.request(`/todos/${id}/toggle`, {
        method: 'PATCH'
      });
    },

    delete: async (id) => {
      return await API.request(`/todos/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // Expense endpoints
  expenses: {
    getAll: async () => {
      return await API.request('/expenses');
    },

    create: async (data) => {
      return await API.request('/expenses', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    update: async (id, data) => {
      return await API.request(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    delete: async (id) => {
      return await API.request(`/expenses/${id}`, {
        method: 'DELETE'
      });
    },

    getStats: async () => {
      return await API.request('/expenses/stats');
    }
  },

  // Course endpoints
  courses: {
    getAll: async () => {
      return await API.request('/courses');
    },

    getOne: async (id) => {
      return await API.request(`/courses/${id}`);
    },

    create: async (data) => {
      return await API.request('/courses', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    update: async (id, data) => {
      return await API.request(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    delete: async (id) => {
      return await API.request(`/courses/${id}`, {
        method: 'DELETE'
      });
    },

    getTopics: async (id) => {
      return await API.request(`/courses/${id}/topics`);
    }
  },

};