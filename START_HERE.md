# 🚗 QalaqiChecker - START HERE

> **Georgian Driver License Exam Checker**
> Monitor exam availability and get notified instantly!

---

## ⚡ Quick Start (Choose Your Path)

### 🏃‍♂️ I want to run it NOW (5 minutes)
```bash
./scripts/setup.sh
npm run dev
# Visit http://localhost:3000
```
Then read: **[QUICK_START.md](QUICK_START.md)**

### 🚀 I want to deploy it to production (15 minutes)
1. Follow local setup above first
2. Read: **[DEPLOYMENT.md](DEPLOYMENT.md)**
3. Use checklist: **[CHECKLIST.md](CHECKLIST.md)**

### 📚 I want to understand everything first
Read: **[README.md](README.md)** → **[ARCHITECTURE.md](ARCHITECTURE.md)**

### 🧪 I want to test the API
1. Ensure backend is running
2. Run: `./scripts/test-flow.sh`
3. Read: **[API_EXAMPLES.md](API_EXAMPLES.md)**

---

## 📂 Project Structure

```
qalaqichecker/
│
├── 📖 Documentation
│   ├── START_HERE.md          ← You are here!
│   ├── README.md              ← Complete guide
│   ├── QUICK_START.md         ← Get running fast
│   ├── DEPLOYMENT.md          ← Deploy to production
│   ├── API_EXAMPLES.md        ← Test the API
│   ├── ARCHITECTURE.md        ← System design
│   ├── PROJECT_SUMMARY.md     ← Overview
│   └── CHECKLIST.md           ← Deployment checklist
│
├── 🎨 Frontend (Next.js)
│   ├── app/
│   │   ├── page.tsx           ← Main page
│   │   ├── layout.tsx         ← Root layout
│   │   └── globals.css        ← Styles
│   ├── components/
│   │   └── ExamForm.tsx       ← Main form component
│   ├── utils/
│   │   └── api.ts             ← API client
│   └── .env.local             ← Config (create this)
│
├── ⚙️ Backend (Express)
│   ├── src/
│   │   ├── server.ts          ← Express app
│   │   ├── types.ts           ← TypeScript types
│   │   ├── routes/
│   │   │   └── examRoutes.ts  ← API endpoints
│   │   └── utils/
│   │       ├── apiClient.ts   ← Georgian API wrapper
│   │       ├── database.ts    ← JSON DB
│   │       ├── checkAvailability.ts
│   │       ├── notifications.ts
│   │       └── scheduler.ts   ← Cron job
│   ├── .env                   ← Config (create this)
│   └── db.json                ← User database
│
├── 🔧 Scripts
│   ├── setup.sh               ← Initial setup
│   ├── test-flow.sh           ← API testing
│   └── deploy-check.sh        ← Verify deployment
│
└── 📦 Config Files
    ├── package.json           ← Root dependencies
    └── .gitignore             ← Git ignore rules
```

---

## 🎯 What Does This App Do?

1. **User visits site** and enters personal info
2. **Selects exam category** (e.g., "B კატეგორია")
3. **Selects exam center** (e.g., "თბილისი")
4. **Checks availability** from Georgian gov API
5. **If available** → Shows date + link to book
6. **If not available** → Can subscribe for notifications
7. **Background job** checks every 15 min
8. **When exam appears** → Sends email/Telegram

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 + TailwindCSS + TypeScript |
| **Backend** | Express.js + Node.js + TypeScript |
| **Database** | JSON file (upgradeable to PostgreSQL) |
| **Cron Job** | node-cron |
| **Notifications** | Resend (email) + Telegram Bot |
| **Deployment** | Vercel (frontend) + Render (backend) |
| **Cost** | $0/month (free tier) |

---

## 📋 Prerequisites

- ✅ Node.js 18+
- ✅ npm
- ✅ Git (for deployment)
- ✅ Text editor

Optional (for notifications):
- 📧 Resend account (free)
- 💬 Telegram bot token (free)

---

## 🚀 Installation

### Automated Setup (Recommended)
```bash
cd qalaqichecker
./scripts/setup.sh
```

This will:
- Install all dependencies
- Create `.env` files
- Prompt for API keys (optional)
- Make scripts executable

### Manual Setup
```bash
# Install dependencies
npm run install:all

# Configure backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Configure frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > frontend/.env.local
```

---

## 🏃‍♂️ Running Locally

### Start Both Servers
```bash
npm run dev
```

This starts:
- Backend on http://localhost:3001
- Frontend on http://localhost:3000

### Or Run Separately
```bash
# Terminal 1 (Backend)
npm run dev:backend

# Terminal 2 (Frontend)
npm run dev:frontend
```

---

## 🧪 Test Your Setup

### Quick Test
1. Visit http://localhost:3000
2. Enter personal number: `01234567890`
3. Complete the flow

### Complete Test
```bash
./scripts/test-flow.sh
```

Should see:
```
✅ Health check
✅ Categories fetched
✅ Centers fetched
✅ Exam check
✅ Subscription
✅ Manual trigger
✅ Cleanup
```

