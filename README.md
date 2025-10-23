# 🚗 QalaqiChecker - Georgian Driver License Exam Checker

A full-stack application that monitors and notifies users about available driving exam slots from the official Georgian government portal.

## 📋 Features

- ✅ Real-time exam availability checking
- 📧 Email notifications (via Resend)
- 💬 Telegram notifications
- ⏰ Automated monitoring every 15 minutes
- 🎨 Clean Georgian UI with TailwindCSS
- 🔄 Background cron job for continuous checking
- 📱 Responsive design

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TailwindCSS** for styling
- **TypeScript** for type safety
- **Axios** for API calls

### Backend
- **Express.js** with TypeScript
- **Node-cron** for scheduled tasks
- **Resend** for email notifications
- **Axios** for API calls to Georgian gov portal
- **JSON file storage** for user data

## 📁 Project Structure

```
qalaqichecker/
├── frontend/                 # Next.js frontend
│   ├── app/
│   │   ├── page.tsx         # Main page
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   └── ExamForm.tsx     # Main exam checking form
│   ├── utils/
│   │   └── api.ts           # API client
│   └── package.json
│
├── backend/                  # Express backend
│   ├── src/
│   │   ├── server.ts        # Express server
│   │   ├── types.ts         # TypeScript types
│   │   ├── routes/
│   │   │   └── examRoutes.ts
│   │   └── utils/
│   │       ├── apiClient.ts        # Georgian API client
│   │       ├── database.ts         # JSON DB manager
│   │       ├── checkAvailability.ts # Exam checker
│   │       ├── notifications.ts    # Email/Telegram sender
│   │       └── scheduler.ts        # Cron job
│   └── package.json
│
└── package.json             # Root workspace config
```

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
cd qalaqichecker
npm run install:all
```

2. **Configure Backend Environment:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=3001
NODE_ENV=development

# Get API key from https://resend.com (free tier)
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev

# Optional: Get token from @BotFather on Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

CHECK_INTERVAL_MINUTES=15
API_DELAY_MS=5000
```

3. **Configure Frontend Environment:**
```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. **Start Development Servers:**
```bash
# From root directory
npm run dev

# Or separately:
# Terminal 1 (backend):
npm run dev:backend

# Terminal 2 (frontend):
npm run dev:frontend
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

## 📡 API Endpoints

### Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exam/categories?personalNumber=XXX` | Get available categories |
| GET | `/api/exam/centers?categoryCode=4` | Get centers for category |
| POST | `/api/exam/check` | Check exam availability |
| POST | `/api/exam/subscribe` | Subscribe for notifications |
| GET | `/api/exam/subscribers` | Get all subscribers |
| DELETE | `/api/exam/unsubscribe/:id` | Unsubscribe user |
| POST | `/api/exam/manual-check` | Trigger manual check |
| GET | `/health` | Health check |

### Example: Check Exam

**Request:**
```bash
curl -X POST http://localhost:3001/api/exam/check \
  -H "Content-Type: application/json" \
  -d '{
    "personalNumber": "01234567890",
    "categoryCode": 4,
    "centerId": 6
  }'
```

**Response:**
```json
{
  "available": true,
  "date": "2025-11-01",
  "center": "ზუგდიდი",
  "category": "B კატეგორია ავტომატიკა",
  "message": "გამოცდა ხელმისაწვდომია!"
}
```

## 🔔 Setting Up Notifications

### Email (Resend)

1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month)
2. Create API key
3. Add to `backend/.env`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev
```

### Telegram

1. Create bot with [@BotFather](https://t.me/BotFather)
2. Get your Chat ID from [@userinfobot](https://t.me/userinfobot)
3. Add to `backend/.env`:
```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

Users enter their Chat ID in the frontend form.

## 🌐 Deployment

### Deploy Backend to Render.com

1. **Create account** at [render.com](https://render.com)

2. **Create new Web Service:**
   - Connect your GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Add Environment Variables:**
```
PORT=3001
NODE_ENV=production
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev
TELEGRAM_BOT_TOKEN=your_token
CHECK_INTERVAL_MINUTES=15
API_DELAY_MS=5000
```

4. **Deploy!** You'll get a URL like: `https://qalaqichecker.onrender.com`

### Deploy Frontend to Vercel

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel
```

3. **Set Environment Variable:**
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://qalaqichecker.onrender.com
```

4. **Redeploy:**
```bash
vercel --prod
```

Your app will be live at: `https://qalaqichecker.vercel.app`

### Alternative: Deploy Backend to Railway.app

1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `backend` folder
4. Add environment variables
5. Deploy!

## 🧪 Testing

### Test Backend Locally

```bash
# Check health
curl http://localhost:3001/health

# Get categories
curl "http://localhost:3001/api/exam/categories?personalNumber=01234567890"

# Check exam
curl -X POST http://localhost:3001/api/exam/check \
  -H "Content-Type: application/json" \
  -d '{
    "personalNumber": "01234567890",
    "categoryCode": 4,
    "centerId": 6
  }'
```

### Manual Check Trigger

```bash
curl -X POST http://localhost:3001/api/exam/manual-check
```

## 🔧 Configuration

### Adjust Check Interval

Edit `backend/.env`:
```env
CHECK_INTERVAL_MINUTES=15  # Check every 15 minutes
```

### Rate Limiting

The app includes built-in rate limiting:
- 5 second delay between API calls
- 30 minute cooldown if rate limited by gov API
- 2 second delay between checking different users

## 📊 Monitoring

### View Logs (Render)
1. Go to Render dashboard
2. Click your service
3. View "Logs" tab

### Database
User data is stored in `backend/db.json`:
```json
{
  "users": [
    {
      "id": "01234567890-4-1234567890",
      "personalNumber": "01234567890",
      "phoneNumber": "555123456",
      "categoryCode": 4,
      "categoryName": "B კატეგორია ავტომატიკა",
      "centerId": 6,
      "centerName": "ზუგდიდი",
      "email": "user@example.com",
      "notified": false,
      "lastChecked": "2025-10-23T10:30:00.000Z"
    }
  ]
}
```

## 🛡️ Security Notes

- Never commit `.env` files
- Use environment variables for all secrets
- Rate limiting is built-in to avoid API bans
- CORS is enabled for frontend → backend communication

## 🐛 Troubleshooting

### Frontend can't reach backend
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Ensure backend is running
- Check CORS configuration in `backend/src/server.ts`

### No notifications sent
- Verify Resend API key
- Check Telegram bot token
- View backend logs for errors

### Rate limited by Georgian API
- App will auto-retry after 30 minutes
- Reduce `CHECK_INTERVAL_MINUTES` if needed

### Database errors
- Ensure `backend/db.json` has write permissions
- Check logs for file system errors

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## 📧 Contact

For issues, open a GitHub issue or contact the maintainer.

---

**Made with ❤️ for Georgian drivers**
