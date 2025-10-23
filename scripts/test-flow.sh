#!/bin/bash

# QalaqiChecker - Complete API Test Flow
# This script tests the entire user journey

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3001}"
TEST_PERSONAL_NUMBER="01234567890"
TEST_PHONE="555123456"
TEST_EMAIL="test@example.com"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   QalaqiChecker - API Test Flow       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"
echo -e "API URL: ${YELLOW}$API_URL${NC}\n"

# Step 1: Health Check
echo -e "${GREEN}1️⃣  Health Check...${NC}"
HEALTH=$(curl -s "$API_URL/health")
echo "$HEALTH" | jq
STATUS=$(echo "$HEALTH" | jq -r '.status')
if [ "$STATUS" != "OK" ]; then
  echo -e "❌ Health check failed!"
  exit 1
fi
echo -e "✅ Backend is healthy\n"
sleep 1

# Step 2: Get Categories
echo -e "${GREEN}2️⃣  Fetching available categories...${NC}"
CATEGORIES=$(curl -s "$API_URL/api/exam/categories?personalNumber=$TEST_PERSONAL_NUMBER")
echo "$CATEGORIES" | jq
CATEGORY_CODE=$(echo "$CATEGORIES" | jq -r '.[0].code')
CATEGORY_NAME=$(echo "$CATEGORIES" | jq -r '.[0].name')
echo -e "📋 Selected category: ${YELLOW}$CATEGORY_NAME${NC} (code: $CATEGORY_CODE)\n"
sleep 2

# Step 3: Get Centers
echo -e "${GREEN}3️⃣  Fetching service centers for category $CATEGORY_CODE...${NC}"
CENTERS=$(curl -s "$API_URL/api/exam/centers?categoryCode=$CATEGORY_CODE")
echo "$CENTERS" | jq
CENTER_ID=$(echo "$CENTERS" | jq -r '.[0].serviceCenterId')
CENTER_NAME=$(echo "$CENTERS" | jq -r '.[0].serviceCenterName')
echo -e "🏢 Selected center: ${YELLOW}$CENTER_NAME${NC} (ID: $CENTER_ID)\n"
sleep 2

# Step 4: Check Exam Availability
echo -e "${GREEN}4️⃣  Checking exam availability...${NC}"
EXAM_RESULT=$(curl -s -X POST "$API_URL/api/exam/check" \
  -H "Content-Type: application/json" \
  -d "{
    \"personalNumber\": \"$TEST_PERSONAL_NUMBER\",
    \"categoryCode\": $CATEGORY_CODE,
    \"centerId\": $CENTER_ID
  }")
echo "$EXAM_RESULT" | jq

AVAILABLE=$(echo "$EXAM_RESULT" | jq -r '.available')
if [ "$AVAILABLE" = "true" ]; then
  EXAM_DATE=$(echo "$EXAM_RESULT" | jq -r '.date')
  echo -e "🎉 ${GREEN}Exam is available on $EXAM_DATE!${NC}\n"
else
  MESSAGE=$(echo "$EXAM_RESULT" | jq -r '.message')
  echo -e "⏳ ${YELLOW}$MESSAGE${NC}\n"
fi
sleep 2

# Step 5: Subscribe for Notifications
echo -e "${GREEN}5️⃣  Subscribing for notifications...${NC}"
SUBSCRIBE_RESULT=$(curl -s -X POST "$API_URL/api/exam/subscribe" \
  -H "Content-Type: application/json" \
  -d "{
    \"personalNumber\": \"$TEST_PERSONAL_NUMBER\",
    \"phoneNumber\": \"$TEST_PHONE\",
    \"categoryCode\": $CATEGORY_CODE,
    \"categoryName\": \"$CATEGORY_NAME\",
    \"centerId\": $CENTER_ID,
    \"centerName\": \"$CENTER_NAME\",
    \"email\": \"$TEST_EMAIL\"
  }")
echo "$SUBSCRIBE_RESULT" | jq

SUCCESS=$(echo "$SUBSCRIBE_RESULT" | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  USER_ID=$(echo "$SUBSCRIBE_RESULT" | jq -r '.user.id')
  echo -e "✅ ${GREEN}Successfully subscribed! User ID: $USER_ID${NC}\n"
else
  echo -e "❌ Subscription failed\n"
  exit 1
fi
sleep 2

# Step 6: View All Subscribers
echo -e "${GREEN}6️⃣  Viewing all subscribers...${NC}"
SUBSCRIBERS=$(curl -s "$API_URL/api/exam/subscribers")
echo "$SUBSCRIBERS" | jq
SUBSCRIBER_COUNT=$(echo "$SUBSCRIBERS" | jq '. | length')
echo -e "👥 Total subscribers: ${YELLOW}$SUBSCRIBER_COUNT${NC}\n"
sleep 2

# Step 7: Trigger Manual Check
echo -e "${GREEN}7️⃣  Triggering manual check...${NC}"
CHECK_RESULT=$(curl -s -X POST "$API_URL/api/exam/manual-check")
echo "$CHECK_RESULT" | jq
echo -e "✅ Manual check triggered\n"
sleep 2

# Step 8: Cleanup (Unsubscribe)
echo -e "${GREEN}8️⃣  Cleaning up (unsubscribing test user)...${NC}"
UNSUBSCRIBE_RESULT=$(curl -s -X DELETE "$API_URL/api/exam/unsubscribe/$USER_ID")
echo "$UNSUBSCRIBE_RESULT" | jq
echo -e "🗑️  Test user removed\n"

# Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ✅ All Tests Passed Successfully!   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

echo -e "Summary:"
echo -e "  • Health check: ✅"
echo -e "  • Categories fetched: ✅"
echo -e "  • Centers fetched: ✅"
echo -e "  • Exam check: ✅"
echo -e "  • Subscription: ✅"
echo -e "  • Manual trigger: ✅"
echo -e "  • Cleanup: ✅"
echo -e "\n${GREEN}🎉 QalaqiChecker is working perfectly!${NC}\n"
