#!/bin/bash
# PositiveSpace - Setup Script
# Run this script to set up the development environment

set -e

echo "======================================"
echo "  PositiveSpace Development Setup"
echo "======================================"
echo ""

# Check prerequisites
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "Checking prerequisites..."

if ! command_exists node; then
    echo "Error: Node.js is not installed"
    echo "Install from: https://nodejs.org/"
    exit 1
fi

if ! command_exists python3; then
    echo "Error: Python 3 is not installed"
    echo "Install from: https://www.python.org/"
    exit 1
fi

if ! command_exists git; then
    echo "Error: Git is not installed"
    echo "Install from: https://git-scm.com/"
    exit 1
fi

echo "✓ All prerequisites installed"
echo ""

# Clone/setup repository
echo "Setting up repository..."

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd apps/web
npm install
cd ../..

# Install backend dependencies
echo "Installing backend dependencies..."
cd apps/api
pip install -r requirements.txt
cd ../..

# Copy environment files
echo "Setting up environment files..."
if [ ! -f apps/web/.env ]; then
    cp apps/web/.env.example apps/web/.env
    echo "Created apps/web/.env"
fi

if [ ! -f apps/api/.env ]; then
    cat > apps/api/.env << EOF
# Development Environment
APP_ENV=development
DEBUG=true

# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/positivespace

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# Security
SECRET_KEY=dev-secret-key-change-in-production
EOF
    echo "Created apps/api/.env"
fi

echo ""
echo "======================================"
echo "  Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start Docker services:"
echo "   docker-compose up -d postgres redis"
echo ""
echo "2. Initialize database:"
echo "   cd apps/api && alembic upgrade head"
echo ""
echo "3. Start development servers:"
echo "   - Frontend: cd apps/web && npm run dev"
echo "   - Backend:  cd apps/api && uvicorn app.main:app --reload"
echo ""
echo "Or use Docker Compose to run everything:"
echo "   docker-compose up"
echo ""
