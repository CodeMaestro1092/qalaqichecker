# 💾 Data Persistence Guide

## ❓ Will My Data Survive Server Restarts?

**Short Answer:** It depends on your deployment platform.

---

## 🔍 Current Implementation

### How Data is Stored

```typescript
// backend/src/utils/database.ts

class Database {
  private data: DatabaseData = { users: [] };

  async load() {
    // Reads from disk on startup
    const content = await fs.readFile('db.json', 'utf-8');
    this.data = JSON.parse(content);
  }

  async save() {
    // Writes to disk immediately
    await fs.writeFile('db.json', JSON.stringify(this.data));
  }

  async addUser(user: User) {
    this.data.users.push(user);
    await this.save();  // ← Persisted immediately!
  }
}
```

### File Location
```
backend/db.json
```

**This is a JSON file stored on the server's filesystem.**

---

## 🎯 Persistence by Platform

### 1️⃣ Local Development (Your Computer)

**Status:** ✅ **ALWAYS PERSISTS**

```bash
# Data survives:
- Server restarts ✓
- Computer restarts ✓
- Code changes ✓

# Location:
/home/loko/Documents/qalaqichecker/backend/db.json
```

**Why?** Your local filesystem is permanent.

---

### 2️⃣ Render.com FREE Tier

**Status:** ❌ **DOES NOT PERSIST**

```
Problem: Ephemeral filesystem

When server restarts:
- Disk is reset to original state
- db.json is deleted
- All users lost!

Triggers:
- Automatic restart (after 15min idle)
- Manual restart
- New deployment
- Server crash
```

**Impact:**
- Users need to re-subscribe after every restart
- Not suitable for production with >5 users
- Okay for testing/demo purposes

**Example Timeline:**
```
10:00 AM - User subscribes
10:05 AM - db.json: {"users": [user1]}
10:20 AM - Server sleeps (inactive 15 min)
10:25 AM - New request → Server wakes up
10:25 AM - db.json: {"users": []}  ← DATA LOST!
```

---

### 3️⃣ Render.com PAID Tier ($7/month)

**Status:** ✅ **PERSISTS**

```
Solution: Persistent disk (included in paid plan)

When server restarts:
- Disk remains intact
- db.json survives
- All users preserved!

Features:
- Always-on (no sleeping)
- 400 hours/month
- Persistent disk storage
```

**Recommended for production!**

---

### 4️⃣ Your Own VPS/Server

**Status:** ✅ **PERSISTS**

```
Platforms:
- DigitalOcean
- AWS EC2
- Linode
- Your own server

All have persistent filesystems by default.
```

---

## 🛠️ Solutions for Better Persistence

### Option 1: Upgrade to Render Paid Plan

**Cost:** $7/month
**Setup:** Click "Upgrade" in Render dashboard
**Persistence:** ✅ Automatic

**Best for:** Production use, <1000 users

---

### Option 2: Add PostgreSQL Database

**Current (JSON file):**
```typescript
// Stored in memory + file
private data: DatabaseData = { users: [] };
await fs.writeFile('db.json', ...);
```

**Better (PostgreSQL):**
```typescript
// Stored in dedicated database
await db.query('INSERT INTO users VALUES ...');
```

**Advantages:**
- ✅ Always persists (even on Render free tier)
- ✅ Better performance for >100 users
- ✅ Query capabilities
- ✅ Concurrent access safe
- ✅ Backups available

**Free Options:**
- Render PostgreSQL (free tier)
- Supabase (free tier)
- Railway (free tier)

**Setup Difficulty:** Medium (requires migration)

---

### Option 3: Add MongoDB/Firebase

**Similar to PostgreSQL but NoSQL**

**Free Options:**
- MongoDB Atlas (free 512MB)
- Firebase Firestore (free tier)

**Advantages:**
- ✅ Always persists
- ✅ JSON-like structure (easier migration)
- ✅ Real-time capabilities

---

### Option 4: External JSON Storage

**Services:**
- JSONBin.io (free tier)
- Firebase Realtime DB
- AWS S3 (cheap)

**How it works:**
```typescript
// Instead of local file:
await fs.writeFile('db.json', data);

// Store remotely:
await fetch('https://api.jsonbin.io/v3/b/YOUR_BIN', {
  method: 'PUT',
  body: JSON.stringify(data)
});
```

**Advantages:**
- ✅ Persists on Render free tier
- ✅ Minimal code changes
- ✅ Easy to implement

**Disadvantages:**
- ⚠️ Network latency
- ⚠️ API rate limits

---

## 🧪 Testing Persistence

