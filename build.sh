#!/bin/bash

# ============================================================================
# UserUtility Bot - TypeScript Build Script
# Compiles TypeScript source code to JavaScript
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Display script header
echo "============================================"
echo "UserUtility Bot - TypeScript Build"
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
    echo "Installing dependencies first..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Failed to install dependencies.${NC}"
        exit 1
    fi
    echo
fi

# Check if tsconfig.json exists
if [ ! -f "tsconfig.json" ]; then
    echo -e "${RED}[ERROR] tsconfig.json not found in current directory.${NC}"
    echo "Please ensure TypeScript is properly configured."
    exit 1
fi

# Clean existing build if it exists
if [ -d "dist" ]; then
    echo "[INFO] Cleaning existing build directory..."
    rm -rf dist
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Failed to remove existing dist/ directory${NC}"
        echo "Please check your file permissions."
        exit 1
    fi
    echo "[INFO] Previous build cleaned."
    echo
fi

# Build the TypeScript project
echo "[INFO] Building TypeScript project..."
npm run build

# Check build status
if [ $? -eq 0 ]; then
    echo
    echo "============================================"
    echo -e "${GREEN}[SUCCESS] Build completed successfully!${NC}"
    echo "============================================"
    echo "Output directory: $(pwd)/dist"
else
    echo
    echo "============================================"
    echo -e "${RED}[ERROR] Build failed with error code: $?${NC}"
    echo "============================================"
    echo "Please check the console output above for details."
fi

echo
echo "Press Enter to exit..."
read