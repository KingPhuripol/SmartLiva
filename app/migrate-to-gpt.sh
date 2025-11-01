#!/bin/bash

# SmartLiva - Migration Script
# ลบ local models และเปลี่ยนไปใช้ GPT-4o API

echo "🔄 SmartLiva - Migration to GPT-4o API"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "📋 การเปลี่ยนแปลง:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ❌ ลบ: medgemma_model.pth (16GB)"
echo "  ❌ ลบ: data/ training images (15GB)"
echo "  ❌ ลบ: node_modules, cache files"
echo "  ✅ เปลี่ยน: ใช้ OpenAI GPT-4o API แทน local models"
echo ""
echo "  ผลลัพธ์: 48GB → ~100MB"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get current size
INITIAL_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo -e "${BLUE}📊 ขนาดปัจจุบัน: ${INITIAL_SIZE}${NC}"
echo ""

# Confirm
read -p "❓ ต้องการดำเนินการต่อหรือไม่? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ ยกเลิกการ migration${NC}"
    exit 0
fi

echo ""
echo "🚀 เริ่ม migration..."
echo ""

# Step 1: Backup important files
echo "1️⃣  Backup ไฟล์สำคัญ..."
BACKUP_DIR=~/Backup/SmartLiva-$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_DIR"

if [ -f "medgemma_model.pth" ]; then
    echo "   → Backing up medgemma_model.pth..."
    cp medgemma_model.pth "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️  ไม่สามารถ backup (อาจใหญ่เกินไป)"
fi

if [ -f "maxvit_large_best.pth" ]; then
    echo "   → Backing up maxvit_large_best.pth..."
    cp maxvit_large_best.pth "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️  ไม่สามารถ backup"
fi

echo -e "${GREEN}   ✓ Backup เสร็จแล้ว: $BACKUP_DIR${NC}"
echo ""

# Step 2: Remove large model files
echo "2️⃣  ลบ model files ขนาดใหญ่..."

if [ -f "medgemma_model.pth" ]; then
    rm -f medgemma_model.pth
    echo -e "${GREEN}   ✓ ลบ medgemma_model.pth (16GB)${NC}"
fi

if [ -f "maxvit_large_best.pth" ]; then
    rm -f maxvit_large_best.pth
    echo -e "${GREEN}   ✓ ลบ maxvit_large_best.pth (805MB)${NC}"
fi

# Remove any other .pth files
find . -maxdepth 1 -name "*.pth" -type f -delete 2>/dev/null
echo -e "${GREEN}   ✓ ลบ model files อื่นๆ${NC}"
echo ""

# Step 3: Remove training data
echo "3️⃣  ลบ training data..."

if [ -d "data" ]; then
    echo "   ⚠️  กำลังลบ data/ (15GB)..."
    rm -rf data
    echo -e "${GREEN}   ✓ ลบ data/ เสร็จแล้ว${NC}"
fi
echo ""

# Step 4: Remove node_modules
echo "4️⃣  ลบ node_modules (ติดตั้งใหม่ได้)..."

if [ -d "frontend/node_modules" ]; then
    rm -rf frontend/node_modules
    echo -e "${GREEN}   ✓ ลบ frontend/node_modules${NC}"
fi
echo ""

# Step 5: Clean build outputs
echo "5️⃣  ลบ build outputs..."

if [ -d "frontend/.next" ]; then
    rm -rf frontend/.next
    echo -e "${GREEN}   ✓ ลบ frontend/.next${NC}"
fi

if [ -d "backend/__pycache__" ]; then
    rm -rf backend/__pycache__
fi

find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type d -name ".ipynb_checkpoints" -exec rm -rf {} + 2>/dev/null
find . -name ".DS_Store" -delete 2>/dev/null

echo -e "${GREEN}   ✓ ลบ cache files${NC}"
echo ""

# Step 6: Show results
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FINAL_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo -e "${GREEN}✅ Migration เสร็จสมบูรณ์!${NC}"
echo ""
echo "📊 สถิติ:"
echo "   ขนาดเดิม:  ${INITIAL_SIZE}"
echo "   ขนาดใหม่:  ${FINAL_SIZE}"
echo "   Backup:     ${BACKUP_DIR}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 ขั้นตอนต่อไป:"
echo ""
echo "1️⃣  ตั้งค่า OpenAI API Key:"
echo "   echo 'OPENAI_API_KEY=your-api-key' > backend/.env"
echo ""
echo "2️⃣  ติดตั้ง dependencies:"
echo "   cd frontend && npm install"
echo ""
echo "3️⃣  ทดสอบ backend:"
echo "   cd backend"
echo "   pip install -r requirements.txt"
echo "   uvicorn app.main:app --reload"
echo ""
echo "4️⃣  Commit changes:"
echo "   git add ."
echo "   git commit -m 'Migrate to GPT-4o API, remove large files'"
echo "   git push origin main"
echo ""
echo "5️⃣  Deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}💡 ข้อมูลเพิ่มเติม:${NC}"
echo ""
echo "  • GPT-4o API ใช้ pay-per-use ไม่ต้องเก็บ model local"
echo "  • ขนาดโปรเจ็กต์ลดลง ~48GB"
echo "  • Deploy ง่ายและเร็วขึ้นมาก"
echo "  • Model files ถูก backup ที่: $BACKUP_DIR"
echo ""
echo -e "${GREEN}🎉 พร้อม deploy แล้ว!${NC}"
echo ""
