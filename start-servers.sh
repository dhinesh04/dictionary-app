#!/bin/bash

echo "🚀 Starting Dictionary App Servers..."

# Kill any existing processes
echo "🔄 Cleaning up existing processes..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait a moment
sleep 2

echo "📚 Starting Backend Server (Port 5000)..."
cd /workspaces/dictionary-app/backend
node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

echo "🎨 Starting Frontend Server (Port 5173)..."
cd /workspaces/dictionary-app/frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting!"
echo "📚 Backend: http://localhost:5000"
echo "🎨 Frontend: http://localhost:5173"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop servers, run: pkill -f 'node.*server.js' && pkill -f 'vite'"
echo ""

# Keep the script running
wait
