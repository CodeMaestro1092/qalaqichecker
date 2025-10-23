# 🎨 QalaqiChecker - Visual Guide

Visual diagrams to help you understand the project!

---

## 🎯 User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    INSTANT CHECK MODE                            │
└─────────────────────────────────────────────────────────────────┘

1. User arrives at homepage
   │
   ▼
2. Enters personal number (11 digits) + phone
   │
   ▼
3. Frontend fetches categories from backend
   │
   ▼
4. User selects category (e.g., "B კატეგორია")
   │
   ▼
5. Frontend fetches centers for category
   │
   ▼
6. User selects center (e.g., "თბილისი")
   │
   ▼
7. Backend checks Georgian API for exam dates
   │
   ├─► AVAILABLE ───► Show date + center
   │                  Display "Book Now" button
   │                  Link to my.gov.ge
   │
   └─► NOT AVAILABLE ───► Show "Currently unavailable"
                           Offer subscription form
                           Enter email/Telegram
                           Click "Subscribe"

┌─────────────────────────────────────────────────────────────────┐
│                   SUBSCRIPTION MODE                              │
└─────────────────────────────────────────────────────────────────┘

User subscribes ──► Stored in db.json
                        │
                        ▼
            Background job runs every 15 min
                        │
                        ▼
            For each user: Check Georgian API
                        │
                        ├─► STILL UNAVAILABLE ──► Continue monitoring
                        │
                        └─► NOW AVAILABLE ──► Send notification
                                             Mark as notified
                                             User receives alert
                                             User books exam!
```

---

## 🏗️ System Architecture Diagram

```
╔═══════════════════════════════════════════════════════════════╗
║                         FRONTEND                              ║
║                      (Next.js App)                            ║
║                                                               ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │  ExamForm.tsx                                        │   ║
║  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐  │   ║
║  │  │ Step 1  │→ │ Step 2  │→ │ Step 3  │→ │ Step 4 │  │   ║
║  │  │Personal │  │Category │  │ Center  │  │ Result │  │   ║
║  │  └─────────┘  └─────────┘  └─────────┘  └────────┘  │   ║
║  └──────────────────────────────────────────────────────┘   ║
║                          │                                    ║
║                          │ api.ts (axios)                     ║
╚══════════════════════════│═══════════════════════════════════╝
                           │
                           │ HTTPS/REST
                           │
