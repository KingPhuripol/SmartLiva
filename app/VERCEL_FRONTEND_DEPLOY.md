# ⚡ Deploy SmartLiva บน Vercel (เร็วสุด!)

## 🎯 Strategy: Frontend (Vercel) + Backend (Render)

- **Frontend**: Next.js บน Vercel → ⚡ เร็วมาก
- **Backend**: FastAPI บน Render → 🆓 Free tier ดี
- **Total Cost**: $0/month (Free tier ทั้งคู่)

---

## 📦 Part 1: Deploy Backend บน Render

### 1️⃣ เตรียม Backend

```bash
cd /Users/king_phuripol/Work/SmartLab/SmartLiva/app/backend
```

### 2️⃣ ไปที่ Render

1. เปิด: https://render.com
2. **Sign in with GitHub**
3. **New +** → **Web Service**
4. เลือก repository: `KingPhuripol/SmartLiva`
5. **Root Directory**: `app/backend`

### 3️⃣ Configure

**Settings:**
```yaml
Name: smartliva-backend
Region: Singapore (ใกล้ที่สุด)
Branch: main
Root Directory: app/backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Environment Variables:**
```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5-mini-2025-08-07
MAX_TOKENS=2000
TEMPERATURE=0.7
ENVIRONMENT=production
PORT=10000
```

### 4️⃣ Deploy

- คลิก **Create Web Service**
- รอ 3-5 นาที
- ได้ URL: `https://smartliva-backend.onrender.com`

### 5️⃣ ทดสอบ Backend

```bash
curl https://smartliva-backend.onrender.com/health
```

---

## 🎨 Part 2: Deploy Frontend บน Vercel

### 1️⃣ เตรียม Frontend

```bash
cd /Users/king_phuripol/Work/SmartLab/SmartLiva/app/frontend
```

### 2️⃣ Update API URL

สร้างไฟล์ `.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://smartliva-backend.onrender.com
```

### 3️⃣ ไปที่ Vercel

1. เปิด: https://vercel.com
2. **Sign in with GitHub**
3. **Add New** → **Project**
4. **Import** repository: `KingPhuripol/SmartLiva`

### 4️⃣ Configure

**Project Settings:**
```yaml
Framework Preset: Next.js
Root Directory: app/frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://smartliva-backend.onrender.com
```

### 5️⃣ Deploy

- คลิก **Deploy**
- รอ 1-2 นาที
- ได้ URL: `https://smartliva.vercel.app`

### 6️⃣ ทดสอบ Frontend

เปิดเบราว์เซอร์:
```
https://smartliva.vercel.app
```

---

## 🔧 Update Frontend Code

ให้แน่ใจว่า frontend เรียก API ผ่าน `NEXT_PUBLIC_API_URL`:

### ตัวอย่างใน `src/lib/api.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
  predict: async (imageData: string) => {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData })
    });
    return response.json();
  },
  
  chat: async (message: string) => {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return response.json();
  }
};
```

---

## 📊 เปรียบเทียบความเร็ว

| Platform           | Cold Start | Response Time | Uptime      |
| ------------------ | ---------- | ------------- | ----------- |
| **Vercel**         | ~100ms     | ⚡ 50-100ms   | 99.99%      |
| **Render (Free)**  | ~30s       | 200-500ms     | 99.9%       |
| **Railway (Free)** | ~45s       | 300-700ms     | 99.5%       |

**Note:** Render free tier มี cold start ~30 วินาทีถ้าไม่ได้ใช้งาน 15 นาที

---

## 🚀 Optimizations

### 1. Enable Render Auto-Deploy

Render → Settings → Auto-Deploy: **Yes**
- Auto-deploy เมื่อ push to `main`

### 2. Keep Backend Warm (Optional)

ใช้ Cron job ping backend ทุก 10 นาที:

**Vercel Cron** (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/ping-backend",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

**API Route** (`pages/api/ping-backend.ts`):
```typescript
export default async function handler(req, res) {
  try {
    await fetch('https://smartliva-backend.onrender.com/health');
    res.status(200).json({ status: 'pinged' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to ping' });
  }
}
```

---

## 💰 ค่าใช้จ่าย

### Free Tier:

**Vercel:**
- ✅ Bandwidth: 100 GB/month
- ✅ Builds: 6,000 minutes/month
- ✅ Serverless Functions: 100 GB-hours
- ✅ Custom Domains: Unlimited

**Render:**
- ✅ 750 hours/month (พอสำหรับ 1 service)
- ✅ 512 MB RAM
- ✅ Cold start หลัง 15 นาทีไม่ได้ใช้

**Total: $0/month** 🎉

---

## ⚠️ Limitations

### Render Free Tier:

- ❌ Cold start ~30 วินาที (แก้ได้ด้วย ping)
- ❌ Sleep หลัง 15 นาทีไม่ได้ใช้
- ❌ RAM 512 MB (พอสำหรับ FastAPI + OpenAI API)

### Solutions:

1. **Upgrade Render**: $7/month → ไม่มี cold start
2. **ใช้ UptimeRobot**: Ping backend ทุก 5 นาที (Free)
3. **ใช้ Vercel Cron**: Ping อัตโนมัติ

---

## 🔄 Auto-Deploy Workflow

1. **Push code** ไป GitHub:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Auto-Deploy:**
   - ✅ Vercel deploy frontend ใน ~1 นาที
   - ✅ Render deploy backend ใน ~3 นาที

3. **Done!** 🎉

---

## 📝 Custom Domains (Optional)

### Vercel:
1. Settings → Domains
2. เพิ่ม: `smartliva.com`
3. ตั้งค่า DNS ตามที่ Vercel แนะนำ

### Render:
1. Settings → Custom Domain
2. เพิ่ม: `api.smartliva.com`
3. ตั้งค่า CNAME

---

## 🐛 Troubleshooting

### Frontend ไม่เชื่อม Backend?

**Check:**
1. Environment Variable `NEXT_PUBLIC_API_URL` ตั้งค่าถูกต้อง
2. Backend URL ถูกต้อง (https://smartliva-backend.onrender.com)
3. CORS ใน backend อนุญาต Vercel domain

**Fix CORS** (`app/backend/app/main.py`):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://smartliva.vercel.app",
        "https://*.vercel.app",  # All Vercel preview deployments
        "http://localhost:3000"   # Local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Backend Slow?

- ใช้ UptimeRobot ping ทุก 5 นาที
- หรือ upgrade Render เป็น $7/month

---

## ✅ Checklist

### Backend (Render):
- [ ] Push code to GitHub
- [ ] Create Render account
- [ ] New Web Service
- [ ] Set Root Directory: `app/backend`
- [ ] Set Environment Variables
- [ ] Deploy
- [ ] Test: `curl https://smartliva-backend.onrender.com/health`

### Frontend (Vercel):
- [ ] Create `.env.production` with backend URL
- [ ] Push to GitHub
- [ ] Create Vercel account
- [ ] Import repository
- [ ] Set Root Directory: `app/frontend`
- [ ] Set Environment Variables
- [ ] Deploy
- [ ] Test: Open `https://smartliva.vercel.app`

---

## 🎉 เสร็จแล้ว!

**URLs:**
- Frontend: `https://smartliva.vercel.app`
- Backend: `https://smartliva-backend.onrender.com`
- API Docs: `https://smartliva-backend.onrender.com/docs`

**Performance:**
- ⚡ Frontend: ~50-100ms (Vercel Edge)
- 🚀 Backend: ~200-500ms (Render Singapore)
- 🌍 Global CDN: Yes (Vercel)

---

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)

---

**Happy Deploying! ⚡🚀**
