# SmartLiva - Vercel Deployment Guide

## 🚀 การ Deploy บน Vercel

### ขั้นตอนที่ 1: เตรียมโปรเจ็กต์

1. ตรวจสอบให้แน่ใจว่าโปรเจ็กต์อยู่ใน Git Repository (GitHub, GitLab, หรือ Bitbucket)
2. ตรวจสอบให้แน่ใจว่าไฟล์ทั้งหมดถูก commit แล้ว

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### ขั้นตอนที่ 2: เชื่อมต่อกับ Vercel

1. ไปที่ [vercel.com](https://vercel.com) และสร้างบัญชี (ใช้ GitHub account เพื่อความสะดวก)
2. คลิก **"Add New Project"**
3. เลือก repository **SmartLiva**
4. Vercel จะตรวจจับว่าเป็น Next.js project โดยอัตโนมัติ

### ขั้นตอนที่ 3: ตั้งค่า Project

#### Root Directory

ตั้งค่า Root Directory เป็น `frontend` เพราะโค้ด Next.js อยู่ในโฟลเดอร์นี้

#### Build Settings

Vercel จะตั้งค่าให้อัตโนมัติ:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` หรือ `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### Environment Variables

เพิ่ม Environment Variables ในหน้า Project Settings:

```
NEXT_PUBLIC_API_BASE=https://your-backend-api.vercel.app
```

**หมายเหตุ**: คุณต้อง deploy backend แยกต่างหากหรือใช้ API endpoint ที่มีอยู่แล้ว

### ขั้นตอนที่ 4: Deploy

1. คลิก **"Deploy"**
2. รอให้ Vercel build และ deploy (ประมาณ 2-5 นาที)
3. เมื่อเสร็จแล้วจะได้ URL เช่น `https://smartliva.vercel.app`

---

## 🔧 การ Deploy Backend (FastAPI)

เนื่องจาก backend ใช้ FastAPI และมี model files ที่มีขนาดใหญ่ การ deploy บน Vercel อาจมีข้อจำกัด แนะนำให้ใช้:

### ตัวเลือกที่ 1: Railway

1. ไปที่ [railway.app](https://railway.app)
2. เชื่อมต่อ GitHub repository
3. เลือกโฟลเดอร์ `backend`
4. Railway จะ detect Dockerfile และ deploy อัตโนมัติ

### ตัวเลือกที่ 2: Render

1. ไปที่ [render.com](https://render.com)
2. สร้าง **New Web Service**
3. เชื่อมต่อ repository และเลือก `backend` directory
4. ตั้งค่า:
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### ตัวเลือกที่ 3: Google Cloud Run หรือ AWS

สำหรับ production ที่ต้องการ scalability สูง

---

## 📝 Environment Variables ที่จำเป็น

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_BASE=https://your-backend-url.com
```

### Backend (Railway/Render)

```env
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-key
REDIS_URL=redis://...
```

---

## 🔍 การตั้งค่าเพิ่มเติม

### Custom Domain

1. ไปที่ Project Settings → Domains
2. เพิ่ม custom domain (เช่น smartliva.com)
3. อัปเดต DNS records ตามที่ Vercel แนะนำ

### Analytics

Vercel มี Analytics built-in ให้ใช้งานฟรี

### Monitoring

- ใช้ Vercel's built-in monitoring
- เพิ่ม Sentry สำหรับ error tracking

---

## 🚨 ข้อควรระวัง

1. **Model Files**: ไฟล์ `.pth` มีขนาดใหญ่ ไม่ควร deploy บน Vercel

   - แนะนำให้เก็บ model files ใน cloud storage (AWS S3, Google Cloud Storage)
   - โหลด model แบบ lazy loading

2. **Database**:

   - ใช้ managed database service (Supabase, PlanetScale, Neon)
   - อย่าใช้ local SQLite ใน production

3. **File Size Limits**:

   - Vercel มี limit 50MB per file
   - Total deployment size limit: 100MB (Pro plan)

4. **Serverless Functions**:
   - Timeout: 10 seconds (Hobby), 60 seconds (Pro)
   - Memory: 1024MB (Hobby), 3008MB (Pro)

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)

---

## ✅ Checklist ก่อน Deploy

- [ ] โค้ดทั้งหมดอยู่ใน Git repository
- [ ] ติดตั้ง dependencies ครบถ้วน
- [ ] ทดสอบ build locally: `cd frontend && npm run build`
- [ ] เตรียม Environment Variables
- [ ] เตรียม Backend API endpoint
- [ ] ตรวจสอบ `.vercelignore` เพื่อไม่ upload ไฟล์ที่ไม่จำเป็น
- [ ] อัปเดต `NEXT_PUBLIC_API_BASE` ให้ถูกต้อง

---

## 🎉 หลังจาก Deploy สำเร็จ

1. ทดสอบเว็บไซต์ที่ URL ที่ได้รับ
2. ตรวจสอบ Console logs ใน Vercel Dashboard
3. ตั้งค่า custom domain (ถ้าต้องการ)
4. เปิดใช้งาน Analytics และ Monitoring

**Happy Deploying! 🚀**
