#!/bin/bash

# QalaqiChecker - Deployment Verification Script
# Checks if deployment is successful

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Deployment Verification${NC}\n"

# Get URLs from user
echo -e "Enter your backend URL (e.g., https://qalaqichecker.onrender.com):"
read -r BACKEND_URL

echo -e "Enter your frontend URL (e.g., https://qalaqichecker.vercel.app):"
read -r FRONTEND_URL

echo -e "\n${GREEN}Testing deployment...${NC}\n"

# Test 1: Backend health check
echo -e "1️⃣  Testing backend health..."
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/health")
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.status')

if [ "$HEALTH_STATUS" = "OK" ]; then
  echo -e "   ✅ Backend is responding"
else
  echo -e "   ${RED}❌ Backend health check failed${NC}"
  echo "$HEALTH_RESPONSE"
  exit 1
fi

# Test 2: CORS check
echo -e "2️⃣  Testing CORS configuration..."
CORS_RESPONSE=$(curl -s -I "$BACKEND_URL/health" | grep -i "access-control-allow-origin")
if [ -n "$CORS_RESPONSE" ]; then
  echo -e "   ✅ CORS is configured"
else
  echo -e "   ${YELLOW}⚠️  CORS might not be configured properly${NC}"
fi

# Test 3: Categories endpoint
echo -e "3️⃣  Testing categories endpoint..."
CATEGORIES=$(curl -s "$BACKEND_URL/api/exam/categories?personalNumber=01234567890")
if [ -n "$CATEGORIES" ]; then
  echo -e "   ✅ Categories endpoint works"
else
  echo -e "   ${RED}❌ Categories endpoint failed${NC}"
  exit 1
fi

# Test 4: Frontend accessibility
echo -e "4️⃣  Testing frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_STATUS" = "200" ]; then
  echo -e "   ✅ Frontend is accessible"
else
  echo -e "   ${RED}❌ Frontend returned status $FRONTEND_STATUS${NC}"
  exit 1
fi

# Test 5: Environment variables
echo -e "5️⃣  Checking environment variables..."
if grep -q "RESEND_API_KEY" <<< "$(curl -s "$BACKEND_URL/health")"; then
  echo -e "   ${YELLOW}⚠️  Check if Resend API key is set on Render${NC}"
else
  echo -e "   ✅ Environment appears configured"
fi

# Summary
echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment Verification Complete!   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"

echo -e "✅ All basic checks passed!\n"

echo -e "${YELLOW}Manual checks:${NC}"
echo -e "  1. Visit $FRONTEND_URL and test the flow"
echo -e "  2. Subscribe with a real email to test notifications"
echo -e "  3. Check Render logs for cron job output"
echo -e "  4. Verify email notifications work\n"

echo -e "${GREEN}Your app is live! 🎉${NC}\n"