╔══════════════════════════▼═══════════════════════════════════╗
║                        BACKEND                                ║
║                     (Express Server)                          ║
║                                                               ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │  server.ts                                             │  ║
║  │  • CORS middleware                                     │  ║
║  │  • JSON parser                                         │  ║
║  │  • Routes: /api/exam/*                                 │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                          │                                    ║
║  ┌───────────────────┬───┴────┬───────────────────────────┐  ║
║  │                   │        │                           │  ║
║  ▼                   ▼        ▼                           ▼  ║
║  examRoutes.ts   database.ts  scheduler.ts    notifications.ts║
║  • GET categories    • load()   • cron(15min)    • email()   ║
║  • GET centers       • save()   • checkAll()     • telegram()║
║  • POST check        • add()    • notify()                   ║
║  • POST subscribe    • update()                              ║
║                                                               ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │  apiClient.ts (Georgian Gov API)                       │  ║
║  │  • checkActiveRequest()                                │  ║
║  │  • getCategories()                                     │  ║
║  │  • getCenters()                                        │  ║
║  │  • getExamDates()                                      │  ║
║  │  • Rate limiting: 5s delay between calls              │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                          │                                    ║
╚══════════════════════════│═══════════════════════════════════╝
                           │
                           │ HTTP GET
                           │
╔══════════════════════════▼═══════════════════════════════════╗
║           Georgian Government API                             ║
║           https://api-my.sa.gov.ge                            ║
║                                                               ║
║  • DriverLicenseActiveRequest2                               ║
║  • DrivingLicenseExamsCategories2                            ║
║  • DrivingLicenseExamsCenters2                               ║
║  • DrivingLicenseExamsDates2                                 ║
╚═══════════════════════════════════════════════════════════════╝

When exam found:
        │
        ▼
┌──────────────────┐        ┌──────────────────┐
│   Resend API     │        │  Telegram Bot    │
│   📧 → User      │        │  💬 → User       │
└──────────────────┘        └──────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│  USER ACTION: Click "Check Exam"                              │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│  FRONTEND: POST /api/exam/check                                │
│  Body: { personalNumber, categoryCode, centerId }              │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│  BACKEND: examRoutes.ts                                        │
│  • Validate request                                            │
│  • Call checkExamAvailability()                                │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│  apiClient.checkActiveRequest()                                │
│  GET .../DriverLicenseActiveRequest2?PersonalNumber=XXX        │
│  Wait 5 seconds (rate limit)                                   │
│  Response: { hasActiveRequest: false }                         │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│  apiClient.getExamDates()                                      │
│  GET .../DrivingLicenseExamsDates2?CategoryCode=4&CenterId=6   │
│  Wait 5 seconds                                                │
│  Response: [{ examDate: "2025-11-01" }] OR []                  │
└────────────────────────────────────────────────────────────────┘
         │
         ├─► IF dates.length > 0 (AVAILABLE)
         │        │
         │        ▼
         │   ┌────────────────────────────────────────────┐
         │   │ Fetch category and center names           │
         │   │ Return: {                                  │
         │   │   available: true,                         │
         │   │   date: "2025-11-01",                      │
         │   │   center: "ზუგდიდი",                       │
         │   │   category: "B კატეგორია ავტომატიკა",      │
         │   │   message: "გამოცდა ხელმისაწვდომია!"        │
         │   │ }                                          │
         │   └────────────────────────────────────────────┘
         │
         └─► ELSE (NOT AVAILABLE)
                  │
                  ▼
             ┌────────────────────────────────────────────┐
             │ Return: {                                  │
             │   available: false,                        │
             │   message: "ამჟამად გამოცდა არ არის..."    │
             │ }                                          │
             └────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│  FRONTEND: Display result                                      │
│  • If available → Show date + "Book Now" button                │
│  • If not → Show subscription form                             │
└────────────────────────────────────────────────────────────────┘
```

---

## ⏰ Background Job Flow

```
┌────────────────────────────────────────────────────────────────┐
│  SCHEDULER STARTS                                              │
│  node-cron: */15 * * * * (every 15 minutes)                    │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│  Load users from db.json                                       │
│  [                                                             │
│    { id: "...", personalNumber: "01234567890", ... },         │
│    { id: "...", personalNumber: "09876543210", ... },         │
│    ...                                                         │
│  ]                                                             │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│  FOR EACH USER:                                                │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│  Check user: 01234567890 (B კატეგორია ავტომატიკა)              │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│  Call checkUserExam(user)                                      │
│  • API call to Georgian portal                                 │
│  • Wait 5 seconds                                              │
│  • Get result                                                  │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│  Update user.lastChecked = NOW                                 │
└────────────────────────────────────────────────────────────────┘
         │
         ├─► IF available && !notified
         │        │
         │        ▼
         │   ┌────────────────────────────────────────────┐
         │   │ Send Notifications:                        │
         │   │ • Email (if user.email)                    │
         │   │ • Telegram (if user.telegramChatId)        │
         │   └────────────────────────────────────────────┘
         │        │
         │        ▼
         │   ┌────────────────────────────────────────────┐
         │   │ Update user.notified = true                │
         │   │ Save to db.json                            │
         │   │ Log: "📧 Notification sent"                │
         │   └────────────────────────────────────────────┘
         │
         ├─► IF available && notified
         │        │
         │        └──► Log: "Already notified, skip"
         │
         └─► IF !available
                  │
                  └──► Log: "❌ No exam available"
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│  Wait 2 seconds before next user (rate limiting)               │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│  REPEAT for next user...                                       │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│  All users checked                                             │
│  Log: "✅ Check complete"                                      │
│  Wait 15 minutes...                                            │
│  REPEAT                                                        │
└────────────────────────────────────────────────────────────────┘
```

---

## 📱 Frontend UI Flow

```
╔══════════════════════════════════════════════════════════════╗
║                    STEP 1: Personal Info                     ║
╚══════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────┐
│  🚗 QalaqiChecker                                            │
│  მართვის მოწმობის გამოცდის შემოწმება                          │
│                                                              │
│  Progress: [████░░░░░░░░] 25%                                │
│  პირადი ინფო | კატეგორია | ცენტრი | შედეგი                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ პირადი ნომერი *                                        │ │
│  │ [01234567890_____]                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ტელეფონის ნომერი *                                     │ │
│  │ [5XX XXX XXX_____]                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [ შემდეგი ]                                                 │
└──────────────────────────────────────────────────────────────┘

                          ▼ Click "შემდეგი"

╔══════════════════════════════════════════════════════════════╗
║                    STEP 2: Select Category                   ║
╚══════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────┐
│  Progress: [████████░░░░] 50%                                │
│  პირადი ინფო | კატეგორია | ცენტრი | შედეგი                   │
│                                                              │
│  აირჩიეთ კატეგორია                                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ B კატეგორია ავტომატიკა                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ B კატეგორია                                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [ ← უკან ]                                                  │
└──────────────────────────────────────────────────────────────┘

                          ▼ Select category

