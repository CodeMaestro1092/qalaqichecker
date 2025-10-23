#!/bin/bash

# QalaqiChecker - Initial Setup Script
# Automates the initial setup process

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   QalaqiChecker - Setup Wizard        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Check Node.js version
echo -e "${GREEN}Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${YELLOW}⚠️  Warning: Node.js 18+ recommended. You have $(node -v)${NC}"
else
  echo -e "✅ Node.js version: $(node -v)\n"
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
echo -e "This may take a few minutes...\n"

# Root dependencies
echo -e "📦 Installing root dependencies..."
npm install

# Backend dependencies
echo -e "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Frontend dependencies
echo -e "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo -e "\n✅ All dependencies installed!\n"

# Configure environment variables
echo -e "${GREEN}Configuring environment variables...${NC}\n"

# Backend .env
if [ ! -f backend/.env ]; then
  echo -e "📝 Creating backend/.env..."
  cat > backend/.env << EOF
PORT=3001
NODE_ENV=development

# Resend Email API (get from https://resend.com)
RESEND_API_KEY=
FROM_EMAIL=onboarding@resend.dev

# Telegram Bot (optional, get from @BotFather)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Rate limiting
CHECK_INTERVAL_MINUTES=15
API_DELAY_MS=5000
EOF
  echo -e "✅ Created backend/.env"
else
  echo -e "✅ backend/.env already exists"
fi

# Frontend .env.local
if [ ! -f frontend/.env.local ]; then
  echo -e "📝 Creating frontend/.env.local..."
  echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > frontend/.env.local
  echo -e "✅ Created frontend/.env.local"
else
  echo -e "✅ frontend/.env.local already exists"
fi

echo ""

# Prompt for Resend API key (optional)
echo -e "${YELLOW}Would you like to configure email notifications now? (y/n)${NC}"
read -r CONFIGURE_EMAIL

if [ "$CONFIGURE_EMAIL" = "y" ]; then
  echo -e "\n${BLUE}To get a Resend API key:${NC}"
  echo -e "1. Visit https://resend.com"
  echo -e "2. Sign up (free tier: 3,000 emails/month)"
  echo -e "3. Create an API key"
  echo -e ""
  echo -e "Enter your Resend API key (or press Enter to skip):"
  read -r RESEND_KEY

  if [ -n "$RESEND_KEY" ]; then
    # Update .env with key
    sed -i "s/RESEND_API_KEY=.*/RESEND_API_KEY=$RESEND_KEY/" backend/.env
    echo -e "✅ Resend API key configured!"
  fi
fi

# Prompt for Telegram (optional)
echo -e "\n${YELLOW}Would you like to configure Telegram notifications now? (y/n)${NC}"
read -r CONFIGURE_TELEGRAM

if [ "$CONFIGURE_TELEGRAM" = "y" ]; then
  echo -e "\n${BLUE}To create a Telegram bot:${NC}"
  echo -e "1. Open Telegram and search for @BotFather"
  echo -e "2. Send /newbot and follow instructions"
  echo -e "3. Copy the bot token"
  echo -e ""
  echo -e "Enter your Telegram bot token (or press Enter to skip):"
  read -r TELEGRAM_TOKEN

  if [ -n "$TELEGRAM_TOKEN" ]; then
    sed -i "s/TELEGRAM_BOT_TOKEN=.*/TELEGRAM_BOT_TOKEN=$TELEGRAM_TOKEN/" backend/.env
    echo -e "✅ Telegram bot token configured!"
  fi
fi

# Create scripts executable
echo -e "\n${GREEN}Making scripts executable...${NC}"
chmod +x scripts/*.sh
echo -e "✅ Scripts are now executable\n"

# Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ✅ Setup Complete!                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Next steps:${NC}\n"
echo -e "1. Start the development servers:"
echo -e "   ${YELLOW}npm run dev${NC}\n"
echo -e "2. Visit the frontend:"
echo -e "   ${YELLOW}http://localhost:3000${NC}\n"
echo -e "3. Test the backend:"
echo -e "   ${YELLOW}curl http://localhost:3001/health${NC}\n"
echo -e "4. Run the test flow:"
echo -e "   ${YELLOW}./scripts/test-flow.sh${NC}\n"

echo -e "📚 Documentation:"
echo -e "   • Quick Start: QUICK_START.md"
echo -e "   • Full README: README.md"
echo -e "   • API Examples: API_EXAMPLES.md"
echo -e "   • Deployment: DEPLOYMENT.md\n"

echo -e "${GREEN}Happy coding! 🚀${NC}\n"
