# 🚂 Deploy SmartLiva บน Railway

## 📋 ขั้นตอนการ Deploy

### 1️⃣ เตรียม GitHub Repository

```bash
# Commit ทุกอย่าง
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2️⃣ Deploy บน Railway

1. **ไปที่** [railway.app](https://railway.app)

2. **Sign in** with GitHub

3. **New Project** → **Deploy from GitHub repo**

4. **เลือก repository**: `SmartLiva`

5. **Configure:**
   - Railway จะ auto-detect และ deploy

### 3️⃣ ตั้งค่า Environment Variables

ใน Railway Dashboard → **Variables** tab:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

OPENAI_MODEL=gpt-5-mini-2025-08-07

# Optional
MAX_TOKENS=2000
TEMPERATURE=0.7
ENVIRONMENT=production
DEBUG=false
```

### 4️⃣ Deploy Settings

Railway จะใช้ settings จาก:

- ✅ `Procfile` - คำสั่ง start
- ✅ `railway.json` - Railway configuration
- ✅ `nixpacks.toml` - Build configuration

### 5️⃣ Deploy!

- คลิก **Deploy**
- รอประมาณ 3-5 นาที
- ได้ URL: `https://your-app.up.railway.app`

---

## 🔍 โครงสร้างโปรเจ็กต์

```
app/
├── backend/              ← FastAPI backend
│   ├── app/
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
├── frontend/             ← Next.js frontend
│   ├── src/
│   ├── package.json
│   └── next.config.js
├── Procfile             ← Start command
├── railway.json         ← Railway config
└── nixpacks.toml        ← Build config
```

---

## 🔧 การทำงาน

Railway จะ:

1. Detect Python backend (FastAPI)
2. Install dependencies จาก `requirements.txt`
3. Start backend: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Expose บน public URL

---

## 💰 ค่าใช้จ่าย

**Free Tier:**

- $5 credit/month
- พอใช้งาน ~1,000-2,000 requests/month
- CPU: 0.5 vCPU
- RAM: 512 MB

**Hobby Plan:** $5/month

- $5 credit + pay-as-you-go
- CPU: 2 vCPU
- RAM: 2 GB

---

## 📊 Monitoring

**Railway Dashboard:**

- Deployments: ดู build logs
- Metrics: CPU, Memory, Network usage
- Logs: Real-time application logs

---

## 🐛 Troubleshooting

### Build Failed?

**Check:**

1. `requirements.txt` มีครบ
2. Python version (ใช้ 3.9+)
3. Build logs ใน Railway dashboard

**Fix:**

```bash
# Test local
cd app/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### API Not Working?

**Check:**

1. Environment Variables ตั้งค่าครบ
2. `OPENAI_API_KEY` ถูกต้อง
3. Port configuration: Railway จะ set `$PORT` อัตโนมัติ

### Out of Memory?

**Solutions:**

1. Upgrade to Hobby plan ($5/month)
2. Optimize model loading (lazy load)
3. Reduce `MAX_TOKENS`

---

## 🔄 อัปเดต

```bash
# Local changes
git add .
git commit -m "Update feature"
git push origin main

# Railway จะ auto-deploy ภายใน 2-3 นาที
```

---

## 📝 Environment Variables

| Variable         | Value                       | Required |
| ---------------- | --------------------------- | -------- |
| `OPENAI_API_KEY` | your_openai_api_key_here    | ✅       |
| `OPENAI_MODEL`   | gpt-5-mini-2025-08-07       | ✅       |
| `MAX_TOKENS`     | 2000                        | ⚪       |
| `TEMPERATURE`    | 0.7                         | ⚪       |
| `PORT`           | (auto)                      | ✅       |

---

## ✅ Checklist

- [ ] Push code to GitHub
- [ ] Create Railway account
- [ ] Deploy from GitHub
- [ ] Set Environment Variables
- [ ] Test deployment: `curl https://your-app.up.railway.app/health`
- [ ] Monitor logs
- [ ] Update DNS (optional)

---

## 🎉 เสร็จแล้ว!

URL ของคุณ: `https://smartliva.up.railway.app`

**API Endpoints:**

- Health: `GET /health`
- Predict: `POST /predict`
- Chat: `POST /chat`
- Docs: `GET /docs`

---

## 🆘 ต้องการความช่วยเหลือ?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- SmartLiva Issues: https://github.com/kingphuripol/SmartLiva/issues

---

**Happy Deploying! 🚀**