╔══════════════════════════════════════════════════════════════╗
║                    STEP 3: Select Center                     ║
╚══════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────┐
│  Progress: [████████████░] 75%                               │
│  პირადი ინფო | კატეგორია | ცენტრი | შედეგი                   │
│                                                              │
│  აირჩიეთ ცენტრი                                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ თბილისი                                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ზუგდიდი                                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ბათუმი                                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [ ← უკან ]                                                  │
└──────────────────────────────────────────────────────────────┘

                          ▼ Select center

╔══════════════════════════════════════════════════════════════╗
║              STEP 4A: Result - AVAILABLE                     ║
╚══════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────┐
│  Progress: [████████████████] 100%                           │
│                                                              │
│              🎉                                              │
│       გამოცდა ხელმისაწვდომია!                                 │
│                                                              │
│  კატეგორია: B კატეგორია ავტომატიკა                           │
│  ცენტრი: ზუგდიდი                                             │
│  თარიღი: 2025-11-01                                          │
│                                                              │
│  [ my.gov.ge-ზე გადასვლა ]                                   │
│                                                              │
│  [ თავიდან დაწყება ]                                          │
└──────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════╗
║           STEP 4B: Result - NOT AVAILABLE                    ║
╚══════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────┐
│  Progress: [████████████████] 100%                           │
│                                                              │
│              ⏳                                              │
│       გამოცდა არ არის ხელმისაწვდომი                           │
│  ამჟამად გამოცდა არ არის ხელმისაწვდომი                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ გსურთ შეტყობინების მიღება?                              │ │
│  │                                                          │ │
│  │ ელ-ფოსტა (არასავალდებულო)                               │ │
│  │ [example@gmail.com____________]                          │ │
│  │                                                          │ │
│  │ Telegram Chat ID (არასავალდებულო)                       │ │
│  │ [123456789_____________________]                         │ │
│  │ Chat ID-ს მისაღებად დაწერეთ @userinfobot-ს              │ │
│  │                                                          │ │
│  │ [ შეტყობინების გამოწერა ]                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [ თავიდან დაწყება ]                                          │
└──────────────────────────────────────────────────────────────┘

                          ▼ Subscribe

╔══════════════════════════════════════════════════════════════╗
║                    STEP 5: Success                           ║
╚══════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────┐
│              ✅                                              │
│       წარმატებით გამოიწერეთ!                                 │
│                                                              │
│  ჩვენ შემოგიწმებთ გამოცდის ხელმისაწვდომობას ყოველ 15 წუთში   │
│  და გაგიგზავნით შეტყობინებას როდესაც ადგილი გამოჩნდება.     │
│                                                              │
│  [ კარგი ]                                                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema (db.json)

```json
{
  "users": [
    {
      "id": "01234567890-4-1698321600000",
      "personalNumber": "01234567890",
      "phoneNumber": "555123456",
      "categoryCode": 4,
      "categoryName": "B კატეგორია ავტომატიკა",
      "centerId": 6,
      "centerName": "ზუგდიდი",
      "email": "user@example.com",
      "telegramChatId": "123456789",
      "lastChecked": "2025-10-23T10:30:00.000Z",
      "notified": false
    }
  ]
}
```

**Fields Explained:**
- `id`: Unique identifier (personalNumber-categoryCode-timestamp)
- `personalNumber`: 11-digit Georgian personal ID
- `phoneNumber`: User's phone (for future SMS)
- `categoryCode`: Numeric code (4 = B ავტომატიკა, 3 = B, etc.)
- `categoryName`: Human-readable category
- `centerId`: Numeric ID of service center
- `centerName`: Human-readable center name
- `email`: Optional - for email notifications
- `telegramChatId`: Optional - for Telegram notifications
- `lastChecked`: ISO timestamp of last check
- `notified`: Boolean - already sent notification?

---

## 📈 Timeline Diagram

```
TIME: 0 min
├─ User subscribes
│
TIME: 15 min
├─ Cron job checks → Not available
│
TIME: 30 min
├─ Cron job checks → Not available
│
TIME: 45 min
├─ Cron job checks → AVAILABLE! 🎉
│  └─ Send email notification
│  └─ Send Telegram notification
│  └─ Mark user as notified
│
TIME: 60 min
├─ Cron job checks → Still available, user already notified, skip
│
TIME: 75 min
├─ Cron job checks → Still available, user already notified, skip
│
...continues every 15 minutes
```

---

**Use these visuals to understand the system flow and architecture!**

For more details, see:
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [API_EXAMPLES.md](API_EXAMPLES.md) - API testing
- [README.md](README.md) - Complete documentation
