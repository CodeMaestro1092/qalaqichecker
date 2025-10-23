# 🔧 Render Build Error Fix

## ❌ Error You're Seeing

```
error TS7016: Could not find a declaration file for module 'express'
error TS2584: Cannot find name 'console'
error TS2580: Cannot find name 'process'
```

This means TypeScript can't find Node.js type definitions.

---

## ✅ Solution

The issue is **already fixed** in your local code! The error on Render is likely due to configuration.

### What I Fixed:

**File: `backend/tsconfig.json`**

Added this line:
```json
"types": ["node"]
```

This tells TypeScript to include Node.js types (console, process, etc.)

---

## 🚀 How to Deploy to Render

### Step 1: Commit the Fix

```bash
cd /home/loko/Documents/qalaqichecker

# Add all changes
git add .

# Commit
git commit -m "Fix TypeScript config for Render deployment"

# Push to GitHub
git push origin main
```

### Step 2: Configure Render Correctly

When creating the Web Service on Render:

**CRITICAL SETTINGS:**

```
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

**NOT:**
```
Root Directory: src/backend  ← WRONG!
```

The error shows `/opt/render/project/src/backend` which means Render is looking in the wrong place.

---

## 🧪 Verify Local Build Works

Before deploying, test locally:

```bash
cd backend

# Clean build
rm -rf dist/ node_modules/
npm install
npm run build

# Should see:
# ✓ Compiled successfully
# No errors!
```

**Expected output:**
```
> backend@1.0.0 build
> tsc

(no output = success!)
```

---

## 📋 Render Configuration Checklist

When setting up on Render:

- [ ] Root Directory: `backend` (not `src/backend`)
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Runtime: Node
- [ ] Branch: `main` (or your default branch)
- [ ] Environment variables added (DATABASE_URL, etc.)

---

## 🔍 If Build Still Fails on Render

### Check 1: Verify package.json devDependencies

In `backend/package.json`, should have:
```json
"devDependencies": {
  "@types/express": "^4.17.21",
  "@types/cors": "^2.8.17",
  "@types/node": "^20.10.5",
  "@types/node-cron": "^3.0.11",
  "@types/pg": "^8.10.9",
  "typescript": "^5.3.3",
  "tsx": "^4.7.0"
}
```

✅ **Already correct in your code!**

### Check 2: Verify tsconfig.json

In `backend/tsconfig.json`, should have:
```json
{
  "compilerOptions": {
    "types": ["node"],
    ...
  }
}
```

✅ **Already fixed!**

### Check 3: Check Render Logs

In Render dashboard, click on your service → "Logs"

Look for:
```
Installing dependencies...
npm install
...
Building...
npm run build
```

If you see it installing from wrong directory, the Root Directory setting is wrong.

---

## 🎯 Quick Fix Steps

**Option 1: Delete and Recreate Service**
1. Delete the web service on Render
2. Create new one with correct Root Directory: `backend`
3. Deploy

**Option 2: Update Existing Service**
1. Go to Render dashboard
2. Click your service
3. Settings → Build & Deploy
4. Update Root Directory to: `backend`
5. Trigger manual deploy

---

## ✅ Success Indicators

When deployed correctly, you'll see:

```
==> Downloading cache...
==> Installing dependencies...
added 559 packages in 3s
==> Building...
> backend@1.0.0 build
> tsc

Build successful 🎉
==> Uploading build...
==> Build succeeded 😀
```

---

## 📝 Complete Working Configuration

**Render Web Service Settings:**

```yaml
Name: qalaqichecker-backend
Environment: Node
Region: Frankfurt
Branch: main
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start

Environment Variables:
  NODE_ENV=production
  PORT=3001
  DATABASE_URL=<your-postgres-url>
  RESEND_API_KEY=<optional>
  TELEGRAM_BOT_TOKEN=<optional>
  CHECK_INTERVAL_MINUTES=15
  API_DELAY_MS=5000
```

---

## 🐛 Still Having Issues?

### Test Build Locally First

```bash
cd backend

# Simulate Render's build process
rm -rf node_modules/ dist/
npm install
npm run build
npm start

# Should start without errors
```

If this works locally but fails on Render:
- Root Directory is wrong
- Or missing environment variables
- Or using wrong branch

---

## 💡 Pro Tip

After fixing, you can verify the build worked by checking:

1. **Render Logs** show "Build succeeded"
2. **Service URL** returns `{"status":"OK"}` at `/health`
3. No TypeScript errors in logs

---

**Your code is correct! Just make sure Render is configured properly.** ✅
