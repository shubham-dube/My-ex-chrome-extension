// Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('My-Ex Extension installed');
  
  // Set default theme
  chrome.storage.local.get(['theme_preference'], (result) => {
    if (!result.theme_preference) {
      chrome.storage.local.set({ theme_preference: 'light' });
    }
  });

  // Setup alarms for reminders (future feature)
  chrome.alarms.create('checkReminders', {
    periodInMinutes: 5
  });
});

// Handle alarm for checking reminders
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkReminders') {
    checkAndShowReminders();
  }
});

// Check for reminders (placeholder for future implementation)
async function checkAndShowReminders() {
  try {
    // Get auth token
    const result = await chrome.storage.local.get(['auth_token']);
    const token = result.auth_token;
    
    if (!token) return;

    // Future: Fetch reminders from API
    // For now, this is a placeholder
    
    // Example notification (uncomment when API is ready):
    /*
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Reminder',
      message: 'You have a task due soon!',
      priority: 2
    });
    */
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  // Open the extension popup when notification is clicked
  chrome.action.openPopup();
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scheduleReminder') {
    // Handle reminder scheduling
    scheduleReminder(request.data);
    sendResponse({ success: true });
  }
  
  if (request.action === 'syncData') {
    // Handle data synchronization
    syncData();
    sendResponse({ success: true });
  }
  
  return true; // Keep channel open for async response
});

// Schedule a reminder
function scheduleReminder(reminderData) {
  // Future implementation: Create alarm for specific reminder
  const { id, time, message } = reminderData;
  
  chrome.alarms.create(`reminder_${id}`, {
    when: new Date(time).getTime()
  });
  
  // Store reminder data
  chrome.storage.local.get(['reminders'], (result) => {
    const reminders = result.reminders || {};
    reminders[id] = reminderData;
    chrome.storage.local.set({ reminders });
  });
}

// Sync data with server
async function syncData() {
  // Future implementation: Periodic sync with backend
  console.log('Syncing data with server...');
  
  try {
    const result = await chrome.storage.local.get(['auth_token', 'user_data']);
    if (result.auth_token) {
      // Perform sync operations
      // This could include:
      // - Fetching latest todos, expenses, etc.
      // - Uploading any pending changes
      // - Resolving conflicts
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}

// Handle extension icon click (optional custom behavior)
chrome.action.onClicked.addListener((tab) => {
  // The popup will open automatically
  // This listener can be used for additional actions if needed
});

// Periodic sync every 15 minutes
chrome.alarms.create('periodicSync', {
  periodInMinutes: 15
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'periodicSync') {
    syncData();
  }
});