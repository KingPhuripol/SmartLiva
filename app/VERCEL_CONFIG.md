# SmartLiva Vercel Configuration

## 🔑 Environment Variables

คัดลอกค่าเหล่านี้ไปใส่ใน Vercel Dashboard → Project Settings → Environment Variables

### Production

```env
NEXT_PUBLIC_API_BASE=https://smartliva-backend.vercel.app
```

### Development (Optional)

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

---

## 📂 Project Settings

### Build & Development Settings

| Setting             | Value           |
| ------------------- | --------------- |
| Framework Preset    | Next.js         |
| Root Directory      | `frontend`      |
| Build Command       | `npm run build` |
| Output Directory    | `.next`         |
| Install Command     | `npm install`   |
| Development Command | `npm run dev`   |

### Node.js Version

```
18.x
```

---

## 🚀 Deployment Settings

### Auto-deploy branches

- ✅ `main` → Production
- ✅ All other branches → Preview deployments

### Build settings

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs"
}
```

---

## 🔗 Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `smartliva.com`)
4. Add DNS records as instructed by Vercel:

   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`

   And/Or:

   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

---

## 🔒 Security Headers

Vercel automatically adds these security headers (configured in `next.config.js`):

- X-DNS-Prefetch-Control
- Strict-Transport-Security
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy

---

## 📊 Analytics

Enable Vercel Analytics (Free):

1. Go to **Analytics** tab
2. Click **Enable Analytics**
3. Analytics will start tracking:
   - Page views
   - Visit duration
   - Top pages
   - Device types
   - Geographic data

---

## 🔍 Monitoring

### Vercel Dashboard shows:

- ✅ Deployment status
- ✅ Build logs
- ✅ Runtime logs
- ✅ Error tracking
- ✅ Performance metrics

### Optional: Add Sentry

For advanced error tracking, add to `frontend/pages/_app.tsx`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## 🔄 CI/CD with GitHub Actions

The project includes `.github/workflows/deploy.yml` for automatic deployment.

### Setup:

1. Get Vercel Token:
   - Go to https://vercel.com/account/tokens
   - Create new token
2. Add GitHub Secrets:

   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: Found in Vercel project settings
   - `VERCEL_PROJECT_ID`: Found in Vercel project settings

3. Push to `main` branch → Auto deploy! 🎉

---

## 🐛 Troubleshooting

### Build fails with "Module not found"

**Solution**: Check that all dependencies are in `frontend/package.json`

```bash
cd frontend
npm install
npm run build
```

### Environment variable not working

**Solution**: Make sure variable starts with `NEXT_PUBLIC_` and is set in Vercel Dashboard

### 404 on deployment

**Solution**: Check that Root Directory is set to `frontend` in Vercel Project Settings

### API connection fails

**Solution**: Verify `NEXT_PUBLIC_API_BASE` is correctly set and backend is deployed

---

## 📚 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)

---

## ✅ Pre-deployment Checklist

- [ ] All code committed to Git
- [ ] `frontend/package.json` has all dependencies
- [ ] Environment variables prepared
- [ ] Backend API deployed and accessible
- [ ] Test build locally: `cd frontend && npm run build`
- [ ] `.vercelignore` excludes large files
- [ ] `next.config.js` optimized for production

---

**Ready to deploy? Let's go! 🚀**
