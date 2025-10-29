# My-Ex Chrome Extension - Installation & Usage Guide

## 📁 File Structure

Your Chrome Extension should have the following structure:

```
my-ex-extension/
├── manifest.json
├── popup.html
├── config.js
├── api.js
├── ui.js
├── popup.js
├── background.js
├── css/
│   ├── styles.css
│   ├── auth.css
│   ├── courses.css
│   ├── expenses.css
│   ├── layout.css
│   ├── modals.css
│   ├── todos.css
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## 🎨 Creating Icons

You'll need to create three icon sizes for your extension:

1. **icon16.png** - 16x16 pixels (toolbar icon)
2. **icon48.png** - 48x48 pixels (extension management page)
3. **icon128.png** - 128x128 pixels (Chrome Web Store)

You can create these using any image editor, or use online tools like:
- [Favicon Generator](https://favicon.io/)
- [Canva](https://www.canva.com/)
- Use the logo gradient colors: #667eea to #764ba2

## 🚀 Installation Instructions

### Step 1: Prepare Your Files

1. Create a new folder called `my-ex-extension`
2. Copy all the provided files into this folder
3. Create an `icons` subfolder and add your icon images

### Step 2: Configure the API URL

1. Open `config.js`
2. Update the `API_BASE_URL` if your backend is running on a different port or domain:
   ```javascript
   API_BASE_URL: 'http://localhost:5000/api'
   ```

### Step 3: Load Extension in Chrome

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select your `my-ex-extension` folder
6. The extension icon should appear in your Chrome toolbar

### Step 4: Pin the Extension (Optional)

1. Click the puzzle piece icon in Chrome toolbar
2. Find "My-Ex - Personal Productivity Hub"
3. Click the pin icon to keep it visible

## 🔧 Configuration

### Backend Setup

Make sure your backend API is running:

```bash
# Navigate to your backend directory
cd my-ex-backend

# Start the server
npm start
```

The backend should be running on `http://localhost:5000`

### CORS Configuration

Ensure your backend has CORS enabled for Chrome extension requests. In your backend `server.js`:

```javascript
const cors = require('cors');
app.use(cors({
  origin: ['chrome-extension://*'],
  credentials: true
}));
```

## 📱 Using the Extension

### First Time Setup

1. Click the extension icon in your Chrome toolbar
2. You'll see the login/register screen
3. Register a new account or login with existing credentials

### Features

#### 🗂️ **Todos Tab**
- View all your tasks
- Filter by: All, Pending, Completed
- Click **+** button to add new task
- Click on any task to edit or delete
- Click checkbox to mark complete/incomplete

#### 💰 **Expenses Tab**
- Track your daily expenses
- View monthly and daily totals
- Click **+** button to add new expense
- Click on any expense to edit or delete
- Automatic date formatting

#### 📚 **Courses Tab**
- Manage your learning courses
- Track course progress
- View course status (Not Started, In Progress, Completed)
- Click **+** button to add new course
- Click on any course to edit or delete

### Theme Toggle

- Click the moon/sun icon in the header to switch between light and dark mode
- Your preference is saved automatically

### Logout

- Click the logout icon in the header to sign out
- Your session will be cleared

## 🔍 Troubleshooting

### Extension Not Loading

1. Check that all files are in the correct folder
2. Make sure `manifest.json` is at the root level
3. Refresh the extension from `chrome://extensions/`

### API Connection Issues

1. Verify backend is running: `http://localhost:5000`
2. Check browser console for errors (F12 → Console)
3. Ensure CORS is properly configured
4. Check that API_BASE_URL in `config.js` matches your backend

### Authentication Issues

1. Clear extension storage:
   - Go to `chrome://extensions/`
   - Click "Details" on your extension
   - Scroll down and click "Clear storage"
2. Try logging in again

### Styles Not Showing

1. Check that `styles.css` is in the same folder as `popup.html`
2. Hard refresh the extension (remove and re-add it)

## 🔐 Security Notes

- Never commit your API tokens or credentials
- Use environment variables for production deployments
- The extension stores auth tokens in Chrome's local storage
- Tokens are automatically cleared on logout

## 🚧 Coming Soon Features

These features are planned but not yet implemented:

- **Reminders System** - Set notifications for tasks
- **Timetable/Schedule** - Daily schedule management
- **Document Archives** - Store and manage documents
- **IPO Tracker** - Track current and upcoming IPOs
- **File Upload** - Import expenses from Excel/CSV
- **Offline Mode** - Work offline and sync later
- **Data Export** - Export your data to CSV/Excel

## 📝 Development Tips

### Debugging

1. Right-click extension icon → Inspect popup
2. Console logs will appear in the inspection window
3. Check Network tab for API requests

### Making Changes

After modifying any files:
1. Go to `chrome://extensions/`
2. Click the refresh icon on your extension
3. Close and reopen the popup

### Testing API Calls

Use the browser console in the popup inspection window:
```javascript
// Test API connection
API.auth.getMe().then(console.log);

// Test todos
API.todos.getAll().then(console.log);
```

## 🆘 Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Verify backend API is responding:
   - Open `http://localhost:5000/api/auth/me` in browser
3. Check network requests in DevTools
4. Review backend logs for errors

## 📦 Production Deployment

For publishing to Chrome Web Store:

1. Update `manifest.json` with production API URL
2. Create high-quality icons
3. Write detailed description
4. Create promotional images (1280x800px)
5. Submit for review at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

## 🔄 Updates

To update the extension:

1. Increment version in `manifest.json`
2. Make your changes
3. Test thoroughly
4. For local testing: Click refresh in `chrome://extensions/`
5. For published extension: Upload new version to Chrome Web Store

## 📄 License

This extension is part of the My-Ex Personal Productivity Hub project.

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Minimum Chrome Version:** 88+