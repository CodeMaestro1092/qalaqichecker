# 🧪 API Testing Examples

Complete examples for testing the QalaqiChecker API.

## 📍 Base URLs

**Local:**
```bash
export API_URL=http://localhost:3001
```

**Production:**
```bash
export API_URL=https://qalaqichecker-backend.onrender.com
```

---

## 🏥 Health Check

```bash
curl $API_URL/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-23T10:30:00.000Z"
}
```

---

## 1️⃣ Get Available Categories

Retrieve categories for a personal number.

```bash
curl "$API_URL/api/exam/categories?personalNumber=01234567890"
```

**Response:**
```json
[
  {
    "code": 4,
    "name": "B კატეგორია ავტომატიკა"
  },
  {
    "code": 3,
    "name": "B კატეგორია"
  }
]
```

---

## 2️⃣ Get Centers for Category

Get available test centers for a specific category.

```bash
curl "$API_URL/api/exam/centers?categoryCode=4"
```

**Response:**
```json
[
  {
    "serviceCenterId": 1,
    "serviceCenterName": "თბილისი"
  },
  {
    "serviceCenterId": 6,
    "serviceCenterName": "ზუგდიდი"
  },
  {
    "serviceCenterId": 11,
    "serviceCenterName": "ბათუმი"
  }
]
```

---

## 3️⃣ Check Exam Availability

Check if exams are available for specific category and center.

```bash
curl -X POST $API_URL/api/exam/check \
  -H "Content-Type: application/json" \
  -d '{
    "personalNumber": "01234567890",
    "categoryCode": 4,
    "centerId": 6
  }'
```

**Response (Available):**
```json
{
  "available": true,
  "date": "2025-11-01",
  "center": "ზუგდიდი",
  "category": "B კატეგორია ავტომატიკა",
  "message": "გამოცდა ხელმისაწვდომია!"
}
```

**Response (Not Available):**
```json
{
  "available": false,
  "message": "ამჟამად გამოცდა არ არის ხელმისაწვდომი"
}
```

**Response (Active Request Exists):**
```json
{
  "available": false,
  "message": "თქვენ უკვე გაქვთ აქტიური განაცხადი"
}
```

**Response (Rate Limited):**
```json
{
  "available": false,
  "message": "API შეზღუდულია. გთხოვთ სცადოთ 30 წუთში"
}
```

---

## 4️⃣ Subscribe for Notifications

Subscribe to receive notifications when exam becomes available.

### With Email

```bash
curl -X POST $API_URL/api/exam/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "personalNumber": "01234567890",
    "phoneNumber": "555123456",
    "categoryCode": 4,
    "categoryName": "B კატეგორია ავტომატიკა",
    "centerId": 6,
    "centerName": "ზუგდიდი",
    "email": "user@example.com"
  }'
```

### With Telegram

```bash
curl -X POST $API_URL/api/exam/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "personalNumber": "01234567890",
    "phoneNumber": "555123456",
    "categoryCode": 4,
    "categoryName": "B კატეგორია ავტომატიკა",
    "centerId": 6,
    "centerName": "ზუგდიდი",
    "telegramChatId": "123456789"
  }'
```

### With Both

```bash
curl -X POST $API_URL/api/exam/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "personalNumber": "01234567890",
    "phoneNumber": "555123456",
    "categoryCode": 4,
    "categoryName": "B კატეგორია ავტომატიკა",
    "centerId": 6,
    "centerName": "ზუგდიდი",
    "email": "user@example.com",
    "telegramChatId": "123456789"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "თქვენ წარმატებით გამოიწერეთ შეტყობინებები",
  "user": {
    "id": "01234567890-4-1698321600000",
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
}
```

---

## 5️⃣ Get All Subscribers

View all subscribed users (admin endpoint).

```bash
curl $API_URL/api/exam/subscribers
```

**Response:**
```json
[
  {
    "id": "01234567890-4-1698321600000",
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
```

---

## 6️⃣ Unsubscribe User

Remove a user from monitoring.

```bash
USER_ID="01234567890-4-1698321600000"
curl -X DELETE "$API_URL/api/exam/unsubscribe/$USER_ID"
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully unsubscribed"
}
```

---

## 7️⃣ Trigger Manual Check

Manually trigger the background checker (for testing).

```bash
curl -X POST $API_URL/api/exam/manual-check
```

**Response:**
```json
{
  "message": "Manual check completed"
}
```

**Or (if already running):**
```json
{
  "message": "Check already in progress"
}
```

---

## 🧪 Complete Test Flow

Test the entire user journey:

