#!/bin/bash

# =====================================================
# UserUtility Bot - Production Launcher
# Runs the compiled JavaScript bot from dist folder
# =====================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display script header
echo "============================================"
echo "UserUtility Bot - Production Mode"
echo "============================================"
echo

# Check if Node.js is installed and accessible
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed or not in PATH.${NC}"
    echo "Please install Node.js and ensure it's added to your system PATH."
    exit 1
fi

# Check if dist folder and bot.js exist
if [ ! -f "dist/bot.js" ]; then
    echo -e "${RED}[ERROR] Built files not found in dist/ directory${NC}"
    echo "Please run ./build.sh first to compile the TypeScript code."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}[ERROR] .env file not found.${NC}"
    echo "Please create a .env file with your bot configuration."
    echo "You can copy .env.example to .env and modify it."
    exit 1
fi

# Run the compiled bot
node dist/bot.js
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
    echo -e "${GREEN}[SUCCESS] Bot stopped normally.${NC}"
    echo "============================================="
fi

echo
echo "Press Enter to exit..."
read