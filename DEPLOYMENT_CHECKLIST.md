# 🚀 Quick Deployment Checklist

## Pre-Deployment ✅

- [x] All code committed to GitHub
- [x] `render.yaml` configured
- [x] `vercel.json` configured
- [x] Production environment variables set
- [x] PostgreSQL support added to backend
- [x] CORS configured for production

---

## Backend Deployment (Render)

### 1. Create Web Service
- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub: `Althia2004/Loan-Management`
- [ ] Select repository

### 2. Configure Settings
```
Name: moneyglitch-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
Instance Type: Free
```

### 3. Environment Variables
```env
FLASK_ENV=production
JWT_SECRET_KEY=[Generate Random]
SECRET_KEY=[Generate Random]
FRONTEND_URL=https://moneyglitch.vercel.app
```

### 4. Add Database (Recommended)
- [ ] New + → PostgreSQL
- [ ] Name: `moneyglitch-db`
- [ ] Plan: Free
- [ ] Link to web service

### 5. Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete
- [ ] Copy backend URL: `https://moneyglitch-backend.onrender.com`

### 6. Initialize Database
In Render Shell:
```bash
cd backend
flask db upgrade
python create_admin.py
```

### 7. Test Backend
- [ ] Visit: `https://your-backend.onrender.com/api/health`
- [ ] Should return: `{"status": "healthy"}`

---

## Frontend Deployment (Vercel)

### 1. Update Production Config
- [ ] Edit `frontend/.env.production`
- [ ] Set: `REACT_APP_API_URL=https://moneyglitch-backend.onrender.com`
- [ ] Commit and push changes

### 2. Deploy to Vercel
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New" → "Project"
- [ ] Import: `Loan-Management` repository

### 3. Configure Project
```
Project Name: moneyglitch
Framework: Create React App
Root Directory: frontend
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

### 4. Environment Variables
```env
REACT_APP_API_URL=https://moneyglitch-backend.onrender.com
```

### 5. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Copy frontend URL: `https://moneyglitch.vercel.app`

### 6. Update Backend CORS
- [ ] Go back to Render
- [ ] Update `FRONTEND_URL` environment variable
- [ ] Set to your Vercel URL

---

## Post-Deployment Testing

### Test User Flow
- [ ] Visit: `https://moneyglitch.vercel.app`
- [ ] Register new user
- [ ] Login
- [ ] Apply for loan
- [ ] View dashboard
- [ ] Check transactions
- [ ] Make savings deposit

### Test Admin Flow
- [ ] Visit: `https://moneyglitch.vercel.app/admin`
- [ ] Login as admin
- [ ] View dashboard
- [ ] Check users list
- [ ] Review loan applications
- [ ] View reports (charts should display)
- [ ] Check settings

### API Endpoints
- [ ] Health check: `/api/health`
- [ ] User login: `/api/auth/login`
- [ ] Admin login: `/api/admin/login`
- [ ] Dashboard: `/api/users/dashboard`
- [ ] Loans: `/api/loans/`
- [ ] Reports: `/api/admin/reports/stats`

---

## Optional: Custom Domain

### Buy Domain
- [ ] Purchase from Namecheap/GoDaddy
- [ ] Example: `moneyglitch.com`

### Vercel Domain Setup
- [ ] Vercel → Settings → Domains
- [ ] Add domain
- [ ] Update DNS records:
  ```
  A     @     76.76.19.19
  CNAME www   cname.vercel-dns.com
  ```

### Render Domain Setup
- [ ] Render → Settings → Custom Domains
- [ ] Add: `api.moneyglitch.com`
- [ ] Update DNS:
  ```
  CNAME api   your-service.onrender.com
  ```

### Update Environment Variables
```env
# Frontend (Vercel)
REACT_APP_API_URL=https://api.moneyglitch.com

# Backend (Render)
FRONTEND_URL=https://moneyglitch.com
```

---

## Monitoring

### Render
- [ ] Check logs: Dashboard → Service → Logs
- [ ] Monitor: Dashboard → Service → Metrics

### Vercel
- [ ] Deployment logs: Project → Deployments
- [ ] Analytics: Project → Analytics

---

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure database is connected

**CORS errors:**
- Verify `FRONTEND_URL` matches your Vercel URL exactly
- Include protocol (https://)
- No trailing slash

**API calls failing:**
- Check `REACT_APP_API_URL` in Vercel
- Verify backend is running (check health endpoint)
- Check network tab in browser DevTools

**Database errors:**
- Ensure PostgreSQL is created and linked
- Run migrations in Render Shell
- Check DATABASE_URL environment variable

---

## Success Criteria ✅

- [ ] Frontend loads without errors
- [ ] User can register and login
- [ ] Admin can login at `/admin`
- [ ] Dashboard displays correct data
- [ ] Loan applications work
- [ ] Payments process successfully
- [ ] Charts display in reports
- [ ] All API calls succeed
- [ ] No CORS errors in console
- [ ] Both free tier deployments active

---

## Your Deployed URLs

**Frontend:** `https://moneyglitch.vercel.app`
**Backend:** `https://moneyglitch-backend.onrender.com`
**Admin:** `https://moneyglitch.vercel.app/admin`

**With Custom Domain:**
**Frontend:** `https://moneyglitch.com`
**Backend:** `https://api.moneyglitch.com`
**Admin:** `https://moneyglitch.com/admin`

---

## 🎉 Deployment Complete!

Your Money Glitch loan management system is now live and accessible worldwide!

**Next Steps:**
1. Share the URL with users
2. Monitor performance and logs
3. Set up database backups
4. Consider upgrading to paid tier for better performance

---

**Deployment Date:** _________________
**Frontend URL:** _________________
**Backend URL:** _________________
**Database:** _________________
**Status:** _________________

---

Need help? Check `DEPLOYMENT_GUIDE.md` for detailed instructions.
