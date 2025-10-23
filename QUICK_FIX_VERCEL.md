# ⚡ Quick Fix: Vercel 404 Error

## 🎯 Problem

Frontend calls: `https://qalaqichecker-frontend.vercel.app/3001/api/...`
Should call: `https://qalaqichecker-backend.onrender.com/api/...`

---

## ✅ 5-Minute Fix

### Step 1: Get Backend URL

**If backend is deployed:**
```
https://qalaqichecker-backend.onrender.com
```

**If backend is NOT deployed yet:**
1. First deploy backend (see [RENDER_FIX_FINAL.md](RENDER_FIX_FINAL.md))
2. Then come back here

---

### Step 2: Add to Vercel

**Via Dashboard (Easiest):**

1. Go to https://vercel.com/dashboard
2. Click your project (`qalaqichecker-frontend`)
3. **Settings** → **Environment Variables**
4. Click **Add New**
5. Fill in:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://qalaqichecker-backend.onrender.com
   ```
6. Select: **Production**, **Preview**, **Development** (all three)
7. Click **Save**

---

### Step 3: Redeploy

**Option A: Via Dashboard**
1. Go to **Deployments** tab
2. Find latest deployment
3. Click "⋮" menu → **Redeploy**
4. Wait 1-2 minutes

**Option B: Via CLI**
```bash
cd frontend
vercel --prod
```

---

### Step 4: Test

Visit: `https://qalaqichecker-frontend.vercel.app`

1. Enter personal number
2. Click next
3. Should load categories ✅

---

## 🔍 Check If It Worked

Open browser DevTools (F12) → Network tab:

**Before fix:**
```
❌ https://qalaqichecker-frontend.vercel.app/3001/api/exam/categories
   Status: 404
```

**After fix:**
```
✅ https://qalaqichecker-backend.onrender.com/api/exam/categories
   Status: 200
   Response: [{"code":4,"name":"B კატეგორია..."}]
```

---

## 🆘 Still Not Working?

### Check 1: Env Variable is Set

Vercel Dashboard → Your Project → Settings → Environment Variables

Should see:
```
NEXT_PUBLIC_API_URL = https://qalaqichecker-backend.onrender.com
```

### Check 2: Backend is Running

Visit:
```
https://qalaqichecker-backend.onrender.com/health
```

Should return:
```json
{"status":"OK","timestamp":"..."}
```

If 404 or timeout → Backend not deployed yet!

### Check 3: Redeployed

After adding env var, you MUST redeploy for it to take effect.

---

## 📚 More Help

- **[VERCEL_ENV_FIX.md](VERCEL_ENV_FIX.md)** - Detailed guide
- **[RENDER_FIX_FINAL.md](RENDER_FIX_FINAL.md)** - Deploy backend first
- **[FREE_TIER_DEPLOYMENT.md](FREE_TIER_DEPLOYMENT.md)** - Complete setup

---

**Fix time: 5 minutes | Difficulty: Easy** ✅
