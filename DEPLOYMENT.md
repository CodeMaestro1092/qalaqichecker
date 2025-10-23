# 🚀 Deployment Guide

Complete step-by-step deployment instructions for QalaqiChecker.

## 🎯 Quick Deploy Checklist

- [ ] Backend deployed to Render.com
- [ ] Environment variables configured
- [ ] Frontend deployed to Vercel
- [ ] Frontend points to backend URL
- [ ] Email notifications tested
- [ ] Telegram bot configured (optional)
- [ ] First user subscribed and tested

---

## 📦 Part 1: Deploy Backend to Render.com

### Step 1: Prepare Repository

1. **Initialize Git (if not already):**
```bash
cd qalaqichecker
git init
git add .
git commit -m "Initial commit"
```

2. **Push to GitHub:**
```bash
gh repo create qalaqichecker --public --source=. --remote=origin --push
# Or manually create repo on github.com and push
```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your `qalaqichecker` repository
3. Configure:

```
Name: qalaqichecker-backend
Region: Frankfurt (EU Central) or closest
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

### Step 4: Configure Environment Variables

In Render dashboard, add these environment variables:

```env
NODE_ENV=production
PORT=3001
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev
CHECK_INTERVAL_MINUTES=15
API_DELAY_MS=5000
```

**Optional (Telegram):**
```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for build
3. Your backend will be at: `https://qalaqichecker-backend.onrender.com`

### Step 6: Test Backend

```bash
# Replace with your actual Render URL
BACKEND_URL=https://qalaqichecker-backend.onrender.com

# Health check
curl $BACKEND_URL/health

# Should return: {"status":"OK","timestamp":"..."}
```

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy Frontend

```bash
cd frontend
vercel
```

Answer prompts:
```
? Set up and deploy "~/qalaqichecker/frontend"? [Y/n] Y
? Which scope do you want to deploy to? [Your Name]
? Link to existing project? [y/N] N
? What's your project's name? qalaqichecker
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

### Step 4: Add Environment Variable

```bash
vercel env add NEXT_PUBLIC_API_URL
```

When prompted:
```
? What's the value of NEXT_PUBLIC_API_URL?
> https://qalaqichecker-backend.onrender.com

? Add NEXT_PUBLIC_API_URL to which Environments?
> Production, Preview, Development (select all)
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

Your frontend will be at: `https://qalaqichecker.vercel.app`

### Step 6: Test Full Flow

1. Visit your Vercel URL
2. Enter test personal number
3. Select category and center
4. Check if backend responds correctly

---

## 📧 Part 3: Configure Email Notifications (Resend)

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up (free tier: 3,000 emails/month, 100/day)
3. Verify your email

### Step 2: Get API Key

1. Go to **"API Keys"** in dashboard
2. Click **"Create API Key"**
3. Name it: `qalaqichecker-prod`
4. Copy the key (starts with `re_`)

### Step 3: Add to Render

1. Go to your Render service
2. **Environment** tab
3. Add/update:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev
```
4. Service will auto-redeploy

### Step 4: Verify Domain (Optional but Recommended)

**Free tier only allows sending from `onboarding@resend.dev`**

To send from your own domain:
1. Add domain in Resend dashboard
2. Add DNS records to your domain
3. Update `FROM_EMAIL` to `notifications@yourdomain.com`

### Step 5: Test Email

```bash
# Subscribe with your real email
curl -X POST $BACKEND_URL/api/exam/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "personalNumber": "01234567890",
    "phoneNumber": "555123456",
    "categoryCode": 4,
    "categoryName": "B კატეგორია",
    "centerId": 6,
    "centerName": "ზუგდიდი",
    "email": "your@email.com"
  }'

# Trigger manual check
curl -X POST $BACKEND_URL/api/exam/manual-check
```

Check your email inbox!

---

## 💬 Part 4: Configure Telegram Notifications (Optional)

### Step 1: Create Telegram Bot

1. Open Telegram
2. Search for [@BotFather](https://t.me/BotFather)
3. Send `/newbot`
4. Choose name: `QalaqiChecker Bot`
5. Choose username: `qalaqichecker_bot` (or similar)
6. Copy the token: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

### Step 2: Get Your Chat ID

1. Search for [@userinfobot](https://t.me/userinfobot) on Telegram
2. Start chat
3. Copy your Chat ID (e.g., `123456789`)

### Step 3: Add to Render

1. Go to Render dashboard
2. Add environment variable:
```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

