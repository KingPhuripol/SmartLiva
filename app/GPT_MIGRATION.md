# 🤖 Migration: จาก MedGemma (16GB) ไป GPT-4o API

## 🎯 ทำไมต้องเปลี่ยน?

### ปัญหาเดิม:
- ❌ **medgemma_model.pth** - 16GB (ใหญ่มาก!)
- ❌ **data/** - 15GB training images
- ❌ Deploy ยาก (ต้องมี GPU, RAM สูง)
- ❌ Maintenance ยาก
- ❌ Update model ยาก

### ข้อดีของ GPT-4o API:
- ✅ **ไม่ต้องเก็บ model local** (0 bytes!)
- ✅ **Deploy ง่าย** บน Vercel, Railway, Render
- ✅ **Always up-to-date** - OpenAI update ให้อัตโนมัติ
- ✅ **Scalable** - ไม่ต้องกังวลเรื่อง infrastructure
- ✅ **Pay-per-use** - จ่ายเท่าที่ใช้
- ✅ **GPT-4o เก่งกว่า MedGemma** มาก

---

## 🚀 วิธี Migration (3 ขั้นตอน)

### ขั้นตอนที่ 1: รันสคริปต์ Migration

```bash
./migrate-to-gpt.sh
```

สคริปต์จะ:
1. Backup model files ไว้ที่ `~/Backup/SmartLiva-{timestamp}/`
2. ลบ medgemma_model.pth (16GB)
3. ลบ data/ (15GB)
4. ลบ node_modules (reinstall ได้)
5. Clean cache files

**ผลลัพธ์: 48GB → ~100MB** ✅

### ขั้นตอนที่ 2: ตั้งค่า OpenAI API Key

#### 2.1 รับ API Key จาก OpenAI

1. ไปที่ [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. สร้าง account (ถ้ายังไม่มี)
3. คลิก "Create new secret key"
4. คัดลอก API key (ขึ้นต้นด้วย `sk-...`)

#### 2.2 ตั้งค่า API Key

**สำหรับ Local Development:**

```bash
# สร้าง .env file
cat > backend/.env << EOF
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4o
EOF
```

**สำหรับ Production (Vercel/Railway/Render):**

ตั้งค่า Environment Variables ใน dashboard:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4o
```

### ขั้นตอนที่ 3: Test และ Deploy

```bash
# ติดตั้ง dependencies
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# Test backend
cd backend
uvicorn app.main:app --reload

# Test ที่ http://localhost:8000/docs

# ถ้าทำงานได้ → Commit และ Deploy
git add .
git commit -m "Migrate to GPT-4o API, remove large local models"
git push origin main
vercel --prod
```

---

## 💰 ค่าใช้จ่าย GPT-4o

### GPT-4o Pricing (ณ พ.ย. 2025)

| Model | Input | Output | Best For |
|-------|-------|--------|----------|
| **gpt-4o** | $2.50/1M tokens | $10.00/1M tokens | Production, high quality |
| **gpt-4o-mini** | $0.15/1M tokens | $0.60/1M tokens | Development, testing |

### ตัวอย่างการใช้งาน:

**Scenario 1: Development/Testing**
- Model: gpt-4o-mini
- ใช้ 100 requests/day
- Average 500 tokens/request
- ค่าใช้จ่าย: ~$0.30/month 💰

**Scenario 2: Production (Small)**
- Model: gpt-4o
- ใช้ 1,000 requests/day
- Average 800 tokens/request
- ค่าใช้จ่าย: ~$100/month 💰💰

**Scenario 3: Production (Medium)**
- Model: gpt-4o
- ใช้ 10,000 requests/day
- Average 800 tokens/request
- ค่าใช้จ่าย: ~$1,000/month 💰💰💰

### 💡 Tips ประหยัดค่าใช้จ่าย:

1. **ใช้ gpt-4o-mini สำหรับ development**
2. **Cache responses** ที่ซ้ำกัน
3. **Limit token usage** (max_tokens parameter)
4. **Implement rate limiting**
5. **Monitor usage** ใน OpenAI dashboard

---

## 🔧 Configuration Options

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-xxx              # API key จาก OpenAI

# Optional
OPENAI_MODEL=gpt-4o                # Model: gpt-4o, gpt-4o-mini, gpt-4-turbo
MAX_TOKENS=300                      # Max tokens per response
TEMPERATURE=0.7                     # Creativity (0.0-2.0)
```

### Model Choices

```python
# backend/app/main.py

# Option 1: GPT-4o (แนะนำสำหรับ production)
OPENAI_MODEL=gpt-4o

# Option 2: GPT-4o-mini (ถูกกว่า, เหมาะสำหรับ dev)
OPENAI_MODEL=gpt-4o-mini

# Option 3: GPT-4 Turbo (balance ระหว่าง cost & quality)
OPENAI_MODEL=gpt-4-turbo
```

---

## 📊 เปรียบเทียบ: MedGemma vs GPT-4o

| Feature | MedGemma (เดิม) | GPT-4o (ใหม่) |
|---------|-----------------|----------------|
| **ขนาด** | 16GB | 0 bytes |
| **Deploy** | ยาก (ต้อง GPU) | ง่าย |
| **Cost** | Free แต่ต้องจัดการเอง | Pay-per-use |
| **Performance** | ดี | ดีเยี่ยม |
| **Updates** | Manual | Auto by OpenAI |
| **Scalability** | จำกัด | Unlimited |
| **Maintenance** | ต้องดูแลเอง | OpenAI ดูแลให้ |

---

## 🔐 Security Best Practices

### 1. ปกป้อง API Key

```bash
# ❌ อย่าทำ - commit API key ใน code
OPENAI_API_KEY="sk-xxx"

# ✅ ทำ - ใช้ environment variables
OPENAI_API_KEY=os.getenv("OPENAI_API_KEY")
```

### 2. Rate Limiting

```python
from fastapi import HTTPException
import time

# Simple rate limiter
user_requests = {}

def check_rate_limit(user_id: str, max_requests: int = 100, window: int = 3600):
    now = time.time()
    if user_id not in user_requests:
        user_requests[user_id] = []
    
    # Remove old requests
    user_requests[user_id] = [t for t in user_requests[user_id] if now - t < window]
    
    if len(user_requests[user_id]) >= max_requests:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    user_requests[user_id].append(now)
```

### 3. Input Validation

```python
def validate_chat_input(message: str) -> bool:
    if len(message) > 2000:  # Max message length
        return False
    if not message.strip():  # Empty message
        return False
    return True
```

---

## 🧪 Testing

### Local Testing

```bash
# Start backend
cd backend
uvicorn app.main:app --reload --port 8000

# Test chat endpoint
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "history": [
      {"role": "user", "content": "What is liver fibrosis?"}
    ],
    "max_new_tokens": 300,
    "temperature": 0.7
  }'
```

### Production Testing

```bash
# Test production API
curl -X POST https://your-api.vercel.app/chat \
  -H "Content-Type: application/json" \
  -d '{
    "history": [
      {"role": "user", "content": "Explain HCC"}
    ]
  }'
```

---

## 📈 Monitoring

### 1. OpenAI Dashboard
- ไปที่ [platform.openai.com/usage](https://platform.openai.com/usage)
- ดู token usage, costs, requests

### 2. Backend Logs

```python
import logging

logger = logging.getLogger(__name__)

@app.post("/chat")
async def chat(request: ChatRequest):
    logger.info(f"Chat request: {len(request.history)} messages")
    
    result = try_openai_chat(...)
    
    if result:
        reply, tokens = result
        logger.info(f"Response: {tokens} tokens used")
    
    return response
```

---

## 🆘 Troubleshooting

### ❌ "Invalid API Key"

**Solution:**
```bash
# ตรวจสอบ API key
echo $OPENAI_API_KEY

# ตั้งค่าใหม่
export OPENAI_API_KEY=sk-your-actual-key
```

### ❌ "Rate limit exceeded"

**Solution:**
- Upgrade OpenAI plan
- Implement caching
- Use gpt-4o-mini

### ❌ "Context length exceeded"

**Solution:**
```python
# Limit history length
history = history[-5:]  # Keep only last 5 messages

# Reduce max_tokens
max_tokens = 300  # Instead of 1000
```

---

## ✅ Checklist

- [ ] รัน `./migrate-to-gpt.sh`
- [ ] สร้าง OpenAI account และรับ API key
- [ ] ตั้งค่า `OPENAI_API_KEY` ใน .env
- [ ] Test local: `uvicorn app.main:app --reload`
- [ ] Test chat endpoint
- [ ] ตั้งค่า Environment Variables ใน Vercel/Railway
- [ ] Deploy: `vercel --prod`
- [ ] Monitor usage ใน OpenAI dashboard
- [ ] Set up rate limiting (optional)
- [ ] Set up caching (optional)

---

## 🎉 สรุป

**ก่อน:**
- โปรเจ็กต์ 48GB
- Deploy ยาก
- ต้องจัดการ model เอง

**หลัง:**
- โปรเจ็กต์ ~100MB ✅
- Deploy ง่าย ✅
- OpenAI จัดการให้ ✅
- GPT-4o เก่งกว่า ✅

**ขั้นตอนต่อไป:**
```bash
./migrate-to-gpt.sh
# ตั้งค่า OPENAI_API_KEY
vercel --prod
```

---

**มีคำถาม?** ถามได้เลย! 😊

**ต้องการ cost-effective?** ใช้ `gpt-4o-mini` แทน `gpt-4o`
