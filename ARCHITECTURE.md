# 🏗️ Architecture Overview

## 📊 System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                            │
│                     (Next.js Frontend)                           │
│                  https://qalaqichecker.vercel.app                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS/REST
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     EXPRESS BACKEND                              │
│              (Node.js + TypeScript)                              │
│        https://qalaqichecker.onrender.com                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   API Routes │  │   Scheduler  │  │  Database    │          │
│  │              │  │  (node-cron) │  │  (db.json)   │          │
│  │  /check      │  │              │  │              │          │
│  │  /subscribe  │  │  Every 15min │  │  Users list  │          │
│  │  /categories │  │              │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘          │
│         │                 │                                      │
│         │                 │                                      │
│  ┌──────▼─────────────────▼───────┐                             │
│  │   Exam Availability Checker    │                             │
│  │   (checkAvailability.ts)       │                             │
│  └──────┬─────────────────────────┘                             │
│         │                                                        │
└─────────┼────────────────────────────────────────────────────────┘
          │
          │ HTTPS GET Requests
          │
┌─────────▼────────────────────────────────────────────────────────┐
│              Georgian Government API                              │
│              https://api-my.sa.gov.ge                             │
│                                                                   │
│  • DriverLicenseActiveRequest2                                   │
│  • DrivingLicenseExamsCategories2                                │
│  • DrivingLicenseExamsCenters2                                   │
│  • DrivingLicenseExamsDates2                                     │
└───────────────────────────────────────────────────────────────────┘

          │
          │ When exam found
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICATIONS                                 │
│                                                                  │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │   Resend API     │              │  Telegram Bot    │         │
│  │   (Email)        │              │   (Messages)     │         │
│  │                  │              │                  │         │
│  │  📧 → User       │              │  💬 → User       │         │
│  └──────────────────┘              └──────────────────┘         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Flow Diagram

### Flow 1: Instant Check

```
User visits site
    │
    ▼
Enters personal number
    │
    ▼
Frontend → Backend → Georgian API
    │                      │
    │                      ▼
    │              Get Categories
    │                      │
    ▼                      ▼
User selects category
    │
    ▼
Frontend → Backend → Georgian API
    │                      │
    │                      ▼
    │              Get Centers
    │                      │
    ▼                      ▼
User selects center
    │
    ▼
Frontend → Backend → Georgian API
    │                      │
    │                      ▼
    │              Check Exam Dates
    │                      │
    ▼                      ▼
    ├─► Available? → Show date, link to my.gov.ge
    │
    └─► Not available? → Offer subscription
```

### Flow 2: Subscribe & Monitor

```
User subscribes
    │
    ▼
Backend saves to db.json
    │
    ▼
Background cron job (every 15 min)
    │
    ▼
For each user:
    │
    ├─► Check Georgian API
    │       │
    │       ▼
    │   Exam available?
    │       │
    │       ├─► YES → Send notification (email/telegram)
    │       │           │
    │       │           ▼
    │       │       Mark as notified
    │       │
    │       └─► NO → Continue to next user
    │
    └─► Repeat in 15 minutes
```

---

## 📦 Component Architecture

### Frontend (Next.js)

```
frontend/
│
├── app/
│   ├── page.tsx              # Main page (server component)
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Tailwind styles
│
├── components/
│   └── ExamForm.tsx          # Main form component
│       │
│       ├── Step 1: Personal Info
│       ├── Step 2: Select Category
│       ├── Step 3: Select Center
│       ├── Step 4: View Results / Subscribe
│       └── Step 5: Success
│
└── utils/
    └── api.ts                # API client functions
        │
        ├── getCategories()
        ├── getCenters()
        ├── checkExam()
        └── subscribe()
```

### Backend (Express)

