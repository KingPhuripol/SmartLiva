# Backend Deployment Guide for SmartLiva

## 🎯 แนะนำ Platform สำหรับ Deploy Backend

เนื่องจาก Backend ใช้ FastAPI และมี AI models ที่ต้องการ resource สูง แนะนำ platforms ดังนี้:

---

## 1️⃣ Railway (แนะนำที่สุด) ⭐

### ข้อดี:

- ✅ รองรับ Docker โดยตรง
- ✅ Free tier เหมาะกับการทดสอบ
- ✅ Setup ง่าย ไม่ซับซ้อน
- ✅ มี PostgreSQL และ Redis built-in
- ✅ Auto-deploy จาก GitHub

### ขั้นตอน:

1. **สมัคร Railway**: [railway.app](https://railway.app)

2. **New Project** → **Deploy from GitHub repo**

3. **เลือก SmartLiva repository**

4. **ตั้งค่า:**

   ```
   Root Directory: backend
   Build Method: Dockerfile
   Port: 8000
   ```

5. **เพิ่ม Environment Variables:**

   ```env
   PORT=8000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   SECRET_KEY=your-secret-key-here
   OPENAI_API_KEY=your-openai-key
   ```

6. **Deploy!** 🚀

7. **Copy URL** และเอาไปใส่ใน Frontend environment variable

---

## 2️⃣ Render

### ข้อดี:

- ✅ Free tier มี 750 hours/month
- ✅ รองรับ Python, Docker
- ✅ มี Database hosting
- ✅ SSL certificate ฟรี

### ขั้นตอน:

1. **สมัคร Render**: [render.com](https://render.com)

2. **New Web Service** → Connect GitHub

3. **ตั้งค่า:**

   ```
   Root Directory: backend
   Environment: Docker

   หรือถ้าไม่ใช้ Docker:
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

4. **เพิ่ม Environment Variables:**

   ```env
   PYTHON_VERSION=3.11
   DATABASE_URL=postgresql://...
   SECRET_KEY=your-secret-key
   OPENAI_API_KEY=your-key
   ```

5. **Deploy** และรอ ~5-10 นาที

---

## 3️⃣ Google Cloud Run

### ข้อดี:

- ✅ Scalability สูง
- ✅ Pay-per-use
- ✅ มี free tier $300 credits
- ✅ รองรับ GPU (ถ้าต้องการ)

### ขั้นตอน:

1. **ติดตั้ง Google Cloud SDK**:

   ```bash
   brew install google-cloud-sdk  # macOS
   ```

2. **Login และตั้งค่า project**:

   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Build และ Push Docker Image**:

   ```bash
   cd backend
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/smartliva-backend
   ```

4. **Deploy to Cloud Run**:

   ```bash
   gcloud run deploy smartliva-backend \
     --image gcr.io/YOUR_PROJECT_ID/smartliva-backend \
     --platform managed \
     --region asia-southeast1 \
     --allow-unauthenticated \
     --set-env-vars="SECRET_KEY=xxx,OPENAI_API_KEY=yyy"
   ```

5. **Get URL** และนำไปใช้งาน

---

## 4️⃣ AWS (Advanced)

### ตัวเลือก A: AWS Lambda + API Gateway (Serverless)

1. **Install Mangum** (ASGI adapter):

   ```bash
   pip install mangum
   ```

2. **แก้ไข `backend/app/main.py`**:

   ```python
   from mangum import Mangum

   app = FastAPI()
   # ... your routes ...

   handler = Mangum(app)  # Lambda handler
   ```

3. **Deploy ด้วย Serverless Framework**:
   ```bash
   npm install -g serverless
   cd backend
   serverless deploy
   ```

### ตัวเลือก B: AWS ECS (Container)

1. Push Docker image ไป ECR
2. สร้าง ECS Cluster
3. สร้าง Task Definition
4. สร้าง Service และ Load Balancer

---

## 🔧 การปรับแต่ง Backend สำหรับ Production

### 1. ปรับ `backend/Dockerfile.production`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app ./app

# Expose port
EXPOSE 8000

# Run with gunicorn for production
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

### 2. เพิ่ม Gunicorn:

```bash
cd backend
echo "gunicorn==21.2.0" >> requirements.txt
```

### 3. Health Check Endpoint:

ตรวจสอบว่ามี `/health` endpoint ใน `backend/app/main.py`:

```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
```

---

## 🗃️ Database Options

### Supabase (แนะนำ)

- Free tier: 500MB
- PostgreSQL with realtime features
- Easy setup: [supabase.com](https://supabase.com)

### PlanetScale

- Serverless MySQL
- Free tier: 5GB storage
- [planetscale.com](https://planetscale.com)

### Neon

- Serverless PostgreSQL
- Auto-scaling
- [neon.tech](https://neon.tech)

### Railway/Render Database

- Built-in database hosting
- Easy integration with app

---

## 🔐 Environment Variables สำหรับ Production

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Redis (for caching)
REDIS_URL=redis://host:6379

# Security
SECRET_KEY=your-very-secure-random-string-here
JWT_SECRET_KEY=another-secure-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Services
OPENAI_API_KEY=sk-...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=smartliva-models
AWS_REGION=ap-southeast-1

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

---

## 📦 Model Files Handling

⚠️ **ไฟล์ .pth มีขนาดใหญ่ (>100MB) ไม่สามารถ deploy ผ่าน Git หรือ Vercel ได้**

### Solution A: AWS S3 Storage

1. **Upload models to S3**:

   ```bash
   aws s3 cp maxvit_large_best.pth s3://smartliva-models/
   aws s3 cp medgemma_model.pth s3://smartliva-models/
   ```

2. **Download at runtime** (แก้ `backend/app/main.py`):

   ```python
   import boto3

   @app.on_event("startup")
   async def download_models():
       s3 = boto3.client('s3')
       s3.download_file('smartliva-models', 'maxvit_large_best.pth', '/tmp/maxvit.pth')
       # Load model from /tmp/maxvit.pth
   ```

### Solution B: Hugging Face Hub

1. **Upload to Hugging Face**:

   ```bash
   pip install huggingface_hub
   huggingface-cli login
   huggingface-cli upload smartliva/models maxvit_large_best.pth
   ```

2. **Download at runtime**:

   ```python
   from huggingface_hub import hf_hub_download

   model_path = hf_hub_download(repo_id="smartliva/models",
                                  filename="maxvit_large_best.pth")
   ```

### Solution C: Git LFS (ถ้าต้องการเก็บใน repo)

```bash
git lfs install
git lfs track "*.pth"
git add .gitattributes
git add maxvit_large_best.pth
git commit -m "Add model with LFS"
git push
```

---

## 🔍 Monitoring & Logging

### Sentry (Error Tracking)

```bash
pip install sentry-sdk[fastapi]
```

```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=1.0,
)
```

### Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

---

## 🧪 Testing Before Deployment

```bash
cd backend

# Run tests
pytest

# Test locally with production settings
docker build -t smartliva-backend -f Dockerfile.production .
docker run -p 8000:8000 smartliva-backend

# Check API
curl http://localhost:8000/health
```

---

## 📊 Deployment Comparison

| Platform     | Free Tier     | Setup Difficulty | Best For            |
| ------------ | ------------- | ---------------- | ------------------- |
| Railway      | ✅ Limited    | ⭐ Easy          | Quick prototypes    |
| Render       | ✅ 750 hrs/mo | ⭐⭐ Easy        | Small-medium apps   |
| Google Cloud | $300 credits  | ⭐⭐⭐ Medium    | Scalable production |
| AWS          | Limited       | ⭐⭐⭐⭐ Hard    | Enterprise          |

---

## ✅ Post-Deployment

1. **Test endpoints**:

   ```bash
   curl https://your-backend.railway.app/health
   ```

2. **Update Frontend env**:

   ```
   NEXT_PUBLIC_API_BASE=https://your-backend.railway.app
   ```

3. **Redeploy Frontend** on Vercel

4. **Monitor logs** in platform dashboard

5. **Set up alerts** for errors

---

## 🆘 Troubleshooting

### Port Issues

- Railway: Auto-detects $PORT
- Render: Use PORT=10000
- Cloud Run: Use PORT=8080

### Memory Issues

- Upgrade plan หรือ
- Optimize model loading (lazy loading)
- Use model quantization

### Build Timeout

- ใช้ pre-built Docker image
- Cache dependencies
- Upgrade to paid plan

---

**ถ้าต้องการความช่วยเหลือเพิ่มเติม ดูได้ที่:**

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Google Cloud Docs: https://cloud.google.com/run/docs

**Good luck with deployment! 🚀**