### Test 1: Local Development
```bash
# Terminal 1: Start server
npm run dev:backend

# Terminal 2: Subscribe a user
curl -X POST http://localhost:3001/api/exam/subscribe -H "Content-Type: application/json" -d '{
  "personalNumber": "01234567890",
  "phoneNumber": "555123456",
  "categoryCode": 4,
  "categoryName": "B კატეგორია",
  "centerId": 6,
  "centerName": "თბილისი",
  "email": "test@example.com"
}'

# Terminal 1: Restart server (Ctrl+C, then npm run dev:backend)

# Terminal 2: Check if user still exists
curl http://localhost:3001/api/exam/subscribers
# Should show the user ✓
```

### Test 2: Check db.json
```bash
cat backend/db.json
```

Should see:
```json
{
  "users": [
    {
      "id": "01234567890-4-...",
      "personalNumber": "01234567890",
      ...
    }
  ]
}
```

---

## 📊 Comparison Table

| Platform | Persists? | Cost | Best For |
|----------|-----------|------|----------|
| **Local Dev** | ✅ Yes | Free | Development |
| **Render Free** | ❌ No | Free | Testing/Demo |
| **Render Paid** | ✅ Yes | $7/mo | Production <1000 users |
| **PostgreSQL** | ✅ Yes | Free* | Production any size |
| **MongoDB** | ✅ Yes | Free* | Production any size |
| **Own VPS** | ✅ Yes | $5+/mo | Full control |

*Free tiers available with limits

---

## 🚨 Current State Warning

**If you deploy to Render.com FREE tier AS-IS:**

```
❌ Users will be lost on every restart
❌ Not suitable for real production use
❌ Subscribers will need to re-register often
```

**Recommended Actions:**

1. **For Testing:** Use as-is, it's fine
2. **For Production (<50 users):** Upgrade to Render Paid ($7/mo)
3. **For Production (>50 users):** Migrate to PostgreSQL (see below)

---

## 🔄 Migration Guide to PostgreSQL

### Step 1: Add PostgreSQL Dependency
```bash
cd backend
npm install pg
```

### Step 2: Create Database Schema
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  personal_number VARCHAR(11) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  category_code INTEGER NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  center_id INTEGER NOT NULL,
  center_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  telegram_chat_id VARCHAR(50),
  last_checked TIMESTAMP,
  notified BOOLEAN DEFAULT FALSE
);
```

### Step 3: Update database.ts
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

class Database {
  async addUser(user: User) {
    await pool.query(
      'INSERT INTO users VALUES ($1, $2, $3, ...) ON CONFLICT (id) DO UPDATE ...',
      [user.id, user.personalNumber, ...]
    );
  }

  async getUsers(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
  }
  // ... etc
}
```

### Step 4: Add to Render
```bash
# In Render dashboard:
1. Create PostgreSQL database (free)
2. Copy connection string
3. Add to environment variables:
   DATABASE_URL=postgresql://...
```

**Migration difficulty:** Medium
**Time required:** 1-2 hours
**Worth it?** Yes, for production!

---

## 💡 Recommendations

### For Your Current App:

**Phase 1 (Now):** Deploy to Render free tier
- Good for testing and demo
- Accept data loss on restarts
- Share with friends for feedback

**Phase 2 (After 10+ users):** Upgrade to Render paid
- $7/month
- Data persists
- Always-on

**Phase 3 (After 100+ users):** Migrate to PostgreSQL
- Better performance
- Scalable
- Professional solution

---

## 🔍 How to Check Current Status

### Check if data persisted after restart:

```bash
# Before restart:
curl http://your-backend-url/api/exam/subscribers
# Note the count

# After restart:
curl http://your-backend-url/api/exam/subscribers
# Compare the count

# On Render free tier: Count will be 0
# On Render paid tier: Count will be same
```

---

## ✅ Quick Decision Matrix

**Choose based on your needs:**

```
Just testing?
└─> Use current setup on Render free tier

Have 5-10 users?
└─> Upgrade to Render paid ($7/mo)

Have 50+ users?
└─> Migrate to PostgreSQL (free tier available)

Need 100% reliability?
└─> PostgreSQL on paid hosting

Building serious product?
└─> PostgreSQL + Redis + Monitoring
```

---

## 📝 Summary

**Current Setup:**
- ✅ Works perfectly locally
- ✅ Data persists on your machine
- ❌ Data DOES NOT persist on Render free tier
- ✅ Data DOES persist on Render paid tier

**Recommended Path:**
1. Test on Render free tier (accept data loss)
2. Upgrade to paid when you have real users ($7/mo)
3. Migrate to PostgreSQL when you scale (free options available)

---

**Your data persistence = Your deployment choice**

Choose wisely based on your needs and budget! 💰