```
backend/
│
├── src/
│   ├── server.ts             # Express app setup
│   │   │
│   │   ├── CORS middleware
│   │   ├── JSON parser
│   │   ├── Routes mounting
│   │   └── Error handling
│   │
│   ├── routes/
│   │   └── examRoutes.ts     # API endpoints
│   │       │
│   │       ├── GET  /categories
│   │       ├── GET  /centers
│   │       ├── POST /check
│   │       ├── POST /subscribe
│   │       ├── GET  /subscribers
│   │       ├── DELETE /unsubscribe/:id
│   │       └── POST /manual-check
│   │
│   └── utils/
│       │
│       ├── apiClient.ts      # Georgian API wrapper
│       │   │
│       │   ├── Rate limiting (5s delay)
│       │   ├── Error handling
│       │   └── API methods:
│       │       ├── checkActiveRequest()
│       │       ├── getCategories()
│       │       ├── getCenters()
│       │       └── getExamDates()
│       │
│       ├── database.ts       # JSON file DB
│       │   │
│       │   ├── load()
│       │   ├── save()
│       │   ├── addUser()
│       │   ├── getUsers()
│       │   ├── updateUser()
│       │   └── removeUser()
│       │
│       ├── checkAvailability.ts  # Core checker logic
│       │   │
│       │   ├── checkExamAvailability()
│       │   └── checkUserExam()
│       │
│       ├── notifications.ts  # Notification senders
│       │   │
│       │   ├── sendEmailNotification()
│       │   ├── sendTelegramNotification()
│       │   └── notifyUser()
│       │
│       └── scheduler.ts      # Cron job
│           │
│           ├── startScheduler()
│           ├── checkAllUsers()
│           └── triggerManualCheck()
```

---

## 🔌 API Integration Points

### Georgian Government APIs

```typescript
// Base URL
const BASE_URL = 'https://api-my.sa.gov.ge/api/v1/DrivingLicensePracticalExams2';

// 1. Check Active Request
GET ${BASE_URL}/DriverLicenseActiveRequest2
    ?PersonalNumber={id}
→ Returns: { hasActiveRequest: boolean }

// 2. Get Categories
GET ${BASE_URL}/DrivingLicenseExamsCategories2
    ?PersonalNumber={id}
→ Returns: [{ code: number, name: string }]

// 3. Get Centers
GET ${BASE_URL}/DrivingLicenseExamsCenters2
    ?CategoryCode={code}
→ Returns: [{ serviceCenterId: number, serviceCenterName: string }]

// 4. Get Exam Dates
GET ${BASE_URL}/DrivingLicenseExamsDates2
    ?CategoryCode={code}&CenterId={id}
→ Returns: [{ examDate: string }] or []
```

### External Services

```typescript
// Resend Email API
POST https://api.resend.com/emails
Headers: Authorization: Bearer {API_KEY}
Body: { from, to, subject, html }

// Telegram Bot API
POST https://api.telegram.org/bot{TOKEN}/sendMessage
Body: { chat_id, text, parse_mode }
```

---

## 🗄️ Data Models

### User

```typescript
interface User {
  id: string;                    // Unique ID: {personalNumber}-{categoryCode}-{timestamp}
  personalNumber: string;        // 11-digit ID
  phoneNumber: string;           // Contact number
  categoryCode: number;          // e.g., 4 for "B ავტომატიკა"
  categoryName: string;          // Human-readable
  centerId: number;              // Service center ID
  centerName: string;            // e.g., "ზუგდიდი"
  email?: string;                // Optional notification
  telegramChatId?: string;       // Optional notification
  lastChecked?: string;          // ISO timestamp
  notified?: boolean;            // Already sent notification?
}
```

### Database (db.json)

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

---

## ⚡ Request Flow Example

### Complete Request: Check Exam

```
1. User clicks "Check Exam"
   │
2. Frontend: POST /api/exam/check
   │
3. Backend: examRoutes.ts receives request
   │
4. Backend: checkExamAvailability()
   │
   ├─► apiClient.checkActiveRequest()
   │   │
   │   └─► GET https://api-my.sa.gov.ge/.../DriverLicenseActiveRequest2
   │       Wait 5 seconds (rate limit)
   │
   ├─► apiClient.getExamDates()
   │   │
   │   └─► GET https://api-my.sa.gov.ge/.../DrivingLicenseExamsDates2
   │       Wait 5 seconds
   │
   ├─► If dates.length > 0:
   │   │
   │   ├─► apiClient.getCenters() [for center name]
   │   │
   │   └─► apiClient.getCategories() [for category name]
   │
   └─► Return { available, date?, center?, category?, message }
   │
5. Frontend: Display result
```

