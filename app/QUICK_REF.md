# 📝 SmartLiva Deployment - Quick Reference

## 🚀 วิธีที่เร็วที่สุด

```bash
# 1. Commit
git add . && git commit -m "Deploy ready" && git push

# 2. Deploy
vercel --prod
```

## 📚 เอกสาร

| ไฟล์            | ใช้สำหรับ        |
| --------------- | ---------------- |
| `START_HERE.md` | 👈 เริ่มที่นี่   |
| `DEPLOY.md`     | คู่มือย่อ 5 นาที |
| `SUMMARY.md`    | สรุปทั้งหมด      |

## 🛠️ Commands

```bash
# ตรวจสอบความพร้อม
./check-deployment.sh

# Deploy ง่ายๆ
./deploy-vercel.sh

# Build local
cd frontend && npm run build

# Test local
cd frontend && npm start
```

## ⚙️ Vercel Settings

```
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

## 🔑 Environment Variable

```
NEXT_PUBLIC_API_BASE=https://your-backend-url.com
```

## 🆘 เจอปัญหา?

1. อ่าน `START_HERE.md`
2. Check `DEPLOYMENT_CHECKLIST.md`
3. รัน `./check-deployment.sh`

## 🎯 Next Steps

1. Deploy backend (Railway/Render)
2. Deploy frontend (Vercel)
3. Update API URL
4. Test & share!

---

**ทุกอย่างอยู่ใน START_HERE.md แล้ว!**
