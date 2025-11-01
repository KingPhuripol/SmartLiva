# SmartLiva - Quick Deployment Guide 🚀

## ขั้นตอนการ Deploy บน Vercel แบบง่าย

### 1️⃣ ติดตั้ง Vercel CLI (ถ้ายังไม่มี)

```bash
npm install -g vercel
```

### 2️⃣ Login เข้า Vercel

```bash
vercel login
```

### 3️⃣ Deploy โปรเจ็กต์

```bash
# Deploy แบบ Development (ทดสอบก่อน)
vercel

# หรือ Deploy แบบ Production (เว็บสาธารณะ)
vercel --prod
```

### 4️⃣ ตั้งค่า Environment Variables

```bash
# ตั้งค่า API endpoint
vercel env add NEXT_PUBLIC_API_BASE
# พิมพ์: https://smartliva-backend.vercel.app
```

### 5️⃣ Deploy อีกครั้งหลังตั้งค่า env

```bash
vercel --prod
```

---

## 🌐 หรือใช้ Vercel Web Interface

### ขั้นตอน:

1. **ไปที่** [vercel.com](https://vercel.com)
2. **คลิก** "Add New Project"
3. **Import** SmartLiva repository
4. **ตั้งค่า:**
   - Root Directory: `frontend`
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **เพิ่ม Environment Variable:**

   - Key: `NEXT_PUBLIC_API_BASE`
   - Value: `https://smartliva-backend.vercel.app`

6. **คลิก Deploy** ✨

---

## ⚡ การ Deploy แบบ Auto (CI/CD)

หลังจาก deploy ครั้งแรกแล้ว:

```bash
# ทุกครั้งที่ push to main branch จะ deploy อัตโนมัติ
git add .
git commit -m "Update features"
git push origin main
```

Vercel จะ build และ deploy ให้อัตโนมัติภายใน 2-3 นาที! 🎉

---

## 📱 URL ที่ได้

- **Production**: `https://smartliva.vercel.app`
- **Preview** (แต่ละ branch): `https://smartliva-git-[branch].vercel.app`
- **Development**: `https://smartliva-[hash].vercel.app`

---

## ⚠️ หมายเหตุสำคัญ

1. **Backend API**: ต้อง deploy backend แยกต่างหาก (ดูใน README.deployment.md)
2. **Model Files**: ไฟล์ `.pth` ขนาดใหญ่ไม่ควร upload ไป Vercel
3. **Database**: ใช้ cloud database เช่น Supabase, PlanetScale
4. **Environment Variables**: อย่าลืมตั้งค่าใน Vercel Dashboard

---

## 🔧 Troubleshooting

### Build Failed?

```bash
# ลอง build locally ก่อน
cd frontend
npm install
npm run build
```

### API Connection Failed?

- ตรวจสอบ `NEXT_PUBLIC_API_BASE` ใน Vercel Dashboard
- ตรวจสอบว่า backend online อยู่หรือไม่

### Page Not Found?

- ตรวจสอบ root directory = `frontend`
- ตรวจสอบ output directory = `.next`

---

## 📞 ต้องการความช่วยเหลือ?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Next.js Docs: https://nextjs.org/docs

**Success! 🎊**
