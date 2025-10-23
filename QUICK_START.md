# ⚡ Quick Start Guide

Get QalaqiChecker running locally in 5 minutes!

## 🚀 Installation

```bash
# 1. Navigate to project
cd qalaqichecker

# 2. Install all dependencies
npm run install:all

# 3. Configure backend
cd backend
# Edit .env file (already created with defaults)
# Optional: Add your Resend API key for email notifications

# 4. Configure frontend
cd ../frontend
# .env.local already created with correct settings

# 5. Start both servers (from root directory)
cd ..
npm run dev
```

## 🌐 Access

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## 📝 Test the App

1. Visit http://localhost:3000
2. Enter test data:
   - Personal Number: `01234567890` (11 digits)
   - Phone: `555123456`
3. Select a category (B კატეგორია)
4. Select a center
5. View results!

## 🔔 Enable Notifications (Optional)

### Email (Resend)
1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Add to `backend/.env`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```
4. Restart backend

### Telegram
1. Create bot via [@BotFather](https://t.me/BotFather)
2. Get your Chat ID from [@userinfobot](https://t.me/userinfobot)
3. Add to `backend/.env`:
```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
```
4. Restart backend
5. Enter your Chat ID when subscribing

## 🧪 Test Backend API

```bash
# Health check
curl http://localhost:3001/health

# Get categories
curl "http://localhost:3001/api/exam/categories?personalNumber=01234567890"

# Manual check trigger
curl -X POST http://localhost:3001/api/exam/manual-check
```

## 📊 How It Works

1. **User subscribes** with personal info + notification preference
2. **Background job** checks every 15 minutes
3. **When exam found** → sends email/Telegram notification
4. **User books** via official my.gov.ge portal

## 🐛 Troubleshooting

### Port already in use
```bash
# Change port in backend/.env
PORT=3002
```

### Can't connect to backend
- Check backend is running: `http://localhost:3001/health`
- Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

### No notifications
- Check backend logs for errors
- Verify API keys in `backend/.env`
- Ensure at least one notification method is configured

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Check [API documentation](README.md#-api-endpoints)

## ⚙️ Project Commands

```bash
# Install all packages
npm run install:all

# Run both servers
npm run dev

# Run individually
npm run dev:frontend
npm run dev:backend

# Build for production
npm run build:frontend
npm run build:backend
```

---

**Ready to deploy?** See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions!
