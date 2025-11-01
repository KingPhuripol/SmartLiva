#!/bin/bash

# SmartLiva - Cleanup Large Files Script
# ลบไฟล์ขนาดใหญ่ที่ไม่จำเป็นสำหรับ deployment

echo "🧹 SmartLiva - Cleanup Large Files"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current directory size
echo "📊 ตรวจสอบขนาดโปรเจ็กต์..."
INITIAL_SIZE=$(du -sh . | cut -f1)
echo -e "${BLUE}ขนาดปัจจุบัน: ${INITIAL_SIZE}${NC}"
echo ""

# Show what will be cleaned
echo "🔍 ไฟล์/โฟลเดอร์ที่จะทำความสะอาด:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Model files
if [ -f "medgemma_model.pth" ]; then
    SIZE=$(du -sh medgemma_model.pth | cut -f1)
    echo -e "  📦 medgemma_model.pth (${SIZE})"
fi

if [ -f "maxvit_large_best.pth" ]; then
    SIZE=$(du -sh maxvit_large_best.pth | cut -f1)
    echo -e "  📦 maxvit_large_best.pth (${SIZE})"
fi

# Data directory
if [ -d "data" ]; then
    SIZE=$(du -sh data | cut -f1)
    echo -e "  📁 data/ (${SIZE})"
fi

# Frontend node_modules (can be reinstalled)
if [ -d "frontend/node_modules" ]; then
    SIZE=$(du -sh frontend/node_modules | cut -f1)
    echo -e "  📁 frontend/node_modules/ (${SIZE})"
fi

# .next build
if [ -d "frontend/.next" ]; then
    SIZE=$(du -sh frontend/.next | cut -f1)
    echo -e "  📁 frontend/.next/ (${SIZE})"
fi

# Backend venv (can be reinstalled)
if [ -d "backend/venv" ]; then
    SIZE=$(du -sh backend/venv | cut -f1)
    echo -e "  📁 backend/venv/ (${SIZE})"
fi

# Python cache
if [ -d "backend/__pycache__" ]; then
    echo -e "  📁 backend/__pycache__/"
fi

# Jupyter checkpoints
if [ -d ".ipynb_checkpoints" ]; then
    echo -e "  📁 .ipynb_checkpoints/"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask for confirmation
read -p "❓ ต้องการลบไฟล์เหล่านี้หรือไม่? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ ยกเลิกการทำความสะอาด${NC}"
    exit 0
fi

echo ""
echo "🧹 กำลังทำความสะอาด..."
echo ""

CLEANED=0

# Remove model files
if [ -f "medgemma_model.pth" ]; then
    rm -f medgemma_model.pth
    echo -e "${GREEN}✓${NC} ลบ medgemma_model.pth แล้ว"
    ((CLEANED++))
fi

if [ -f "maxvit_large_best.pth" ]; then
    rm -f maxvit_large_best.pth
    echo -e "${GREEN}✓${NC} ลบ maxvit_large_best.pth แล้ว"
    ((CLEANED++))
fi

# Remove data directory (WARNING: This deletes training data!)
if [ -d "data" ]; then
    echo -e "${YELLOW}⚠️  กำลังลบ data/ (training data)...${NC}"
    rm -rf data
    echo -e "${GREEN}✓${NC} ลบ data/ แล้ว"
    ((CLEANED++))
fi

# Remove node_modules (can be reinstalled with npm install)
if [ -d "frontend/node_modules" ]; then
    rm -rf frontend/node_modules
    echo -e "${GREEN}✓${NC} ลบ frontend/node_modules/ แล้ว"
    ((CLEANED++))
fi

# Remove .next build
if [ -d "frontend/.next" ]; then
    rm -rf frontend/.next
    echo -e "${GREEN}✓${NC} ลบ frontend/.next/ แล้ว"
    ((CLEANED++))
fi

# Remove backend venv
if [ -d "backend/venv" ]; then
    rm -rf backend/venv
    echo -e "${GREEN}✓${NC} ลบ backend/venv/ แล้ว"
    ((CLEANED++))
fi

# Remove Python cache
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
echo -e "${GREEN}✓${NC} ลบ Python cache แล้ว"

# Remove Jupyter checkpoints
find . -type d -name ".ipynb_checkpoints" -exec rm -rf {} + 2>/dev/null
echo -e "${GREEN}✓${NC} ลบ Jupyter checkpoints แล้ว"

# Remove .DS_Store files
find . -name ".DS_Store" -delete 2>/dev/null
echo -e "${GREEN}✓${NC} ลบ .DS_Store files แล้ว"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show final size
FINAL_SIZE=$(du -sh . | cut -f1)
echo -e "${GREEN}✅ ทำความสะอาดเสร็จแล้ว!${NC}"
echo ""
echo "📊 สถิติ:"
echo "  ขนาดเดิม: ${INITIAL_SIZE}"
echo "  ขนาดใหม่: ${FINAL_SIZE}"
echo "  ไฟล์ที่ลบ: ${CLEANED} รายการ"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 หมายเหตุสำคัญ:"
echo ""
echo "  1. Model files (.pth) ถูกลบแล้ว"
echo "     → ควรเก็บไว้ใน S3/Hugging Face/Cloud Storage"
echo ""
echo "  2. Training data ถูกลบแล้ว"
echo "     → ควร backup ไว้ที่อื่นถ้าจำเป็น"
echo ""
echo "  3. node_modules ถูกลบแล้ว"
echo "     → รัน: cd frontend && npm install เพื่อติดตั้งใหม่"
echo ""
echo "  4. ไฟล์เหล่านี้อยู่ใน .gitignore แล้ว"
echo "     → จะไม่ถูก commit ใน Git"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}💡 ขั้นตอนต่อไป:${NC}"
echo ""
echo "  1. Upload model files ไป Cloud Storage:"
echo "     - AWS S3"
echo "     - Hugging Face Hub"
echo "     - Google Cloud Storage"
echo ""
echo "  2. แก้โค้ดให้ download models จาก cloud:"
echo "     → ดูตัวอย่างใน BACKEND_DEPLOYMENT.md"
echo ""
echo "  3. ติดตั้ง dependencies ใหม่:"
echo "     cd frontend && npm install"
echo ""
echo "  4. Commit และ push:"
echo "     git add ."
echo "     git commit -m 'Remove large files, ready for deployment'"
echo "     git push"
echo ""
echo -e "${GREEN}🎉 พร้อม deploy แล้ว!${NC}"
echo ""
