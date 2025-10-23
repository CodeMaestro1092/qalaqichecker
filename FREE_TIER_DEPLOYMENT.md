# 🆓 FREE Tier Deployment with Persistence

## 🎯 Goal: Deploy on Render FREE tier with data persistence

**Solution:** Use Render's FREE PostgreSQL database alongside FREE web service

**Total Cost:** $0/month 💰

---

## ✅ What's Been Added

I've upgraded your backend to support **both** JSON and PostgreSQL:

### New Files Created:
1. `backend/src/utils/databasePostgres.ts` - PostgreSQL implementation
2. `backend/src/utils/databaseHybrid.ts` - Auto-switches between JSON/PostgreSQL

### Modified Files:
1. `backend/package.json` - Added `pg` dependency
2. `backend/src/server.ts` - Now uses hybrid database

### How It Works:
```
If DATABASE_URL exists → Use PostgreSQL (persists on free tier!)
If no DATABASE_URL      → Use JSON file (local development)
```

---

## 🚀 Step-by-Step Deployment

### Step 1: Install New Dependencies

```bash
cd backend
npm install
```

This installs the PostgreSQL driver (`pg` package).

---

### Step 2: Create PostgreSQL Database on Render

1. Go to [render.com/dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**

3. Fill in details:
   ```
   Name: qalaqichecker-db
   Database: qalaqichecker
   User: (auto-generated)
   Region: Frankfurt (or closest)
   PostgreSQL Version: 15
   Plan Type: Free
   ```

4. Click **"Create Database"**

5. Wait 2-3 minutes for creation

6. **IMPORTANT:** Copy the **"Internal Database URL"**
   ```
   postgres://user:password@host/database
   ```
   Save this! You'll need it in Step 4.

---

### Step 3: Deploy Backend Web Service

1. Go to Render dashboard
2. Click **"New +"** → **"Web Service"**

3. Connect your GitHub repository

4. Configure:
   ```
   Name: qalaqichecker-backend
   Region: Frankfurt (same as database!)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan Type: Free
   ```

5. **DON'T click "Create" yet!**

---

### Step 4: Add Environment Variables

In the "Environment Variables" section, add:

```env
NODE_ENV=production
PORT=3001

# PostgreSQL Connection (from Step 2)
DATABASE_URL=postgres://user:password@host/database

# Email notifications (optional)
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev

# Telegram (optional)
TELEGRAM_BOT_TOKEN=

# Checking settings
CHECK_INTERVAL_MINUTES=15
API_DELAY_MS=5000
```

**IMPORTANT:** Use the **Internal Database URL** from Step 2!

---

### Step 5: Deploy!

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for build
3. Watch the logs

**Expected Log Output:**
```
✅ Database loaded
📊 Using PostgreSQL database
✅ PostgreSQL table initialized
🕐 Starting scheduler: checking every 15 minutes
🚀 Server running on port 3001
```

If you see "Using PostgreSQL database" → Success! ✅

---

### Step 6: Deploy Frontend to Vercel

```bash
cd frontend
vercel --prod

# Add environment variable:
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://qalaqichecker-backend.onrender.com
```

---

### Step 7: Test Persistence!

```bash
# Subscribe a user
curl -X POST https://your-backend-url/api/exam/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "personalNumber": "01234567890",
    "phoneNumber": "555123456",
    "categoryCode": 4,
    "categoryName": "B კატეგორია",
    "centerId": 6,
    "centerName": "თბილისი",
    "email": "test@example.com"
  }'

# Check subscribers
curl https://your-backend-url/api/exam/subscribers
# Should show 1 user

# Wait for server to sleep/restart (15+ minutes)

# Check again
curl https://your-backend-url/api/exam/subscribers
# Should STILL show 1 user ✅
```

---

## 🎉 Benefits of This Setup

### ✅ Data Persists
- Users survive server restarts
- Database separate from web service
- Professional solution

### ✅ Completely FREE
- Web Service: FREE (750 hours/month)
- PostgreSQL: FREE (1GB storage)
- Vercel Frontend: FREE
- **Total: $0/month**

### ✅ Scalable
- Can handle 10,000+ users on free tier
- Easy to upgrade when needed
- No code changes required

### ✅ Flexible
- Works locally with JSON (no PostgreSQL needed)
- Works on Render with PostgreSQL (free)
- Same codebase for both!

---

## 🔍 How to Verify It's Working

### Check 1: Logs Show PostgreSQL
```
In Render logs, look for:
📊 Using PostgreSQL database
✅ PostgreSQL table initialized
```

### Check 2: Database Has Table
In Render dashboard:
1. Go to your PostgreSQL database
2. Click "Connect" → "PSQL Command"
3. Run in terminal:
   ```bash
   psql postgres://your-connection-url
   ```
4. Check table:
   ```sql
   \dt
   -- Should show "users" table

   SELECT COUNT(*) FROM users;
   -- Shows number of subscribed users
   ```

### Check 3: Test Restart
1. Subscribe a test user
2. In Render, click "Manual Deploy" → "Clear build cache & deploy"
3. Wait for restart
4. Check subscribers again
5. User should still be there! ✅

---

## 📊 Free Tier Limits

### Render Web Service (FREE)
- 750 hours/month (25 days)
- Sleeps after 15 min inactivity
- 512 MB RAM
- ✅ Enough for this app!

### Render PostgreSQL (FREE)
- 1 GB storage
- 90-day expiration (auto-extends)
- **Can store ~10,000 users** ✅
- ✅ More than enough!

### When to Upgrade?
- Web Service Paid ($7/mo):
  - Always-on (no sleeping)
  - Better for 24/7 uptime

- PostgreSQL Paid ($7/mo):
  - 10 GB storage
  - Need >10,000 users
  - Need backups

**For most users: FREE tier is perfect!**

---

## 🆚 Comparison: Before vs After

### Before (JSON File)
```
❌ Data lost on restart
❌ Not suitable for production
❌ Users frustrated
```

### After (PostgreSQL)
```
✅ Data persists
✅ Production-ready
✅ Still FREE!
✅ Scalable to 10,000+ users
```

---

## 🐛 Troubleshooting

### "Cannot connect to database"
**Check:**
- DATABASE_URL is set correctly
- Using **Internal URL** (not External)
- Database and web service in **same region**

**Fix:**
```bash
# In Render dashboard, verify:
1. DATABASE_URL environment variable exists
2. Matches your PostgreSQL Internal URL
3. Web service restarts after adding variable
```

### "Table does not exist"
**Solution:** Table creates automatically on first start.

Check logs for:
```
✅ PostgreSQL table initialized
```

If missing, manually create:
```sql
-- Connect to database, then:
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  personal_number VARCHAR(11) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  category_code INTEGER NOT NULL,
  category_name VARCHAR(255) NOT NULL,
  center_id INTEGER NOT NULL,
  center_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telegram_chat_id VARCHAR(100),
  last_checked TIMESTAMP,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### "Still using JSON file database"
**Problem:** DATABASE_URL not detected

**Fix:**
1. Check environment variables in Render
2. Ensure DATABASE_URL is set
3. Restart web service

**Expected log:**
```
📊 Using PostgreSQL database  ← Should see this!
```

---

## 💡 Local Development

### Option 1: Use JSON (Recommended)
```bash
# Don't set DATABASE_URL in .env
npm run dev

# Logs will show:
📊 Using JSON file database
```

### Option 2: Use PostgreSQL Locally
```bash
# Install PostgreSQL locally
brew install postgresql  # Mac
sudo apt install postgresql  # Linux

# Create database
createdb qalaqichecker

# Add to .env
DATABASE_URL=postgres://localhost/qalaqichecker

# Start dev
npm run dev

# Logs will show:
📊 Using PostgreSQL database
```

**Recommended:** Use JSON for local dev, PostgreSQL for production.

---

## 🔄 Migration: Existing Users

If you already have users in JSON file:

### Export from JSON:
```bash
# On your local machine
cat backend/db.json
```

### Import to PostgreSQL:
```sql
-- Connect to Render PostgreSQL
INSERT INTO users VALUES
('id1', '01234567890', '555123456', 4, 'B კატეგორია', 6, 'თბილისი',
 'user@example.com', null, null, false, CURRENT_TIMESTAMP);
-- Repeat for each user
```

**Or use a migration script** (I can create this if needed).

---

## 📊 Database Admin

### View All Users:
```sql
SELECT personal_number, category_name, center_name, notified, created_at
FROM users
ORDER BY created_at DESC;
```

### Count Users:
```sql
SELECT COUNT(*) as total_users FROM users;
```

### Delete Old Users:
```sql
DELETE FROM users WHERE created_at < NOW() - INTERVAL '30 days';
```

### Reset Notifications:
```sql
UPDATE users SET notified = false;
```

---

## ✅ Final Checklist

Before going live:
- [ ] PostgreSQL database created on Render
- [ ] Web service created on Render
- [ ] DATABASE_URL environment variable set
- [ ] Both in same region
- [ ] Build successful
- [ ] Logs show "Using PostgreSQL database"
- [ ] Test user subscription works
- [ ] Test data persists after restart
- [ ] Frontend deployed to Vercel
- [ ] Frontend can reach backend
- [ ] End-to-end test complete

---

## 🎉 Success!

**You now have:**
- ✅ FREE deployment ($0/month)
- ✅ Data persistence (survives restarts)
- ✅ Production-ready (can handle 1000s of users)
- ✅ Professional database (PostgreSQL)
- ✅ Scalable solution

**No more data loss! 🎊**

---

## 📚 Resources

- [Render PostgreSQL Docs](https://render.com/docs/databases)
- [Render Free Tier Details](https://render.com/docs/free)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

---

**Ready to deploy? Follow the steps above!** 🚀