---

## 🔄 Background Job Flow

### Cron Job (Every 15 Minutes)

```
1. Scheduler triggers
   │
2. Load all users from db.json
   │
3. For each user:
   │
   ├─► checkUserExam(user)
   │   │
   │   ├─► Call Georgian API
   │   │   Wait 5 seconds
   │   │
   │   └─► Return result
   │
   ├─► If available AND not notified:
   │   │
   │   ├─► Send email (if user.email)
   │   ├─► Send Telegram (if user.telegramChatId)
   │   │
   │   └─► Update user: notified = true
   │
   ├─► Update user: lastChecked = now
   │
   └─► Wait 2 seconds before next user
   │
4. Save db.json
   │
5. Wait 15 minutes, repeat
```

---

## 🛡️ Error Handling Strategy

### API Client Errors

```typescript
try {
  const response = await axios.get(url);
  return response.data;
} catch (error) {
  if (error.response?.status === 429) {
    // Rate limited
    throw new Error('RATE_LIMITED');
  }
  // Other errors
  throw error;
}
```

### Route Errors

```typescript
try {
  const result = await checkExamAvailability();
  res.json(result);
} catch (error) {
  if (error.message === 'RATE_LIMITED') {
    return res.json({
      available: false,
      message: 'API შეზღუდულია. გთხოვთ სცადოთ 30 წუთში'
    });
  }
  res.status(500).json({ error: 'Internal error' });
}
```

---

## 🚀 Performance Optimizations

### Rate Limiting

- **5 second delay** between API calls
- Prevents ban from government API
- Throttle implemented in `apiClient.ts`

### Efficient Checking

- **2 second delay** between users in cron job
- Parallel notification sending (email + Telegram)
- Skip already-notified users

### Caching (Future Enhancement)

```typescript
// Could add Redis for caching:
// - Cache categories for 1 hour
// - Cache centers for 1 hour
// - Only check exam dates in real-time
```

---

## 📈 Scalability Considerations

### Current Limitations

- JSON file database (not suitable for 1000+ users)
- Single server (no load balancing)
- No queue system for notifications

### Scaling Solutions

**100-1000 users:**
- ✅ Current setup works fine
- Consider PostgreSQL instead of JSON

**1000-10000 users:**
- Add PostgreSQL database
- Add Redis for caching
- Use Bull/BullMQ for job queue
- Deploy multiple backend instances

**10000+ users:**
- Microservices architecture
- Separate checker service
- Message queue (RabbitMQ)
- Load balancer
- CDN for frontend

---

## 🔐 Security Considerations

### Current Implementation

✅ CORS enabled for specific origins
✅ Environment variables for secrets
✅ No user authentication (by design)
✅ Rate limiting to external API

### Production Recommendations

- Add rate limiting to your API (express-rate-limit)
- Add request validation (joi/zod)
- Add API key for admin endpoints
- Monitor for abuse
- Add CAPTCHA for subscriptions

---

## 📊 Monitoring & Logging

### Current Logging

```typescript
// Request logging
console.log(`${timestamp} - ${method} ${path}`);

// Cron job logging
console.log('🔍 Checking 3 user(s)...');
console.log('✅ Exam found!');
console.log('📧 Notification sent');
```

### Production Monitoring (Recommended)

- **Sentry** for error tracking
- **LogRocket** for session replay
- **Datadog** for APM
- **Uptime Robot** for uptime monitoring

---

## 🧪 Testing Strategy

### Manual Testing

- See [API_EXAMPLES.md](API_EXAMPLES.md)

### Automated Testing (Future)

```typescript
// Unit tests
describe('checkExamAvailability', () => {
  it('returns available when dates exist', async () => {
    // Mock API response
    // Assert result.available === true
  });
});

// Integration tests
describe('POST /api/exam/subscribe', () => {
  it('creates new user subscription', async () => {
    // POST request
    // Assert database updated
  });
});
```

---

**This architecture is designed for:**
- 🎯 Simplicity and maintainability
- 📈 Easy to understand and extend
- 💰 Free tier deployment
- 🚀 Quick iteration

For production at scale, consider the scaling solutions mentioned above.