### Step 4: Test Telegram

When subscribing, users enter their Chat ID in the form.

Test with your Chat ID:
```bash
curl -X POST $BACKEND_URL/api/exam/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "personalNumber": "01234567890",
    "phoneNumber": "555123456",
    "categoryCode": 4,
    "categoryName": "B კატეგორია",
    "centerId": 6,
    "centerName": "ზუგდიდი",
    "telegramChatId": "123456789"
  }'
```

---

## 🔄 Part 5: Updates and Maintenance

### Update Backend

```bash
# Make changes
git add .
git commit -m "Update backend"
git push origin main

# Render auto-deploys on push
```

### Update Frontend

```bash
cd frontend

# Make changes
vercel --prod
```

### View Logs

**Render:**
1. Dashboard → Your Service → Logs

**Vercel:**
```bash
vercel logs [deployment-url]
```

### Monitor Cron Job

Check Render logs for:
```
🕐 Starting scheduler: checking every 15 minutes
🔍 Checking 3 user(s) for exam availability...
✅ Check complete
```

---

## 🐛 Troubleshooting Deployment

### Backend won't start

**Check logs for:**
```
Error: Cannot find module ...
```

**Fix:** Ensure `package.json` has all dependencies
```bash
cd backend
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Frontend shows API errors

**Check:**
1. `NEXT_PUBLIC_API_URL` is set correctly
2. Backend URL is reachable: `curl https://your-backend.onrender.com/health`
3. CORS is enabled in backend

**Fix CORS:**
```typescript
// backend/src/server.ts
app.use(cors({
  origin: ['https://qalaqichecker.vercel.app', 'http://localhost:3000']
}));
```

### Emails not sending

**Check:**
1. Resend API key is correct
2. Backend logs for errors
3. Resend dashboard for failed emails

**Test manually:**
```bash
curl -X POST $BACKEND_URL/api/exam/manual-check
```

### Database not persisting

**Render free tier:** Disk is ephemeral (resets on restart)

**Solutions:**
1. Upgrade to paid plan ($7/month) for persistent disk
2. Or use MongoDB Atlas (free tier)
3. Or use PostgreSQL on Render

---

## 💰 Cost Breakdown

### Free Tier (Recommended for Testing)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Render** | Free | 750 hours/month, sleeps after 15min idle |
| **Vercel** | Free | 100GB bandwidth, unlimited deploys |
| **Resend** | Free | 3,000 emails/month, 100/day |
| **Telegram** | Free | Unlimited messages |

**Total: $0/month**

### Paid Tier (Production)

| Service | Cost | Benefits |
|---------|------|----------|
| **Render** | $7/month | Always on, persistent disk, 400hrs |
| **Vercel** | $0 (Hobby) | Same as free |
| **Resend** | $0-20 | 50,000+ emails |

**Total: $7-27/month**

---

## ✅ Final Checklist

- [ ] Backend health check returns OK
- [ ] Frontend loads without errors
- [ ] Can fetch categories for a test ID
- [ ] Can check exam availability
- [ ] Can subscribe with email
- [ ] Receive test email notification
- [ ] (Optional) Receive Telegram message
- [ ] Cron job runs every 15 minutes
- [ ] Logs show successful checks

---

## 🎉 You're Done!

Your driving exam checker is now live and monitoring 24/7!

**Frontend:** https://qalaqichecker.vercel.app
**Backend:** https://qalaqichecker-backend.onrender.com

### Share with Friends

Users can now:
1. Visit your app
2. Enter their personal info
3. Subscribe for notifications
4. Get alerted when exams become available!

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Resend Docs:** https://resend.com/docs
- **Next.js Docs:** https://nextjs.org/docs

**Need help?** Open an issue on GitHub!
