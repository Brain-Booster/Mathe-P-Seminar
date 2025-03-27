#!/bin/bash

echo "=== Building Effner Mathe P-Seminar Website ==="
echo ""

# Make this script executable
chmod +x "$0"

# Install dependencies
echo "Installing dependencies..."
npm install
echo ""

# Build the project
echo "Building optimized production build..."
npm run build
echo ""

# Check if we're on a Raspberry Pi
if grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
  echo "Raspberry Pi detected! Using optimized settings..."
  DEPLOY_ENV="--env rpi"
else
  DEPLOY_ENV="--env production"
fi

# Start or restart with PM2 if available
if command -v pm2 &> /dev/null; then
  echo "Starting application with PM2..."
  pm2 startOrRestart ecosystem.config.js $DEPLOY_ENV
else
  echo "PM2 not found. Starting with regular npm start..."
  echo "You can install PM2 globally with: npm install -g pm2"
  echo ""
  npm run start &
fi

echo ""
echo "=== Deployment Complete ==="
echo "The application is now running on http://localhost:3001" 