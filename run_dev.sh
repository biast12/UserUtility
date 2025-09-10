#!/bin/bash

# =====================================================
# UserUtility Bot - Bot Launcher
# =====================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display script header
echo "============================================"
echo "UserUtility Bot - Bot Launcher"
echo "============================================"
echo

# Check if Node.js is installed and accessible
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed or not in PATH.${NC}"
    echo "Please install Node.js and ensure it's added to your system PATH."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[WARNING] No node_modules found.${NC}"
    echo "Please run ./setup_environment.sh first to install dependencies."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}[ERROR] .env file not found.${NC}"
    echo "Please create a .env file with your bot configuration."
    echo "You can copy .env.example to .env and modify it."
    exit 1
fi

# Check if TypeScript build exists
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}[WARNING] No dist folder found. Building TypeScript project...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Failed to build TypeScript project.${NC}"
        exit 1
    fi
fi

echo
echo "Launching bot..."
echo "============================================="
echo

# Run the bot
npm run start
EXIT_CODE=$?

# Check if bot crashed
if [ $EXIT_CODE -ne 0 ]; then
    echo
    echo "============================================="
    echo -e "${RED}[ERROR] Bot crashed with error code: $EXIT_CODE${NC}"
    echo "============================================="
else
    echo
    echo "============================================="
    echo -e "${GREEN}Bot stopped normally.${NC}"
    echo "============================================="
fi

echo
echo "Press Enter to exit..."
read