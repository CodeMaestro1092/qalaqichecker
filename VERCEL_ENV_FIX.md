# 🔧 Vercel Environment Variable Fix

## ❌ Error You're Seeing

```
Request URL: https://qalaqichecker-frontend.vercel.app/3001/api/exam/categories
Status: 404 Not Found
```

**Problem:** Frontend is trying to call API on its own domain instead of the backend.

---

## 🎯 Root Cause

The environment variable `NEXT_PUBLIC_API_URL` is **not set in Vercel**, so the frontend is using a relative URL instead of the full backend URL.

**Current behavior:**
```javascript
// In frontend/utils/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
// process.env.NEXT_PUBLIC_API_URL is undefined in Vercel
// Falls back to 'http://localhost:3001'
// But in browser, this becomes relative: '/3001/api/...'
```

---

## ✅ Solution: Set Environment Variable in Vercel

### Option 1: Via Vercel Dashboard (Easiest)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your `qalaqichecker-frontend` project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   ```
   Key: NEXT_PUBLIC_API_URL
   Value: https://qalaqichecker-backend.onrender.com
   ```
5. Select **All environments** (Production, Preview, Development)
6. Click **Save**
7. **Redeploy:** Go to **Deployments** → Latest deployment → "⋮" menu → **Redeploy**

---

### Option 2: Via Vercel CLI

```bash
cd /home/loko/Documents/qalaqichecker/frontend

# Add environment variable
vercel env add NEXT_PUBLIC_API_URL

# When prompted:
# ? What's the value of NEXT_PUBLIC_API_URL?
# > https://qalaqichecker-backend.onrender.com
#
# ? Add NEXT_PUBLIC_API_URL to which Environments?
# > Production, Preview, Development (select all)

# Redeploy
vercel --prod
```

---

## 🔍 What's Your Backend URL?

If you haven't deployed the backend yet, you need to:

### Step 1: Deploy Backend First

Follow **[FREE_TIER_DEPLOYMENT.md](FREE_TIER_DEPLOYMENT.md)** or **[RENDER_FIX_FINAL.md](RENDER_FIX_FINAL.md)**

Your backend URL will be:
```
https://qalaqichecker-backend.onrender.com
```
(or whatever name you chose)

### Step 2: Then Update Frontend

Once backend is live, add its URL to Vercel environment variables.

---

## 🧪 Verify It Works

After setting the environment variable and redeploying:

### Test 1: Check Environment Variable

Visit your Vercel deployment logs. You should see:
```
Environment Variables:
  NEXT_PUBLIC_API_URL=https://qalaqichecker-backend.onrender.com
```

### Test 2: Test API Call

Open browser console on your frontend:
```javascript
// Should log the correct backend URL
console.log(process.env.NEXT_PUBLIC_API_URL);
// Expected: https://qalaqichecker-backend.onrender.com
```

### Test 3: Try the Form

1. Visit your frontend
2. Enter personal number
3. Click next
4. Should fetch categories from backend ✅

---

## 📋 Deployment Order

**IMPORTANT:** Deploy in this order:

1. ✅ **Backend first** (Render)
   - Get the backend URL
   - Example: `https://qalaqichecker-backend.onrender.com`

2. ✅ **Frontend with env var** (Vercel)
   - Set `NEXT_PUBLIC_API_URL` to backend URL
   - Deploy/redeploy

**Why this order?**
Frontend needs to know where the backend is!

---

## 🎯 Complete Setup

### Backend (Render)

**URL:** `https://qalaqichecker-backend.onrender.com`

**Environment Variables:**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgres://...
RESEND_API_KEY=re_...
CHECK_INTERVAL_MINUTES=15
API_DELAY_MS=5000
```

### Frontend (Vercel)

**URL:** `https://qalaqichecker-frontend.vercel.app`

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://qalaqichecker-backend.onrender.com
```

### CORS Check

Make sure backend allows frontend domain:

In `backend/src/server.ts`:
```typescript
app.use(cors());  // ✅ Allows all origins (fine for now)

// Or restrict to your frontend:
app.use(cors({
  origin: [
    'https://qalaqichecker-frontend.vercel.app',
    'http://localhost:3000'
  ]
}));
```

---

## 🔍 Troubleshooting

### Issue: Still getting 404

**Check:**
1. Environment variable is actually set in Vercel
2. You redeployed after setting it
3. Backend URL is correct and accessible

**Test backend directly:**
```bash
curl https://qalaqichecker-backend.onrender.com/health

# Should return:
{"status":"OK","timestamp":"..."}
```

### Issue: CORS error

**Error in browser console:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Fix:** Backend needs to allow frontend domain. Already configured with `cors()` middleware.

### Issue: Backend not deployed yet

**Solution:** Deploy backend first using:
- [RENDER_FIX_FINAL.md](RENDER_FIX_FINAL.md) - For Render deployment
- [FREE_TIER_DEPLOYMENT.md](FREE_TIER_DEPLOYMENT.md) - Complete guide

---

## 📝 Quick Fix Checklist

- [ ] Backend is deployed and running
- [ ] Backend health check works: `/health` returns OK
- [ ] Backend URL noted (e.g., `https://qalaqichecker-backend.onrender.com`)
- [ ] Environment variable added in Vercel dashboard
- [ ] Key: `NEXT_PUBLIC_API_URL`
- [ ] Value: Full backend URL (with https://)
- [ ] Applied to all environments
- [ ] Frontend redeployed
- [ ] Tested: Form can fetch categories

---

## 🎉 Success Indicators

When working correctly:

**Browser Network Tab:**
```
Request URL: https://qalaqichecker-backend.onrender.com/api/exam/categories
Status: 200 OK
Response: [{"code":4,"name":"B კატეგორია..."}]
```

**NOT:**
```
Request URL: https://qalaqichecker-frontend.vercel.app/3001/api/...
Status: 404 Not Found
```

---

## 💡 Pro Tip

Add this to your `frontend/.env.local.example`:
```env
# Local development
NEXT_PUBLIC_API_URL=http://localhost:3001

# Production (Vercel)
# Set in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://qalaqichecker-backend.onrender.com
```

---

## 🚀 Summary

**Problem:** Frontend doesn't know where backend is
**Solution:** Set `NEXT_PUBLIC_API_URL` in Vercel
**Status:** Easy 5-minute fix!

**Next steps:**
1. Set environment variable in Vercel
2. Redeploy frontend
3. Test the form
4. Should work! ✅

---

**After this fix, your frontend will correctly call the backend API!** 🎊
