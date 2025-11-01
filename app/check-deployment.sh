#!/bin/bash

# SmartLiva Pre-deployment Checker
# ตรวจสอบว่าโปรเจ็กต์พร้อม deploy หรือยัง

echo "🔍 SmartLiva Pre-deployment Checker"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Check functions
check_passed() {
    echo -e "${GREEN}✅ PASSED${NC}: $1"
    ((PASSED++))
}

check_failed() {
    echo -e "${RED}❌ FAILED${NC}: $1"
    ((FAILED++))
}

check_warning() {
    echo -e "${YELLOW}⚠️  WARNING${NC}: $1"
    ((WARNINGS++))
}

echo "📦 Checking Frontend..."
echo ""

# Check if frontend directory exists
if [ -d "frontend" ]; then
    check_passed "Frontend directory exists"
else
    check_failed "Frontend directory not found"
    exit 1
fi

# Check package.json
if [ -f "frontend/package.json" ]; then
    check_passed "package.json found"
else
    check_failed "package.json not found"
fi

# Check next.config.js
if [ -f "frontend/next.config.js" ]; then
    check_passed "next.config.js found"
else
    check_failed "next.config.js not found"
fi

# Check if node_modules exists
if [ -d "frontend/node_modules" ]; then
    check_passed "node_modules installed"
else
    check_warning "node_modules not found - run 'cd frontend && npm install'"
fi

# Try to build frontend
echo ""
echo "🔨 Testing frontend build..."
cd frontend
if npm run build > /dev/null 2>&1; then
    check_passed "Frontend builds successfully"
else
    check_failed "Frontend build failed - check 'npm run build' output"
fi
cd ..

echo ""
echo "🗂️  Checking Configuration Files..."
echo ""

# Check vercel.json
if [ -f "vercel.json" ]; then
    check_passed "vercel.json exists"
else
    check_failed "vercel.json not found"
fi

# Check .vercelignore
if [ -f ".vercelignore" ]; then
    check_passed ".vercelignore exists"
else
    check_warning ".vercelignore not found - large files may be uploaded"
fi

# Check for large model files
if [ -f "maxvit_large_best.pth" ] || [ -f "medgemma_model.pth" ]; then
    check_warning "Large model files detected - these should not be deployed to Vercel"
fi

# Check .env.example
if [ -f ".env.example" ]; then
    check_passed ".env.example exists"
else
    check_warning ".env.example not found"
fi

echo ""
echo "🔐 Checking Environment Variables..."
echo ""

# Check if .env.production exists
if [ -f ".env.production" ]; then
    check_passed ".env.production exists"
    
    # Check for required variables
    if grep -q "NEXT_PUBLIC_API_BASE" .env.production; then
        check_passed "NEXT_PUBLIC_API_BASE defined"
    else
        check_failed "NEXT_PUBLIC_API_BASE not found in .env.production"
    fi
else
    check_warning ".env.production not found"
fi

echo ""
echo "📚 Checking Documentation..."
echo ""

# Check deployment docs
if [ -f "DEPLOY.md" ]; then
    check_passed "DEPLOY.md exists"
else
    check_warning "DEPLOY.md not found"
fi

if [ -f "README.deployment.md" ]; then
    check_passed "README.deployment.md exists"
else
    check_warning "README.deployment.md not found"
fi

if [ -f "VERCEL_CONFIG.md" ]; then
    check_passed "VERCEL_CONFIG.md exists"
else
    check_warning "VERCEL_CONFIG.md not found"
fi

echo ""
echo "🐙 Checking Git Status..."
echo ""

# Check if git is initialized
if [ -d ".git" ]; then
    check_passed "Git repository initialized"
    
    # Check for uncommitted changes
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        check_passed "No uncommitted changes"
    else
        check_warning "You have uncommitted changes"
    fi
    
    # Check remote
    if git remote -v | grep -q "origin"; then
        check_passed "Git remote configured"
    else
        check_warning "No git remote configured"
    fi
else
    check_failed "Not a git repository"
fi

echo ""
echo "🎯 Checking Backend..."
echo ""

# Check backend directory
if [ -d "backend" ]; then
    check_passed "Backend directory exists"
    
    if [ -f "backend/requirements.txt" ]; then
        check_passed "requirements.txt found"
    else
        check_failed "requirements.txt not found"
    fi
    
    if [ -f "backend/Dockerfile" ]; then
        check_passed "Dockerfile found"
    else
        check_warning "Dockerfile not found"
    fi
else
    check_warning "Backend directory not found"
fi

echo ""
echo "======================================"
echo "📊 Summary"
echo "======================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Your project is ready for deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: git add . && git commit -m 'Ready for deployment'"
    echo "2. Run: git push origin main"
    echo "3. Deploy on Vercel: vercel --prod"
    echo ""
    echo "Or visit: https://vercel.com and import your repository"
    exit 0
else
    echo -e "${RED}⚠️  Please fix the failed checks before deploying${NC}"
    exit 1
fi