```bash
#!/bin/bash
API_URL=http://localhost:3001

echo "1️⃣ Health check..."
curl -s $API_URL/health | jq

echo -e "\n2️⃣ Get categories..."
CATEGORIES=$(curl -s "$API_URL/api/exam/categories?personalNumber=01234567890")
echo $CATEGORIES | jq
CATEGORY_CODE=$(echo $CATEGORIES | jq -r '.[0].code')

echo -e "\n3️⃣ Get centers for category $CATEGORY_CODE..."
CENTERS=$(curl -s "$API_URL/api/exam/centers?categoryCode=$CATEGORY_CODE")
echo $CENTERS | jq
CENTER_ID=$(echo $CENTERS | jq -r '.[0].serviceCenterId')

echo -e "\n4️⃣ Check exam availability..."
curl -s -X POST $API_URL/api/exam/check \
  -H "Content-Type: application/json" \
  -d "{
    \"personalNumber\": \"01234567890\",
    \"categoryCode\": $CATEGORY_CODE,
    \"centerId\": $CENTER_ID
  }" | jq

echo -e "\n5️⃣ Subscribe for notifications..."
curl -s -X POST $API_URL/api/exam/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "personalNumber": "01234567890",
    "phoneNumber": "555123456",
    "categoryCode": '$CATEGORY_CODE',
    "categoryName": "B კატეგორია ავტომატიკა",
    "centerId": '$CENTER_ID',
    "centerName": "თბილისი",
    "email": "test@example.com"
  }' | jq

echo -e "\n6️⃣ Trigger manual check..."
curl -s -X POST $API_URL/api/exam/manual-check | jq

echo -e "\n7️⃣ View all subscribers..."
curl -s $API_URL/api/exam/subscribers | jq

echo -e "\n✅ Test flow complete!"
```

Save as `test-flow.sh` and run:
```bash
chmod +x test-flow.sh
./test-flow.sh
```

---

## 🐍 Python Examples

### Check Exam Availability

```python
import requests

API_URL = "http://localhost:3001"

def check_exam(personal_number, category_code, center_id):
    response = requests.post(
        f"{API_URL}/api/exam/check",
        json={
            "personalNumber": personal_number,
            "categoryCode": category_code,
            "centerId": center_id
        }
    )
    return response.json()

result = check_exam("01234567890", 4, 6)
print(f"Available: {result['available']}")
if result['available']:
    print(f"Date: {result['date']}")
    print(f"Center: {result['center']}")
```

### Subscribe User

```python
def subscribe_user(data):
    response = requests.post(
        f"{API_URL}/api/exam/subscribe",
        json=data
    )
    return response.json()

result = subscribe_user({
    "personalNumber": "01234567890",
    "phoneNumber": "555123456",
    "categoryCode": 4,
    "categoryName": "B კატეგორია ავტომატიკა",
    "centerId": 6,
    "centerName": "ზუგდიდი",
    "email": "user@example.com"
})

print(result['message'])
```

---

## 🟢 Node.js Examples

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Check exam
async function checkExam(personalNumber, categoryCode, centerId) {
  const { data } = await axios.post(`${API_URL}/api/exam/check`, {
    personalNumber,
    categoryCode,
    centerId
  });
  return data;
}

// Subscribe
async function subscribe(userData) {
  const { data } = await axios.post(`${API_URL}/api/exam/subscribe`, userData);
  return data;
}

// Usage
(async () => {
  const result = await checkExam('01234567890', 4, 6);
  console.log('Available:', result.available);

  if (!result.available) {
    await subscribe({
      personalNumber: '01234567890',
      phoneNumber: '555123456',
      categoryCode: 4,
      categoryName: 'B კატეგორია ავტომატიკა',
      centerId: 6,
      centerName: 'ზუგდიდი',
      email: 'user@example.com'
    });
    console.log('Subscribed for notifications!');
  }
})();
```

---

## 🔍 Error Responses

### 400 Bad Request

**Missing required fields:**
```json
{
  "error": "Personal number, category code, and center ID are required"
}
```

### 500 Internal Server Error

**API failure:**
```json
{
  "error": "Failed to check exam availability",
  "message": "Network error"
}
```

**Rate limited:**
```json
{
  "error": "Failed to fetch categories",
  "message": "RATE_LIMITED"
}
```

---

## 📊 Monitoring Examples

### Watch Logs (Production)

```bash
# Render
render logs -t qalaqichecker-backend

# Or via web dashboard
```

### Monitor Cron Job

Look for these log patterns:
```
🕐 Starting scheduler: checking every 15 minutes
🔍 Checking 3 user(s) for exam availability...
Checking user: 01234567890 (B კატეგორია ავტომატიკა)
❌ No exam available for 01234567890
✅ Check complete
```

### Check Database

```bash
# Local
cat backend/db.json | jq

# Production (Render)
render ssh qalaqichecker-backend
cat db.json
```

---

## 🎯 Common Use Cases

### 1. User Checks Exam Once

```bash
# Get categories → Select → Get centers → Select → Check
```

### 2. User Subscribes for Monitoring

```bash
# Same as above + Subscribe with email/telegram
# Background job checks every 15 min
# User gets notified when available
```

### 3. Admin Views All Subscribers

```bash
curl $API_URL/api/exam/subscribers | jq
```

### 4. User Unsubscribes

```bash
# Get user ID from subscribers list
curl -X DELETE "$API_URL/api/exam/unsubscribe/USER_ID"
```

---

**Happy testing! 🎉**
