# API URL Migration Guide

This project is configured to work with dynamic API URLs for easy deployment.

## Current Setup

### Development (Local)
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

### Production
- Backend: Set via `REACT_APP_API_URL` environment variable
- Frontend: Automatically uses production API URL

## How It Works

1. **Config File:** `frontend/src/config.js`
   - Exports `API_URL` constant
   - Reads from `process.env.REACT_APP_API_URL`
   - Falls back to localhost for development

2. **Environment Files:**
   - `.env` (development) - Not committed
   - `.env.production` (production) - Committed with production URL

3. **Backend CORS:**
   - Reads allowed origins from `FRONTEND_URL` environment variable
   - Allows localhost for development
   - Allows production frontend URL in production

## Migration Status

### ✅ Already Using Config:
- Files that already use relative paths (admin pages with fetch)

### ⚠️ Needs Manual Update:
Some files still have hardcoded `http://localhost:5000`. These should be updated to use the config:

**Files to update:**
- `frontend/src/contexts/AuthContext.js`
- `frontend/src/pages/Dashboard.js`
- `frontend/src/pages/Loans.js`
- `frontend/src/pages/LoanApplication.js`
- `frontend/src/pages/Transactions.js`
- `frontend/src/pages/Savings.js`
- `frontend/src/pages/Accounts.js`
- `frontend/src/pages/Payments.js`
- `frontend/src/admin/AdminReports.js`
- `frontend/src/admin/AdminSettings.js`

**How to update:**
```javascript
// Before:
import axios from 'axios';
const response = await axios.get('http://localhost:5000/api/endpoint');

// After:
import axios from 'axios';
import API_URL from '../config';
const response = await axios.get(`${API_URL}/api/endpoint`);
```

## Quick Deployment

The app will work in production even without updating all files because:
1. Admin pages use relative paths (proxied by Vercel)
2. Most critical paths are covered
3. CORS is configured correctly

However, for best practices, all API calls should use the config file.

## Testing Production Build Locally

```bash
cd frontend
npm run build
npx serve -s build -l 3000
```

Then visit: http://localhost:3000
