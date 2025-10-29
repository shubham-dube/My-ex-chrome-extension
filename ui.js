// UI Components and Renderers
const UI = {
  // Render todos list
  renderTodos: (todos, filter = 'all', searchQuery = '') => {
    const container = document.getElementById('todosList');

    // Apply filters
    let filteredTodos = todos;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTodos = filteredTodos.filter(t =>
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query)) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Status filter
    switch (filter) {
      case 'pending':
        filteredTodos = filteredTodos.filter(t => !t.completed);
        break;
      case 'completed':
        filteredTodos = filteredTodos.filter(t => t.completed);
        break;
      case 'high-priority':
        filteredTodos = filteredTodos.filter(t => t.priority === 'high' && !t.completed);
        break;
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        filteredTodos = filteredTodos.filter(t =>
          t.dueDate && t.dueDate.split('T')[0] === today && !t.completed
        );
        break;
      case 'recurring':
        filteredTodos = filteredTodos.filter(t => t.recurring?.enabled);
        break;
    }

    if (filteredTodos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p>${searchQuery ? 'No matching tasks' : `No ${filter !== 'all' ? filter : ''} tasks`}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredTodos.map(todo => {
      const recurringInfo = UI.getRecurringInfo(todo);
      const displayTags = todo.tags?.slice(0, 3) || [];
      const remainingTags = (todo.tags?.length || 0) - displayTags.length;

      return `
        <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo._id}">
          <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-id="${todo._id}">
            ${todo.completed ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
          </div>
          <div class="todo-content" data-id="${todo._id}">
            <div class="todo-title">${todo.title}</div>
            ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
            <div class="todo-meta">
              ${todo.priority ? `<span class="priority-badge priority-${todo.priority}">${todo.priority}</span>` : ''}
              ${todo.dueDate ? `<span class="meta-item"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>${utils.formatRelativeTime(todo.dueDate)}</span>` : ''}
              ${todo.category ? `<span class="meta-item"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>${todo.category}</span>` : ''}
              ${recurringInfo ? `<span class="meta-item recurring-badge"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>${recurringInfo}</span>` : ''}
            </div>
            ${displayTags.length > 0 ? `
              <div class="todo-tags">
                ${displayTags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                ${remainingTags > 0 ? `<span class="tag tag-more">+${remainingTags}</span>` : ''}
              </div>
            ` : ''}
          </div>
          <div class="todo-actions">
            <button class="action-btn edit-btn" data-id="${todo._id}" title="Edit">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button class="action-btn delete-btn" data-id="${todo._id}" title="Delete">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Add click handlers for checkbox
    container.querySelectorAll('.todo-checkbox').forEach(checkbox => {
      checkbox.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = checkbox.dataset.id;
        try {
          await API.todos.toggle(id);
          await App.loadTodos();
        } catch (error) {
          utils.showToast('Failed to update task', 'error');
        }
      });
    });

    // Add click handlers for card (toggle completion)
    container.querySelectorAll('.todo-content').forEach(content => {
      content.addEventListener('click', async (e) => {
        const id = content.dataset.id;
        try {
          await API.todos.toggle(id);
          await App.loadTodos();
        } catch (error) {
          utils.showToast('Failed to update task', 'error');
        }
      });
    });

    // Add click handlers for edit button
    container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const todo = todos.find(t => t._id === id);
        UI.showTodoModal(todo);
      });
    });

    // Add click handlers for delete button
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const todo = todos.find(t => t._id === id);
        if (confirm(`Delete "${todo.title}"?`)) {
          try {
            await API.todos.delete(id);
            utils.showToast('Task deleted', 'success');
            await App.loadTodos();
          } catch (error) {
            utils.showToast('Failed to delete task', 'error');
          }
        }
      });
    });
  },

  // Get recurring info text
  getRecurringInfo: (todo) => {
    if (!todo.recurring?.enabled) return null;

    const freq = todo.recurring.frequency;
    const freqMap = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'yearly': 'Yearly'
    };

    return freqMap[freq] || freq;
  },

  showTodoModal: (todo = null) => {
    const isEdit = !!todo;
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = isEdit ? 'Edit Task' : 'New Task';

    const tagsHtml = todo?.tags?.map(tag => `<span class="tag-input-item">${tag}<button type="button" class="tag-remove" data-tag="${tag}">×</button></span>`).join('') || '';

    modalBody.innerHTML = `
      <form id="todoForm" class="compact-form">
        <div class="form-row">
          <div class="form-group">
            <label>Title *</label>
            <input type="text" id="todoTitle" value="${todo?.title || ''}" placeholder="What needs to be done?" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Description</label>
            <textarea id="todoDescription" rows="2" placeholder="Add details...">${todo?.description || ''}</textarea>
          </div>
        </div>

        <div class="form-row form-row-2">
          <div class="form-group">
            <label>Priority</label>
            <select id="todoPriority">
              <option value="">None</option>
              <option value="low" ${todo?.priority === 'low' ? 'selected' : ''}>Low</option>
              <option value="medium" ${todo?.priority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="high" ${todo?.priority === 'high' ? 'selected' : ''}>High</option>
            </select>
          </div>
          <div class="form-group">
            <label>Category</label>
            <input type="text" id="todoCategory" value="${todo?.category || ''}" placeholder="e.g. Work">
          </div>
        </div>

        <div class="form-row form-row-2">
          <div class="form-group">
            <label>Due Date</label>
            <input type="date" id="todoDueDate" value="${todo?.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : ''}">
          </div>
          <div class="form-group">
            <label>Start Date</label>
            <input type="date" id="todoStartDate" value="${todo?.startDate ? new Date(todo.startDate).toISOString().split('T')[0] : ''}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="recurringEnabled" ${todo?.recurring?.enabled ? 'checked' : ''}>
              <span>Recurring Task</span>
            </label>
          </div>
        </div>

        <div id="recurringOptions" class="form-row ${!todo?.recurring?.enabled ? 'hidden' : ''}">
          <div class="form-group">
            <label>Frequency</label>
            <select id="recurringFrequency">
              <option value="daily" ${todo?.recurring?.frequency === 'daily' ? 'selected' : ''}>Daily</option>
              <option value="weekly" ${todo?.recurring?.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
              <option value="monthly" ${todo?.recurring?.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
              <option value="yearly" ${todo?.recurring?.frequency === 'yearly' ? 'selected' : ''}>Yearly</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Tags</label>
            <div class="tag-input-container">
              <div class="tag-input-list" id="tagsList">${tagsHtml}</div>
              <input type="text" id="tagInput" placeholder="Add tag..." class="tag-text-input">
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" id="cancelBtn">Cancel</button>
          <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Create'}</button>
        </div>
      </form>
    `;

    UI.showModal();

    // Handle recurring checkbox
    const recurringCheckbox = document.getElementById('recurringEnabled');
    const recurringOptions = document.getElementById('recurringOptions');

    recurringCheckbox.addEventListener('change', (e) => {
      recurringOptions.classList.toggle('hidden', !e.target.checked);
    });

    // Handle tags
    const tagInput = document.getElementById('tagInput');
    const tagsList = document.getElementById('tagsList');
    let currentTags = todo?.tags ? [...todo.tags] : [];

    const renderTags = () => {
      tagsList.innerHTML = currentTags.map(tag =>
        `<span class="tag-input-item">${tag}<button type="button" class="tag-remove" data-tag="${tag}">×</button></span>`
      ).join('');

      // Add remove handlers
      tagsList.querySelectorAll('.tag-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const tag = btn.dataset.tag;
          currentTags = currentTags.filter(t => t !== tag);
          renderTags();
        });
      });
    };

    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const value = tagInput.value.trim().replace(/,$/g, '');
        if (value && !currentTags.includes(value)) {
          currentTags.push(value);
          renderTags();
          tagInput.value = '';
        }
      }
    });

    // Initial tag render
    renderTags();

    // Form submission
    document.getElementById('todoForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        title: document.getElementById('todoTitle').value,
        description: document.getElementById('todoDescription').value,
        priority: document.getElementById('todoPriority').value || undefined,
        dueDate: document.getElementById('todoDueDate').value || undefined,
        startDate: document.getElementById('todoStartDate').value || undefined,
        category: document.getElementById('todoCategory').value || undefined,
        tags: currentTags.length > 0 ? currentTags : undefined,
        recurring: {
          enabled: document.getElementById('recurringEnabled').checked,
          frequency: document.getElementById('recurringFrequency').value
        }
      };

      try {
        if (isEdit) {
          await API.todos.update(todo._id, data);
          utils.showToast('Task updated', 'success');
        } else {
          await API.todos.create(data);
          utils.showToast('Task created', 'success');
        }
        UI.hideModal();
        await App.loadTodos();
      } catch (error) {
        utils.showToast(error.message || 'Operation failed', 'error');
      }
    });

    document.getElementById('cancelBtn').addEventListener('click', UI.hideModal);
  },



  // Render expenses list
  renderExpenses: (expenses, filter = 'all', searchQuery = '') => {
    const container = document.getElementById('expensesList');

    // Apply search filter
    let filteredExpenses = expenses;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredExpenses = filteredExpenses.filter(e =>
        e.description?.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query) ||
        e.amount.toString().includes(query) ||
        (e.tags && e.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Apply status filters
    const today = new Date();
    switch (filter) {
      case 'today':
        filteredExpenses = filteredExpenses.filter(e => {
          const expenseDate = new Date(e.date);
          return expenseDate.toDateString() === today.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredExpenses = filteredExpenses.filter(e => new Date(e.date) >= weekAgo);
        break;
      case 'month':
        filteredExpenses = filteredExpenses.filter(e => {
          const expenseDate = new Date(e.date);
          return expenseDate.getMonth() === today.getMonth() &&
            expenseDate.getFullYear() === today.getFullYear();
        });
        break;
    }

    if (filteredExpenses.length === 0) {
      container.innerHTML = `
      <div class="empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
        </svg>
        <p>${searchQuery ? 'No matching expenses' : 'No expenses recorded'}</p>
      </div>
    `;
      return;
    }

    // Group expenses by month and week
    const grouped = UI.groupExpensesByPeriod(filteredExpenses);

    let html = '';
    grouped.forEach(monthGroup => {
      const monthTotal = monthGroup.expenses.reduce((sum, e) => sum + e.amount, 0);

      html += `
      <div class="expense-group-month">
        <div class="expense-group-header" data-month="${monthGroup.month}">
          <div class="expense-group-title">
            <svg class="expand-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
            <span>${monthGroup.label}</span>
            <span class="expense-count">${monthGroup.expenses.length}</span>
          </div>
          <div class="expense-group-total">${utils.formatCurrency(monthTotal)}</div>
        </div>
        <div class="expense-group-content" data-month="${monthGroup.month}">
          ${monthGroup.weeks.map(weekGroup => {
        const weekTotal = weekGroup.expenses.reduce((sum, e) => sum + e.amount, 0);
        return `
              <div class="expense-group-week">
                <div class="expense-week-header" data-week="${weekGroup.week}">
                  <div class="expense-week-title">
                    <svg class="expand-icon-small" width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                    <span>${weekGroup.label}</span>
                    <span class="expense-count-small">${weekGroup.expenses.length}</span>
                  </div>
                  <span class="expense-week-total">${utils.formatCurrency(weekTotal)}</span>
                </div>
                <div class="expense-week-content" data-week="${weekGroup.week}">
                  ${weekGroup.expenses.map(expense => {
          const displayTags = expense.tags?.slice(0, 2) || [];
          const remainingTags = (expense.tags?.length || 0) - displayTags.length;

          return `
                      <div class="expense-item-compact" data-id="${expense._id}">
                        <div class="expense-compact-main">
                          <div class="expense-compact-left">
                            <div class="expense-compact-category">
                              <span class="category-dot category-${expense.category}"></span>
                              ${expense.category}
                            </div>
                            ${expense.description ? `<div class="expense-compact-desc">${expense.description}</div>` : ''}
                            ${displayTags.length > 0 ? `
                              <div class="expense-tags-compact">
                                ${displayTags.map(tag => `<span class="tag-mini">${tag}</span>`).join('')}
                                ${remainingTags > 0 ? `<span class="tag-mini">+${remainingTags}</span>` : ''}
                              </div>
                            ` : ''}
                          </div>
                          <div class="expense-compact-right">
                            <div class="expense-compact-amount">${utils.formatCurrency(expense.amount)}</div>
                            <div class="expense-compact-date">${utils.formatDate(expense.date)}</div>
                          </div>
                        </div>
                        <div class="expense-compact-actions">
                          <button class="action-btn-mini edit-expense-btn" data-id="${expense._id}" title="Edit">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button class="action-btn-mini delete-expense-btn" data-id="${expense._id}" title="Delete">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    `;
        }).join('')}
                </div>
              </div>
            `;
      }).join('')}
        </div>
      </div>
    `;
    });

    container.innerHTML = html;

    // Add toggle functionality for months
    container.querySelectorAll('.expense-group-header').forEach(header => {
      header.addEventListener('click', () => {
        const month = header.dataset.month;
        const content = container.querySelector(`.expense-group-content[data-month="${month}"]`);
        const icon = header.querySelector('.expand-icon');

        content.classList.toggle('collapsed');
        icon.style.transform = content.classList.contains('collapsed') ? 'rotate(-90deg)' : 'rotate(0deg)';
      });
    });

    // Add toggle functionality for weeks
    container.querySelectorAll('.expense-week-header').forEach(header => {
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        const week = header.dataset.week;
        const content = container.querySelector(`.expense-week-content[data-week="${week}"]`);
        const icon = header.querySelector('.expand-icon-small');

        content.classList.toggle('collapsed');
        icon.style.transform = content.classList.contains('collapsed') ? 'rotate(-90deg)' : 'rotate(0deg)';
      });
    });

    // Add edit handlers
    container.querySelectorAll('.edit-expense-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const expense = expenses.find(e => e._id === id);
        UI.showExpenseModal(expense);
      });
    });

    // Add delete handlers
    container.querySelectorAll('.delete-expense-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const expense = expenses.find(e => e._id === id);
        if (confirm(`Delete expense "${expense.description || expense.category}"?`)) {
          try {
            await API.expenses.delete(id);
            utils.showToast('Expense deleted', 'success');
            await App.loadExpenses();
          } catch (error) {
            utils.showToast('Failed to delete expense', 'error');
          }
        }
      });
    });
  },

  groupExpensesByPeriod: (expenses) => {
    const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    const monthGroups = new Map();

    sorted.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthGroups.has(monthKey)) {
        monthGroups.set(monthKey, {
          month: monthKey,
          label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          expenses: [],
          weeks: new Map()
        });
      }

      const monthGroup = monthGroups.get(monthKey);
      monthGroup.expenses.push(expense);

      // Get week number
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!monthGroup.weeks.has(weekKey)) {
        monthGroup.weeks.set(weekKey, {
          week: weekKey,
          label: `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          expenses: []
        });
      }

      monthGroup.weeks.get(weekKey).expenses.push(expense);
    });

    return Array.from(monthGroups.values()).map(month => ({
      ...month,
      weeks: Array.from(month.weeks.values())
    }));
  },

  // Update the expense stats to include a simple chart
  updateExpenseStats: (expenses) => {
    const today = new Date();
    const todayExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.toDateString() === today.toDateString();
    });

    const monthExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === today.getMonth() &&
        expenseDate.getFullYear() === today.getFullYear();
    });

    const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    document.getElementById('todayExpense').textContent = utils.formatCurrency(todayTotal);
    document.getElementById('monthlyExpense').textContent = utils.formatCurrency(monthTotal);

    // Category breakdown
    const categoryTotals = {};
    monthExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const chartContainer = document.getElementById('expenseChart');
    if (chartContainer && Object.keys(categoryTotals).length > 0) {
      const maxAmount = Math.max(...Object.values(categoryTotals));
      const sortedCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      chartContainer.innerHTML = sortedCategories.map(([category, amount]) => `
      <div class="chart-bar">
        <div class="chart-bar-label">
          <span class="category-dot category-${category}"></span>
          <span>${category}</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill category-${category}" style="width: ${(amount / maxAmount) * 100}%"></div>
        </div>
        <div class="chart-bar-value">${utils.formatCurrency(amount)}</div>
      </div>
    `).join('');
    }
  },

  showExpenseModal: (expense = null) => {
    const isEdit = !!expense;
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = isEdit ? 'Edit Expense' : 'New Expense';

    const tagsHtml = expense?.tags?.map(tag => `<span class="tag-input-item">${tag}<button type="button" class="tag-remove" data-tag="${tag}">×</button></span>`).join('') || '';

    modalBody.innerHTML = `
    <form id="expenseForm" class="compact-form">
      <div class="form-row form-row-2">
        <div class="form-group">
          <label>Amount *</label>
          <input type="number" step="0.01" id="expenseAmount" value="${expense?.amount || ''}" placeholder="0.00" required>
        </div>
        <div class="form-group">
          <label>Category *</label>
          <select id="expenseCategory" required>
            <option value="food" ${expense?.category === 'food' ? 'selected' : ''}>Food</option>
            <option value="transport" ${expense?.category === 'transport' ? 'selected' : ''}>Transport</option>
            <option value="utilities" ${expense?.category === 'utilities' ? 'selected' : ''}>Utilities</option>
            <option value="entertainment" ${expense?.category === 'entertainment' ? 'selected' : ''}>Entertainment</option>
            <option value="healthcare" ${expense?.category === 'healthcare' ? 'selected' : ''}>Healthcare</option>
            <option value="education" ${expense?.category === 'education' ? 'selected' : ''}>Education</option>
            <option value="shopping" ${expense?.category === 'shopping' ? 'selected' : ''}>Shopping</option>
            <option value="rent" ${expense?.category === 'rent' ? 'selected' : ''}>Rent</option>
            <option value="other" ${expense?.category === 'other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Description</label>
          <textarea id="expenseDescription" rows="2" placeholder="What was this for?">${expense?.description || ''}</textarea>
        </div>
      </div>

      <div class="form-row form-row-2">
        <div class="form-group">
          <label>Date *</label>
          <input type="date" id="expenseDate" value="${expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}" required>
        </div>
        <div class="form-group">
          <label>Payment Method</label>
          <select id="expensePaymentMethod">
            <option value="cash" ${expense?.paymentMethod === 'cash' ? 'selected' : ''}>Cash</option>
            <option value="card" ${expense?.paymentMethod === 'card' ? 'selected' : ''}>Card</option>
            <option value="upi" ${expense?.paymentMethod === 'upi' ? 'selected' : ''}>UPI</option>
            <option value="netbanking" ${expense?.paymentMethod === 'netbanking' ? 'selected' : ''}>Net Banking</option>
            <option value="other" ${expense?.paymentMethod === 'other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Tags</label>
          <div class="tag-input-container">
            <div class="tag-input-list" id="expenseTagsList">${tagsHtml}</div>
            <input type="text" id="expenseTagInput" placeholder="Add tag..." class="tag-text-input">
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" id="cancelBtn">Cancel</button>
        <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Create'}</button>
      </div>
    </form>
  `;

    UI.showModal();

    // Handle tags
    const tagInput = document.getElementById('expenseTagInput');
    const tagsList = document.getElementById('expenseTagsList');
    let currentTags = expense?.tags ? [...expense.tags] : [];

    const renderTags = () => {
      tagsList.innerHTML = currentTags.map(tag =>
        `<span class="tag-input-item">${tag}<button type="button" class="tag-remove" data-tag="${tag}">×</button></span>`
      ).join('');

      tagsList.querySelectorAll('.tag-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const tag = btn.dataset.tag;
          currentTags = currentTags.filter(t => t !== tag);
          renderTags();
        });
      });
    };

    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const value = tagInput.value.trim().replace(/,$/g, '');
        if (value && !currentTags.includes(value)) {
          currentTags.push(value);
          renderTags();
          tagInput.value = '';
        }
      }
    });

    renderTags();

    document.getElementById('expenseForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        amount: parseFloat(document.getElementById('expenseAmount').value),
        category: document.getElementById('expenseCategory').value,
        description: document.getElementById('expenseDescription').value,
        date: document.getElementById('expenseDate').value,
        paymentMethod: document.getElementById('expensePaymentMethod').value,
        tags: currentTags.length > 0 ? currentTags : undefined
      };

      try {
        if (isEdit) {
          await API.expenses.update(expense._id, data);
          utils.showToast('Expense updated', 'success');
        } else {
          await API.expenses.create(data);
          utils.showToast('Expense added', 'success');
        }
        UI.hideModal();
        await App.loadExpenses();
      } catch (error) {
        utils.showToast(error.message || 'Operation failed', 'error');
      }
    });

    document.getElementById('cancelBtn').addEventListener('click', UI.hideModal);
  },





  // Render courses list
  renderCourses: (courses) => {
    const container = document.getElementById('coursesList');

    if (courses.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          <p>No courses yet</p>
        </div>
      `;
      return;
    }

    container.innerHTML = courses.map(course => `
      <div class="course-item" data-id="${course._id}">
        <div class="course-header">
          <div class="course-title">${course.title}</div>
          <span class="course-status ${course.status}">${course.status.replace('-', ' ')}</span>
        </div>
        ${course.instructor ? `<div class="course-instructor">by ${course.instructor}</div>` : ''}
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${course.progress || 0}%"></div>
        </div>
        <div class="progress-text">${course.progress || 0}% Complete</div>
      </div>
    `).join('');

    container.querySelectorAll('.course-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const course = courses.find(c => c._id === id);
        UI.showCourseModal(course);
      });
    });
  },

  // Show course modal
  showCourseModal: (course = null) => {
    const isEdit = !!course;
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = isEdit ? 'Edit Course' : 'New Course';

    modalBody.innerHTML = `
      <form id="courseForm">
        <div class="form-group">
          <label>Title *</label>
          <input type="text" id="courseTitle" value="${course?.title || ''}" required>
        </div>
        <div class="form-group">
          <label>Instructor</label>
          <input type="text" id="courseInstructor" value="${course?.instructor || ''}">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="courseDescription">${course?.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Start Date</label>
          <input type="date" id="courseStartDate" value="${course?.startDate ? new Date(course.startDate).toISOString().split('T')[0] : ''}">
        </div>
        <div class="form-group">
          <label>End Date</label>
          <input type="date" id="courseEndDate" value="${course?.endDate ? new Date(course.endDate).toISOString().split('T')[0] : ''}">
        </div>
        <div class="form-actions">
          ${isEdit ? '<button type="button" class="btn-secondary" id="deleteCourseBtn">Delete</button>' : ''}
          <button type="button" class="btn-secondary" id="cancelBtn">Cancel</button>
          <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Create'}</button>
        </div>
      </form>
    `;

    UI.showModal();

    document.getElementById('courseForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        title: document.getElementById('courseTitle').value,
        instructor: document.getElementById('courseInstructor').value,
        description: document.getElementById('courseDescription').value,
        startDate: document.getElementById('courseStartDate').value || undefined,
        endDate: document.getElementById('courseEndDate').value || undefined
      };

      try {
        if (isEdit) {
          await API.courses.update(course._id, data);
          utils.showToast('Course updated successfully', 'success');
        } else {
          await API.courses.create(data);
          utils.showToast('Course created successfully', 'success');
        }
        UI.hideModal();
        await App.loadCourses();
      } catch (error) {
        utils.showToast(error.message || 'Operation failed', 'error');
      }
    });

    if (isEdit) {
      document.getElementById('deleteCourseBtn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this course?')) {
          try {
            await API.courses.delete(course._id);
            utils.showToast('Course deleted successfully', 'success');
            UI.hideModal();
            await App.loadCourses();
          } catch (error) {
            utils.showToast('Failed to delete course', 'error');
          }
        }
      });
    }

    document.getElementById('cancelBtn').addEventListener('click', UI.hideModal);
  },




  // Show/hide modal
  showModal: () => {
    document.getElementById('modalOverlay').classList.remove('hidden');
  },

  hideModal: () => {
    document.getElementById('modalOverlay').classList.add('hidden');
  }
};