# 🚀 SmartLiva - คู่มือเริ่มต้น Deploy บน Vercel

## 🎯 วิธีที่เร็วที่สุด (3 ขั้นตอน)

### 1️⃣ ไปที่ Vercel

เปิดเว็บ [vercel.com](https://vercel.com) และ login ด้วย GitHub

### 2️⃣ Import Project

- คลิก "Add New Project"
- เลือก repository: **SmartLiva**
- ตั้งค่า Root Directory: **`frontend`**
- เพิ่ม Environment Variable:
  ```
  NEXT_PUBLIC_API_BASE = https://smartliva-backend.vercel.app
  ```

### 3️⃣ Deploy!

คลิก "Deploy" และรอ 2-3 นาที → เสร็จ! 🎉

---

## 📖 เอกสารทั้งหมดที่เราเตรียมไว้

| ไฟล์                        | ใช้สำหรับ                                   |
| --------------------------- | ------------------------------------------- |
| **DEPLOY.md**               | คำแนะนำแบบย่อ ใช้เวลา 5 นาที                |
| **README.deployment.md**    | คู่มือเต็มรูปแบบพร้อมคำอธิบายทุกขั้นตอน     |
| **VERCEL_CONFIG.md**        | รายละเอียด configuration และ settings       |
| **BACKEND_DEPLOYMENT.md**   | วิธี deploy backend บน Railway/Render/Cloud |
| **DEPLOYMENT_CHECKLIST.md** | Checklist ครบทุกขั้นตอน ✅                  |

---

## 🛠️ สคริปต์ที่สร้างไว้ให้

### ตรวจสอบว่าพร้อม deploy หรือยัง:

```bash
./check-deployment.sh
```

### Deploy ด้วย CLI:

```bash
./deploy-vercel.sh
```

---

## 📁 ไฟล์สำคัญที่เราสร้าง/แก้ไข

### Frontend

- ✅ `frontend/next.config.js` - ปรับแต่งสำหรับ production
- ✅ `frontend/package.json` - เพิ่ม scripts และ engines

### Configuration

- ✅ `vercel.json` - ตั้งค่า Vercel deployment
- ✅ `.vercelignore` - ไฟล์ที่ไม่ต้อง upload
- ✅ `.env.production` - Environment variables
- ✅ `package.json` (root) - สำหรับ monorepo setup

### Documentation

- ✅ `DEPLOY.md` - Quick start guide
- ✅ `README.deployment.md` - Full deployment guide
- ✅ `VERCEL_CONFIG.md` - Vercel configuration details
- ✅ `BACKEND_DEPLOYMENT.md` - Backend deployment guide
- ✅ `DEPLOYMENT_CHECKLIST.md` - Complete checklist

### Scripts

- ✅ `check-deployment.sh` - Pre-deployment checker
- ✅ `deploy-vercel.sh` - Quick deploy script
- ✅ `build.sh` - Build script

### CI/CD

- ✅ `.github/workflows/deploy.yml` - Auto-deploy on push
- ✅ `.github/workflows/ci.yml` - Build checks

---

## ⚡ Quick Commands

```bash
# ตรวจสอบว่าพร้อม deploy
./check-deployment.sh

# Deploy ด้วย CLI (แบบง่าย)
./deploy-vercel.sh

# หรือใช้ Vercel CLI โดยตรง
npm install -g vercel    # ติดตั้งครั้งเดียว
vercel login             # login ครั้งเดียว
vercel --prod            # deploy ทุกครั้ง

# Build และทดสอบใน local ก่อน
cd frontend
npm install
npm run build
npm start                # test production build
```

---

## 🎯 สิ่งที่ต้องทำต่อไป

### 1. Frontend (ใช้ Vercel - ฟรี)

- [x] ตั้งค่าไฟล์เสร็จแล้ว ✅
- [ ] Push code ขึ้น GitHub
- [ ] Deploy บน Vercel (ตามขั้นตอนข้างบน)

### 2. Backend (ต้อง deploy แยก)

- [ ] เลือก platform: **Railway** (แนะนำ), Render, หรือ Google Cloud
- [ ] ดูวิธีใน [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md)
- [ ] Deploy backend
- [ ] Copy backend URL
- [ ] อัปเดต `NEXT_PUBLIC_API_BASE` ใน Vercel

### 3. Database (ถ้าต้องการ)

- [ ] สร้าง database บน Supabase/PlanetScale/Neon (ฟรี)
- [ ] อัปเดต `DATABASE_URL` ใน backend

---

## 💡 Tips สำคัญ

### ✅ ควรทำ:

- Push code ขึ้น GitHub ก่อน deploy
- ตั้งค่า Environment Variables ให้ถูกต้อง
- ทดสอบ build ใน local ก่อน: `npm run build`
- Deploy backend ก่อน frontend (ถ้ามี API)

### ❌ ไม่ควรทำ:

- Upload ไฟล์ `.pth` (model files) ขนาดใหญ่
- เก็บ secrets ใน code
- ลืมตั้งค่า Root Directory = `frontend`
- Deploy โดยไม่ทดสอบใน local

---

## 🆘 ต้องการความช่วยเหลือ?

### เจอปัญหา?

1. อ่าน [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
2. ดู Troubleshooting section ใน [README.deployment.md](./README.deployment.md)
3. เช็ค Build logs ใน Vercel Dashboard
4. ลองรัน `./check-deployment.sh` เพื่อหา issues

### Resources:

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs/deployment
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs

---

## 🎉 ผลลัพธ์ที่คาดหวัง

เมื่อ deploy สำเร็จแล้ว คุณจะได้:

- ✅ URL สาธารณะ: `https://smartliva.vercel.app`
- ✅ HTTPS enabled อัตโนมัติ
- ✅ Auto-deploy เมื่อ push code ใหม่
- ✅ Free SSL certificate
- ✅ Global CDN
- ✅ Analytics dashboard

---

## 📊 เปรียบเทียบ Deployment Options

| Platform         | Cost         | Setup          | Best For            |
| ---------------- | ------------ | -------------- | ------------------- |
| **Vercel**       | Free         | ⭐ ง่ายมาก     | Frontend (Next.js)  |
| **Railway**      | Free tier    | ⭐⭐ ง่าย      | Backend (FastAPI)   |
| **Render**       | Free 750hrs  | ⭐⭐ ง่าย      | Backend + Database  |
| **Google Cloud** | $300 credits | ⭐⭐⭐ ปานกลาง | Scalable production |

---

## 🚀 พร้อมที่จะเริ่มต้น?

```bash
# 1. ตรวจสอบว่าพร้อมหรือยัง
./check-deployment.sh

# 2. Commit code
git add .
git commit -m "Ready for Vercel deployment"
git push origin main

# 3. Deploy!
# ไปที่ vercel.com และ import project
# หรือ
./deploy-vercel.sh
```

---

**Good luck! 🍀 เว็บของคุณจะออนไลน์ในไม่กี่นาที! 🎊**

มีคำถาม? อ่านเอกสารประกอบเพิ่มเติมใน repository นี้ครับ 📚
