// Main Application Logic
const App = {
  currentView: 'todos',
  currentFilter: 'all',
  searchQuery: '',
  expenseFilter: 'all',  
  expenseSearchQuery: '',  
  userData: null,
  todosData: [],
  expensesData: [],
  coursesData: [],

  // Initialize app
  async init() {
    this.initTheme();
    await this.checkAuth();
    this.setupEventListeners();
  },

  // Check authentication
  async checkAuth() {
    const token = await API.getToken();

    if (token) {
      try {
        const response = await API.auth.getMe();
        if (response.success) {
          this.userData = response.data;
          this.showApp();
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        await API.removeToken();
      }
    }

    this.showAuth();
  },

  // Show auth screen
  showAuth() {
    document.getElementById('authScreen').classList.add('active');
    document.getElementById('appScreen').classList.remove('active');
  },

  // Show app screen
  showApp() {
    document.getElementById('authScreen').classList.remove('active');
    document.getElementById('appScreen').classList.add('active');
    document.getElementById('userName').textContent = this.userData.name;
    this.loadCurrentView();
  },

  // Setup event listeners
  setupEventListeners() {

    // Todo Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        App.searchQuery = e.target.value;
        UI.renderTodos(App.todosData, App.currentFilter, App.searchQuery);
      });
    }

    // Search input
    const expensesSearchInput = document.getElementById('expenseSearchInput');
    if (expensesSearchInput) {
      expensesSearchInput.addEventListener('input', (e) => {
        App.expenseSearchQuery = e.target.value;
        UI.renderExpenses(App.expensesData, App.expenseFilter, App.expenseSearchQuery);
      });
    }


    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));

        tab.classList.add('active');
        const tabName = tab.dataset.tab;
        document.getElementById(`${tabName}Form`).classList.remove('hidden');
      });
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      try {
        const response = await API.auth.login(email, password);
        if (response.success) {
          this.userData = response.data;
          this.showApp();
          utils.showToast('Login successful!', 'success');
        }
      } catch (error) {
        document.getElementById('authError').textContent = error.message;
        document.getElementById('authError').classList.remove('hidden');
      }
    });

    // Register form
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;

      try {
        const response = await API.auth.register(name, email, password);
        if (response.success) {
          this.userData = response.data;
          this.showApp();
          utils.showToast('Registration successful!', 'success');
        }
      } catch (error) {
        document.getElementById('authError').textContent = error.message;
        document.getElementById('authError').classList.remove('hidden');
      }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await API.auth.logout();
      this.showAuth();
      utils.showToast('Logged out successfully', 'success');
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
      this.toggleTheme();
    });

    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const view = tab.dataset.view;
        this.switchView(view);
      });
    });

    // Filter chips (for todos)
    document.querySelectorAll('.filter-chips .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        App.currentFilter = chip.dataset.filter;
        UI.renderTodos(App.todosData, App.currentFilter, App.searchQuery);
      });
    });

    // Add buttons
    document.getElementById('addTodoBtn').addEventListener('click', () => UI.showTodoModal());
    document.getElementById('addExpenseBtn').addEventListener('click', () => UI.showExpenseModal());
    document.getElementById('addCourseBtn').addEventListener('click', () => UI.showCourseModal());

    // Modal close
    document.getElementById('closeModal').addEventListener('click', () => UI.hideModal());
    document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'modalOverlay') {
        UI.hideModal();
      }
    });
  },

  // Switch view
  switchView(view) {
    this.currentView = view;

    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === view);
    });

    // Update views
    document.querySelectorAll('.view').forEach(v => {
      v.classList.remove('active');
    });
    document.getElementById(`${view}View`).classList.add('active');

    // Load data for the view
    this.loadCurrentView();
  },

  // Load current view data
  async loadCurrentView() {
    switch (this.currentView) {
      case 'todos':
        await this.loadTodos();
        break;
      case 'expenses':
        await this.loadExpenses();
        break;
      case 'courses':
        await this.loadCourses();
    }
  },

  // Load todos
  async loadTodos() {
    try {
      const response = await API.todos.getAll();
      if (response.success) {
        this.todosData = response.data;
        UI.renderTodos(this.todosData, this.currentFilter, this.searchQuery);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
      document.getElementById('todosList').innerHTML = `
        <div class="empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p>Failed to load tasks</p>
        </div>
      `;
    }
  },

  // Load expenses
  async loadExpenses() {
  try {
    const response = await API.expenses.getAll();
    if (response.success) {
      this.expensesData = response.data;
      UI.renderExpenses(this.expensesData, this.expenseFilter, this.expenseSearchQuery);
      UI.updateExpenseStats(this.expensesData);
    }
  } catch (error) {
    console.error('Failed to load expenses:', error);
    document.getElementById('expensesList').innerHTML = `
      <div class="empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p>Failed to load expenses</p>
      </div>
    `;
  }
},

  // Load courses
  async loadCourses() {
    try {
      const response = await API.courses.getAll();
      if (response.success) {
        this.coursesData = response.data;
        UI.renderCourses(this.coursesData);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      document.getElementById('coursesList').innerHTML = `
        <div class="empty-state">
          <p>Failed to load courses</p>
        </div>
      `;
    }
  },

  // Initialize theme
  initTheme() {
    chrome.storage.local.get([CONFIG.STORAGE_KEYS.THEME], (result) => {
      const theme = result[CONFIG.STORAGE_KEYS.THEME] || CONFIG.THEMES.LIGHT;
      this.applyTheme(theme);
    });
  },

  // Toggle theme
  toggleTheme() {
    chrome.storage.local.get([CONFIG.STORAGE_KEYS.THEME], (result) => {
      const currentTheme = result[CONFIG.STORAGE_KEYS.THEME] || CONFIG.THEMES.LIGHT;
      const newTheme = currentTheme === CONFIG.THEMES.LIGHT ? CONFIG.THEMES.DARK : CONFIG.THEMES.LIGHT;

      chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.THEME]: newTheme }, () => {
        this.applyTheme(newTheme);
        utils.showToast(`Switched to ${newTheme} mode`, 'success');
      });
    });
  },

  // Apply theme
  applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
  }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Add toast animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);