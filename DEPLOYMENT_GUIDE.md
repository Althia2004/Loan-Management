# 🚀 Money Glitch Deployment Guide

## Deploying to Render (Backend) + Vercel (Frontend)

### Prerequisites
- GitHub account with your repository pushed
- Render account (https://render.com)
- Vercel account (https://vercel.com)

---

## 📦 Backend Deployment (Render)

### Step 1: Prepare Your Repository
Make sure all files are committed and pushed to GitHub:
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Deploy to Render

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect GitHub Repository**
   - Select "Loan-Management" repository
   - Click "Connect"

3. **Configure Build Settings**
   ```
   Name: moneyglitch-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   ```

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable":
   ```
   FLASK_ENV=production
   JWT_SECRET_KEY=<click "Generate" for random value>
   SECRET_KEY=<click "Generate" for random value>
   FRONTEND_URL=https://moneyglitch.vercel.app (will update after Vercel deployment)
   ```

5. **Select Free Plan**
   - Choose "Free" instance type
   - Click "Create Web Service"

6. **Wait for Deployment**
   - Render will build and deploy your backend
   - Copy the URL (e.g., `https://moneyglitch-backend.onrender.com`)

7. **Add Database (Optional but Recommended)**
   - In Render dashboard, click "New +" → "PostgreSQL"
   - Name: `moneyglitch-db`
   - Plan: Free
   - After creation, go to your web service → Environment
   - Add: `DATABASE_URL` → Link to your PostgreSQL database
   - Render will automatically populate this value

8. **Run Database Migrations**
   - In Render dashboard, go to your web service
   - Click "Shell" tab
   - Run:
   ```bash
   cd backend
   flask db upgrade
   python create_admin.py  # Create admin account
   ```

### Step 3: Test Backend
Visit: `https://your-backend-url.onrender.com/api/health`

You should see:
```json
{
  "status": "healthy",
  "message": "Loan Management API is running"
}
```

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Update Environment Variable

1. **Edit `.env.production`**
   Update with your actual Render backend URL:
   ```env
   REACT_APP_API_URL=https://moneyglitch-backend.onrender.com
   ```

2. **Commit and Push**
   ```bash
   git add frontend/.env.production
   git commit -m "Update production API URL"
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New" → "Project"

2. **Import Repository**
   - Click "Import Git Repository"
   - Select "Loan-Management"
   - Click "Import"

3. **Configure Project**
   ```
   Project Name: moneyglitch
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
   ```
   REACT_APP_API_URL=https://moneyglitch-backend.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - Your site will be available at: `https://moneyglitch.vercel.app`

### Step 3: Update Backend CORS

1. **Go back to Render Dashboard**
   - Open your backend web service
   - Go to "Environment" tab
   - Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://moneyglitch.vercel.app
   ```
   - Save changes (this will trigger a redeploy)

---

## 🌍 Add Custom Domain (Optional)

### For Vercel (Frontend):

1. **Buy a domain** (e.g., from Namecheap, GoDaddy)
2. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Click "Add" → Enter your domain (e.g., `moneyglitch.com`)
   - Follow DNS configuration instructions
3. **In your domain registrar:**
   - Add A record: `@ → 76.76.19.19`
   - Add CNAME: `www → cname.vercel-dns.com`
4. **Wait for DNS propagation** (5-48 hours)

### For Render (Backend):

1. **In Render Dashboard:**
   - Go to your web service → Settings → Custom Domains
   - Click "Add Custom Domain"
   - Enter: `api.moneyglitch.com`
2. **In your domain registrar:**
   - Add CNAME record: `api → your-service.onrender.com`
3. **Update environment variables:**
   - Frontend: `REACT_APP_API_URL=https://api.moneyglitch.com`
   - Backend: `FRONTEND_URL=https://moneyglitch.com`

---

## ✅ Post-Deployment Checklist

- [ ] Backend health check works: `https://your-backend.onrender.com/api/health`
- [ ] Frontend loads: `https://moneyglitch.vercel.app`
- [ ] User login works
- [ ] Admin login works (`/admin`)
- [ ] Loan application works
- [ ] Payment processing works
- [ ] Charts and reports display correctly
- [ ] All API endpoints are accessible

---

## 🐛 Troubleshooting

### Backend Issues:

**Build fails:**
- Check `requirements.txt` is valid
- Ensure Python version is 3.12

**Database errors:**
- Add PostgreSQL database in Render
- Run migrations: `flask db upgrade`

**CORS errors:**
- Check `FRONTEND_URL` environment variable
- Verify Vercel URL is correct

### Frontend Issues:

**API calls fail:**
- Verify `REACT_APP_API_URL` in Vercel environment variables
- Check backend CORS configuration
- Ensure backend is running

**Build fails:**
- Check all dependencies in `package.json`
- Verify Node.js version compatibility

**Environment variables not working:**
- They must start with `REACT_APP_`
- Rebuild after changing environment variables

---

## 📊 Monitoring

### Render:
- View logs: Dashboard → Your Service → Logs
- Check metrics: Dashboard → Your Service → Metrics

### Vercel:
- View deployment logs: Project → Deployments → Select deployment
- Check analytics: Project → Analytics

---

## 🔄 Continuous Deployment

Both Render and Vercel automatically deploy when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Render and Vercel will automatically:
# 1. Detect the push
# 2. Build your application
# 3. Deploy the new version
# 4. Make it live
```

---

## 💰 Costs

**Free Tier Limits:**
- **Render:** 750 hours/month, sleeps after 15 min inactivity
- **Vercel:** 100 GB bandwidth, 6000 build minutes/month

**Note:** Render free tier apps sleep after inactivity. First request may be slow (cold start).

**Upgrade Options:**
- Render Starter: $7/month (always on, better performance)
- Vercel Pro: $20/month (more bandwidth, better analytics)

---

## 🎉 Your URLs

After deployment:
- **Frontend:** https://moneyglitch.vercel.app
- **Backend:** https://moneyglitch-backend.onrender.com
- **Admin:** https://moneyglitch.vercel.app/admin

**With Custom Domain:**
- **Frontend:** https://moneyglitch.com
- **Backend:** https://api.moneyglitch.com
- **Admin:** https://moneyglitch.com/admin

---

## 📞 Support

If you encounter issues:
- **Render Support:** https://render.com/docs
- **Vercel Support:** https://vercel.com/docs
- **GitHub Issues:** Create an issue in your repository

---

Good luck with your deployment! 🚀
