#!/bin/bash
# Bizflow Setup Script

set -e

echo ""
echo "======================================"
echo "  BIZFLOW – Setup"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌  Node.js is not installed."
  echo "    Download from https://nodejs.org (v18+ recommended)"
  exit 1
fi

NODE_VER=$(node -v)
echo "✅  Node.js $NODE_VER found"

# Check npm
if ! command -v npm &> /dev/null; then
  echo "❌  npm not found."
  exit 1
fi

# Install dependencies
echo ""
echo "📦  Installing dependencies..."
cd backend
npm install
cd ..

echo ""
echo "======================================"
echo "  SETUP COMPLETE!"
echo "======================================"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Create the database:"
echo "   mysql -u root -p < backend/sql/schema.sql"
echo ""
echo "2. Edit backend/.env with your MySQL password:"
echo "   DB_PASSWORD=your_mysql_password"
echo ""
echo "3. Start the server:"
echo "   cd backend && node app.js"
echo ""
echo "4. Open in browser:"
echo "   http://localhost:3000/pages/login.html"
echo ""
echo "Default login: admin / admin123"
echo ""