---

## 🔑 Optional: Enable Notifications

### Email (via Resend)

1. Sign up at [resend.com](https://resend.com)
2. Create API key
3. Add to `backend/.env`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev
```
4. Restart backend

### Telegram

1. Create bot:
   - Open Telegram
   - Search [@BotFather](https://t.me/BotFather)
   - Send `/newbot`
   - Follow instructions
   - Copy token

2. Get Chat ID:
   - Search [@userinfobot](https://t.me/userinfobot)
   - Start chat
   - Copy your Chat ID

3. Add to `backend/.env`:
```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
```

4. Users enter their Chat ID when subscribing

---

## 🌐 Deploying to Production

### Prerequisites
- GitHub account
- Render.com account
- Vercel account

### Quick Deploy

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create qalaqichecker --public --source=. --push
```

2. **Deploy Backend (Render)**
   - Go to [render.com](https://render.com)
   - New Web Service from GitHub
   - Root: `backend`
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Add environment variables

3. **Deploy Frontend (Vercel)**
```bash
cd frontend
vercel --prod
vercel env add NEXT_PUBLIC_API_URL
# Enter your Render backend URL
```

4. **Verify**
```bash
./scripts/deploy-check.sh
```

**Full guide:** [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📖 Documentation Guide

| When to Read | Document |
|--------------|----------|
| **First time setup** | [QUICK_START.md](QUICK_START.md) |
| **Want full details** | [README.md](README.md) |
| **Ready to deploy** | [DEPLOYMENT.md](DEPLOYMENT.md) + [CHECKLIST.md](CHECKLIST.md) |
| **Testing APIs** | [API_EXAMPLES.md](API_EXAMPLES.md) |
| **Understanding design** | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **Project overview** | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) |
| **Need step-by-step** | [CHECKLIST.md](CHECKLIST.md) |

---

## 🎓 Learning Path

### Beginner
1. Read [QUICK_START.md](QUICK_START.md)
2. Run `./scripts/setup.sh`
3. Run `npm run dev`
4. Test the app manually

### Intermediate
1. Complete beginner steps
2. Read [README.md](README.md)
3. Run `./scripts/test-flow.sh`
4. Explore API with [API_EXAMPLES.md](API_EXAMPLES.md)
5. Read [ARCHITECTURE.md](ARCHITECTURE.md)

### Advanced
1. Complete intermediate steps
2. Deploy using [DEPLOYMENT.md](DEPLOYMENT.md)
3. Follow [CHECKLIST.md](CHECKLIST.md)
4. Customize and extend features
5. Set up monitoring and analytics

---

## 🆘 Common Issues

### "Module not found" errors
```bash
npm run install:all
```

### "Port already in use"
```bash
# Change port in backend/.env
PORT=3002
```

### Frontend can't reach backend
```bash
# Check backend is running
curl http://localhost:3001/health

# Verify .env.local
cat frontend/.env.local
# Should show: NEXT_PUBLIC_API_URL=http://localhost:3001
```

### No notifications received
1. Check `RESEND_API_KEY` in `backend/.env`
2. Check backend logs for errors
3. Trigger manual check: `curl -X POST http://localhost:3001/api/exam/manual-check`

**More help:** [CHECKLIST.md](CHECKLIST.md) → Troubleshooting section

---

## 📊 Project Status

✅ **Complete & Production-Ready**

- ✅ Full-stack implementation
- ✅ Email notifications (Resend)
- ✅ Telegram notifications
- ✅ Background monitoring
- ✅ Rate limiting
- ✅ Error handling
- ✅ Complete documentation
- ✅ Deployment guides
- ✅ Test scripts

---

## 🎯 Next Steps

After getting it running:

1. ✅ Test locally
2. ✅ Subscribe with your email
3. ✅ Verify notifications work
4. ✅ Deploy to production
5. ✅ Share with friends
6. ✅ Monitor logs
7. ✅ Consider upgrades (if needed)

---

## 💡 Need Help?

1. **Check documentation** in this folder
2. **Run test script**: `./scripts/test-flow.sh`
3. **Check logs**:
   - Backend: Terminal where backend runs
   - Frontend: Browser console
4. **Verify config**:
   - `backend/.env` exists and has correct values
   - `frontend/.env.local` has correct API URL

---

## 🤝 Contributing

Want to improve this project?

**Ideas:**
- Add user authentication
- Create admin dashboard
- Add SMS notifications
- Mobile app version
- Multiple exam tracking
- Historical data

**Technical:**
- Add tests (Jest, Playwright)
- PostgreSQL database
- Docker containers
- CI/CD pipeline
- Better error handling

---

## 📜 License

MIT License - Free to use, modify, and distribute!

---

## 🎉 Let's Get Started!

Choose your path:

```bash
# Path 1: Quick local setup
./scripts/setup.sh && npm run dev

# Path 2: Test the API
./scripts/test-flow.sh

# Path 3: Read documentation
cat README.md
```

---

**Made with ❤️ for Georgian drivers | 2025**

🚗 **Let's help people get their driving licenses faster!** 🚗
