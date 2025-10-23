# ✅ QalaqiChecker - Complete Checklist

Use this checklist to ensure everything is set up correctly!

---

## 📦 Initial Setup

### Prerequisites
- [ ] Node.js 18+ installed (`node -v`)
- [ ] npm installed (`npm -v`)
- [ ] Git installed (for deployment)
- [ ] Text editor (VS Code recommended)

### Installation
- [ ] Navigate to project directory
- [ ] Run `./scripts/setup.sh` OR `npm run install:all`
- [ ] Verify `node_modules/` exists in root, frontend, and backend
- [ ] Check `backend/.env` exists
- [ ] Check `frontend/.env.local` exists

---

## 🔧 Configuration

### Backend Environment Variables
- [ ] `PORT=3001` is set
- [ ] `NODE_ENV=development` is set
- [ ] `CHECK_INTERVAL_MINUTES=15` is set
- [ ] `API_DELAY_MS=5000` is set

### Optional: Email Notifications
- [ ] Sign up at [resend.com](https://resend.com)
- [ ] Create API key
- [ ] Add `RESEND_API_KEY` to `backend/.env`
- [ ] Set `FROM_EMAIL=onboarding@resend.dev`

### Optional: Telegram Notifications
- [ ] Create bot via [@BotFather](https://t.me/BotFather)
- [ ] Get bot token
- [ ] Add `TELEGRAM_BOT_TOKEN` to `backend/.env`
- [ ] Get your Chat ID from [@userinfobot](https://t.me/userinfobot)

### Frontend Environment
- [ ] `NEXT_PUBLIC_API_URL=http://localhost:3001` in `frontend/.env.local`

---

## 🚀 Local Testing

### Start Development Servers
- [ ] Run `npm run dev` from root directory
- [ ] Backend starts on port 3001
- [ ] Frontend starts on port 3000
- [ ] No errors in console

### Backend Health Check
- [ ] Open http://localhost:3001/health
- [ ] See `{"status":"OK","timestamp":"..."}`

### Frontend Access
- [ ] Open http://localhost:3000
- [ ] Page loads without errors
- [ ] See "QalaqiChecker" title
- [ ] Form is visible

### Test Complete Flow
- [ ] Enter personal number (11 digits)
- [ ] Enter phone number
- [ ] Click "შემდეგი"
- [ ] See list of categories
- [ ] Select a category
- [ ] See list of centers
- [ ] Select a center
- [ ] See exam availability result

### Test API Directly
- [ ] Run `./scripts/test-flow.sh`
- [ ] All 8 steps pass
- [ ] No errors displayed

---

## 📧 Test Notifications

### Email (if configured)
- [ ] Subscribe with your real email
- [ ] Check backend logs for "Email sent successfully"
- [ ] Trigger manual check: `curl -X POST http://localhost:3001/api/exam/manual-check`
- [ ] Check your email inbox (and spam folder)

### Telegram (if configured)
- [ ] Subscribe with your Chat ID
- [ ] Check backend logs for "Telegram message sent"
- [ ] Trigger manual check
- [ ] Check Telegram for bot message

---

## 🔄 Background Job

### Verify Scheduler
- [ ] Backend logs show "🕐 Starting scheduler: checking every 15 minutes"
- [ ] Wait 15 minutes
- [ ] See "🔍 Checking X user(s)..." in logs
- [ ] See "✅ Check complete" after

### Monitor Activity
- [ ] Subscribe a test user
- [ ] Check `backend/db.json` exists
- [ ] File contains user data
- [ ] `lastChecked` updates every 15 min

---

## 🌐 Deployment Preparation

### Code Repository
- [ ] Initialize git: `git init`
- [ ] Create `.gitignore` (already exists)
- [ ] Commit all code: `git add . && git commit -m "Initial commit"`
- [ ] Push to GitHub

### Environment Secrets
- [ ] NEVER commit `.env` files
- [ ] Verify `.env` is in `.gitignore`
- [ ] Save API keys somewhere safe (password manager)

---

## 🚢 Backend Deployment (Render.com)

### Render Setup
- [ ] Create account at [render.com](https://render.com)
- [ ] Verify email
- [ ] Connect GitHub account

### Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect repository
- [ ] Configure service:
  - [ ] Name: `qalaqichecker-backend`
  - [ ] Region: Select closest
  - [ ] Branch: `main`
  - [ ] Root Directory: `backend`
  - [ ] Runtime: Node
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Start Command: `npm start`

### Environment Variables
- [ ] Add `NODE_ENV=production`
- [ ] Add `PORT=3001`
- [ ] Add `RESEND_API_KEY=...` (if using email)
- [ ] Add `FROM_EMAIL=...`
- [ ] Add `TELEGRAM_BOT_TOKEN=...` (if using)
- [ ] Add `CHECK_INTERVAL_MINUTES=15`
- [ ] Add `API_DELAY_MS=5000`

### Deploy & Verify
- [ ] Click "Create Web Service"
- [ ] Wait for build (5-10 minutes)
- [ ] Check logs for errors
- [ ] Copy backend URL (e.g., `https://qalaqichecker-backend.onrender.com`)
- [ ] Test health: `curl https://your-backend-url/health`

---

## 🎨 Frontend Deployment (Vercel)

### Vercel Setup
- [ ] Install CLI: `npm i -g vercel`
- [ ] Login: `vercel login`

### Deploy
- [ ] Navigate to `frontend/` directory
- [ ] Run `vercel`
- [ ] Answer prompts:
  - [ ] Deploy? Yes
  - [ ] Link to existing? No
  - [ ] Project name: `qalaqichecker`
  - [ ] Directory: `./`
  - [ ] Override settings? No

### Environment Variable
- [ ] Run `vercel env add NEXT_PUBLIC_API_URL`
- [ ] Enter your Render backend URL
- [ ] Select all environments (Production, Preview, Development)

### Production Deploy
- [ ] Run `vercel --prod`
- [ ] Copy frontend URL (e.g., `https://qalaqichecker.vercel.app`)
- [ ] Visit URL to verify deployment

---

## ✅ Post-Deployment Verification

### Backend Checks
- [ ] Health endpoint works: `https://your-backend-url/health`
- [ ] Categories endpoint works
- [ ] CORS headers present
- [ ] Logs show cron job starting

### Frontend Checks
- [ ] Site loads without errors
- [ ] Can enter personal number
- [ ] Can fetch categories
- [ ] Can select center
- [ ] Can check exam
- [ ] Can subscribe

### Integration Tests
- [ ] Run `./scripts/deploy-check.sh`
- [ ] Enter your deployed URLs
- [ ] All checks pass

### Notification Tests
- [ ] Subscribe with real email/Telegram
- [ ] Trigger manual check via API
- [ ] Verify notification received

### Monitor Logs
- [ ] Render logs show cron job running
- [ ] No errors in logs
- [ ] API calls succeed

---

## 📊 Monitoring Setup (Optional)

### Uptime Monitoring
- [ ] Sign up at [uptimerobot.com](https://uptimerobot.com)
- [ ] Add monitor for backend health endpoint
- [ ] Set check interval to 5 minutes
- [ ] Configure email alerts

### Error Tracking
- [ ] Sign up at [sentry.io](https://sentry.io)
- [ ] Install Sentry SDK in backend
- [ ] Configure DSN
- [ ] Test error reporting

### Analytics
- [ ] Add Google Analytics to frontend
- [ ] Or use [plausible.io](https://plausible.io) (privacy-focused)
- [ ] Track page views and conversions

---

## 🎯 Go-Live Checklist

### Final Verification
- [ ] Frontend loads on public URL
- [ ] Backend health check passes
- [ ] Test complete user flow end-to-end
- [ ] Subscribe with test account
- [ ] Receive notification within 15 minutes
- [ ] Logs show no errors

### Performance
- [ ] Frontend loads in <3 seconds
- [ ] API responses in <1 second
- [ ] No console errors in browser

### Documentation
- [ ] Read [README.md](README.md)
- [ ] Bookmark [DEPLOYMENT.md](DEPLOYMENT.md)
- [ ] Save API keys securely
- [ ] Note deployment URLs

### Share
- [ ] Share frontend URL with friends
- [ ] Post on social media (optional)
- [ ] Collect feedback

---

## 🔄 Maintenance Checklist

### Weekly
- [ ] Check Render logs for errors
- [ ] Verify cron job runs
- [ ] Check email deliverability
- [ ] Review subscriber count

### Monthly
- [ ] Update npm dependencies
- [ ] Review Resend usage (stay under free tier)
- [ ] Check Render/Vercel usage
- [ ] Backup database (if on paid plan)

### When Issues Occur
- [ ] Check Render logs
- [ ] Check Vercel logs
- [ ] Test API endpoints manually
- [ ] Verify environment variables
- [ ] Check third-party service status (Resend, Telegram)

---

## 🆘 Troubleshooting Guide

### Frontend won't load
- [ ] Check Vercel deployment logs
- [ ] Verify build succeeded
- [ ] Check browser console for errors
- [ ] Verify `NEXT_PUBLIC_API_URL` is set

### Backend returns 500 errors
- [ ] Check Render logs for stack traces
- [ ] Verify environment variables are set
- [ ] Test Georgian API manually
- [ ] Check database file exists

### No notifications sent
- [ ] Verify Resend API key is valid
- [ ] Check Resend dashboard for failed emails
- [ ] Verify Telegram bot token
- [ ] Check backend logs for sending errors
- [ ] Ensure user has email or Telegram in subscription

### Cron job not running
- [ ] Check Render logs for scheduler start message
- [ ] Verify users exist in database
- [ ] Check for rate limiting errors
- [ ] Ensure Render service is not sleeping (free tier)

### "CORS error" in browser
- [ ] Verify backend CORS configuration
- [ ] Check `NEXT_PUBLIC_API_URL` matches deployed backend
- [ ] Ensure backend is accessible

---

## 📈 Upgrade Path

### When to Upgrade

**Render Free → Paid ($7/mo)**
- [ ] More than 10 active subscribers
- [ ] Need 24/7 uptime
- [ ] Need persistent database
- [ ] Cron job must never miss

**Resend Free → Paid ($20/mo)**
- [ ] Sending >3,000 emails/month
- [ ] Need custom domain email
- [ ] Need better deliverability

**Add PostgreSQL**
- [ ] More than 500 subscribers
- [ ] Need data integrity
- [ ] Want query capabilities

---

## 🎉 Success Criteria

You've successfully completed setup when:

✅ **All checkboxes above are checked**
✅ **Frontend accessible on public URL**
✅ **Backend responding to requests**
✅ **Can subscribe and receive notifications**
✅ **Cron job runs every 15 minutes**
✅ **No errors in logs**

---

**Congratulations! Your QalaqiChecker is live! 🚗🎉**

Share your success and help Georgian drivers get their licenses faster!
