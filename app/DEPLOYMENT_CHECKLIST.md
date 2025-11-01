# SmartLiva - Deployment Checklist

## 📋 ก่อน Deploy

### 1. โค้ดและ Dependencies

- [ ] ทดสอบว่าโค้ดทำงานได้ใน local: `cd frontend && npm run dev`
- [ ] Build สำเร็จใน local: `cd frontend && npm run build`
- [ ] ไม่มี TypeScript errors: `cd frontend && npm run type-check`
- [ ] ไม่มี Lint errors: `cd frontend && npm run lint`
- [ ] Dependencies ครบถ้วนใน `package.json`

### 2. Environment Variables

- [ ] สร้างไฟล์ `.env.production` พร้อม `NEXT_PUBLIC_API_BASE`
- [ ] เตรียม Backend API URL (ถ้า deploy แล้ว)
- [ ] ตรวจสอบว่าไม่มี sensitive data ใน code

### 3. Git Repository

- [ ] โค้ดทั้งหมด committed แล้ว
- [ ] Push ไป GitHub/GitLab แล้ว
- [ ] Repository เป็น public หรือ Vercel มีสิทธิ์เข้าถึง
- [ ] ไม่มีไฟล์ขนาดใหญ่ (>50MB) ใน repo

### 4. ไฟล์ Configuration

- [ ] `vercel.json` ถูกต้อง
- [ ] `next.config.js` ปรับแต่งสำหรับ production แล้ว
- [ ] `.vercelignore` ครอบคลุมไฟล์ที่ไม่ต้องการ
- [ ] `package.json` มี engines specification

### 5. Backend (ถ้ามี)

- [ ] Backend deployed แล้วบน Railway/Render/Cloud
- [ ] Test API endpoints ทำงาน: `curl https://your-api.com/health`
- [ ] Database setup เสร็จแล้ว
- [ ] Environment variables ตั้งค่าครบ

---

## 🚀 ระหว่าง Deploy

### Vercel Web Interface

1. [ ] ไปที่ [vercel.com](https://vercel.com) และ login
2. [ ] คลิก "Add New Project"
3. [ ] Import SmartLiva repository
4. [ ] ตั้งค่า:
   - Root Directory: `frontend`
   - Framework: Next.js (auto-detect)
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. [ ] เพิ่ม Environment Variables:
   - `NEXT_PUBLIC_API_BASE` = `https://your-backend.com`
6. [ ] คลิก "Deploy"
7. [ ] รอ build complete (~2-5 นาที)

### Vercel CLI

1. [ ] ติดตั้ง: `npm install -g vercel`
2. [ ] Login: `vercel login`
3. [ ] Deploy: `vercel --prod`
4. [ ] ยืนยัน settings และกด Enter
5. [ ] รอ deployment complete

---

## ✅ หลัง Deploy

### 1. ทดสอบเว็บไซต์

- [ ] เปิด URL ที่ได้รับ (เช่น `https://smartliva.vercel.app`)
- [ ] ทดสอบทุกหน้า (home, dashboard, forms)
- [ ] ทดสอบ API calls (ถ้ามี backend)
- [ ] ทดสอบบน mobile browser
- [ ] ตรวจสอบ Console ไม่มี errors

### 2. Vercel Dashboard

- [ ] ตรวจสอบ Build logs สำเร็จ
- [ ] ดู Deployment status = "Ready"
- [ ] ตรวจสอบ Environment Variables ถูกต้อง
- [ ] Enable Analytics (optional)

### 3. Performance & SEO

- [ ] Test ด้วย Lighthouse (ควรได้ >90 points)
- [ ] Test loading speed: [web.dev/measure](https://web.dev/measure)
- [ ] ตรวจสอบ responsive design
- [ ] Meta tags ครบถ้วน

### 4. Security

- [ ] HTTPS enabled (Vercel auto-enables)
- [ ] Security headers working
- [ ] No sensitive data exposed
- [ ] API endpoints protected

### 5. Monitoring

- [ ] Setup error tracking (Sentry - optional)
- [ ] Enable Vercel Analytics
- [ ] Monitor first few hours for errors
- [ ] Check performance metrics

---

## 🔧 Custom Domain (Optional)

- [ ] ซื้อ domain name (เช่น smartliva.com)
- [ ] ไปที่ Vercel Dashboard → Domains
- [ ] Add custom domain
- [ ] อัปเดต DNS records:

  ```
  Type: A
  Name: @
  Value: 76.76.21.21

  Type: CNAME
  Name: www
  Value: cname.vercel-dns.com
  ```

- [ ] รอ DNS propagation (24-48 ชั่วโมง)
- [ ] ทดสอบ custom domain

---

## 📱 Social Media & Marketing

- [ ] เตรียม screenshots สำหรับโปรโมท
- [ ] เตรียม description/tagline
- [ ] Share link บน social media
- [ ] Update portfolio/resume ด้วย live link
- [ ] Add to README.md

---

## 🆘 Troubleshooting

### Build Failed

1. [ ] ตรวจสอบ error messages ใน Build logs
2. [ ] ลอง build local: `npm run build`
3. [ ] ตรวจสอบ dependencies versions
4. [ ] Clear cache และ redeploy

### 404 Not Found

1. [ ] ตรวจสอบ Root Directory = `frontend`
2. [ ] ตรวจสอบ routes ใน pages/
3. [ ] Redeploy

### API Not Working

1. [ ] ตรวจสอบ `NEXT_PUBLIC_API_BASE` ใน Vercel
2. [ ] ตรวจสอบ backend online
3. [ ] ตรวจสอบ CORS settings ใน backend
4. [ ] ดู Network tab ใน DevTools

### Slow Performance

1. [ ] Enable caching
2. [ ] Optimize images
3. [ ] Use CDN for static assets
4. [ ] Upgrade Vercel plan (if needed)

---

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [DEPLOY.md](./DEPLOY.md) - Quick guide
- [README.deployment.md](./README.deployment.md) - Full guide
- [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md) - Backend guide

---

## ✨ Success Criteria

เว็บไซต์พร้อมใช้งานเมื่อ:

- ✅ URL accessible สาธารณะ
- ✅ ทุกหน้าโหลดได้ไม่มี errors
- ✅ API calls ทำงาน (ถ้ามี)
- ✅ Responsive บน mobile
- ✅ HTTPS enabled
- ✅ Performance score >85

---

**🎉 Congratulations! เว็บของคุณออนไลน์แล้ว!**

แชร์ link ให้เพื่อนๆ ดูกันเลย! 🚀
