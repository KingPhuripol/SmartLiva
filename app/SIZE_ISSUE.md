# ⚠️ ปัญหา: โปรเจ็กต์ขนาด 48GB

## 🔍 สาเหตุ

โปรเจ็กต์ของคุณมีไฟล์ขนาดใหญ่:

- **medgemma_model.pth** - 16GB (AI model)
- **data/** - 15GB (training images)  
- **maxvit_large_best.pth** - 805MB (AI model)
- **frontend/node_modules** - 778MB (reinstall ได้)

**รวม: ~48GB** → ต้องลดให้เหลือ ~100MB เพื่อ deploy!

---

## ✅ วิธีแก้ (เร็วที่สุด)

### 1. Backup models ก่อน (สำคัญ!)

```bash
mkdir -p ~/Backup/SmartLiva-Models
cp medgemma_model.pth ~/Backup/SmartLiva-Models/
cp maxvit_large_best.pth ~/Backup/SmartLiva-Models/
```

### 2. ทำความสะอาด

```bash
./cleanup-large-files.sh
```

สคริปต์นี้จะลบ:
- ✓ Model files (.pth)
- ✓ Training data (data/)
- ✓ node_modules (ติดตั้งใหม่ได้)
- ✓ Build outputs (.next)
- ✓ Cache files

**ผลลัพธ์: 48GB → ~100MB** ✅

### 3. Upload models ไป Hugging Face (ฟรี)

```bash
pip install huggingface_hub
huggingface-cli login
huggingface-cli repo create smartliva-models --type model
huggingface-cli upload kingphuripol/smartliva-models ~/Backup/SmartLiva-Models/
```

### 4. Deploy!

```bash
git add .
git commit -m "Remove large files, ready for deployment"
git push origin main
vercel --prod
```

---

## 📖 เอกสารเพิ่มเติม

- **MODEL_FILES_GUIDE.md** - คู่มือครบถ้วนการจัดการ model files
- **cleanup-large-files.sh** - สคริปต์ทำความสะอาดอัตโนมัติ
- **.vercelignore** - อัปเดตแล้วให้ครอบคลุม

---

## 🎯 สรุป

**ปัญหา:** 48GB → ใหญ่เกินไปสำหรับ deploy
**แก้ไข:** ลบ models และ data → upload ไป cloud
**ผลลัพธ์:** ~100MB → deploy ได้แล้ว! ✅

**เริ่มต้น:** `./cleanup-large-files.sh`

---

**อ่านเพิ่มเติม:** `cat MODEL_FILES_GUIDE.md`
