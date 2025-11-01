# 📦 การจัดการ Model Files ขนาดใหญ่

## ⚠️ ปัญหา

โปรเจ็กต์ของคุณมีขนาด **48GB** เพราะ:

- `medgemma_model.pth` - **16GB** 😱
- `data/` (training images) - **15GB**
- `maxvit_large_best.pth` - **805MB**

ไฟล์เหล่านี้:
- ❌ **ไม่ควร** อยู่ใน Git
- ❌ **ไม่ควร** deploy ไป Vercel (limit 100MB)
- ✅ **ควร** เก็บใน Cloud Storage

---

## 🧹 วิธีทำความสะอาด (เร็ว!)

```bash
# รันสคริปต์ทำความสะอาด
./cleanup-large-files.sh
```

สคริปต์นี้จะลบ:
- ✓ Model files (.pth)
- ✓ Training data (data/)
- ✓ node_modules (ติดตั้งใหม่ได้)
- ✓ .next build
- ✓ Python cache
- ✓ Jupyter checkpoints

หลังทำความสะอาด: **48GB → ~100MB** 🎉

---

## 📤 การเก็บ Model Files

### ตัวเลือกที่ 1: Hugging Face Hub (แนะนำ - ฟรี!)

#### 1. สร้างบัญชีและ Upload

```bash
# ติดตั้ง
pip install huggingface_hub

# Login
huggingface-cli login

# สร้าง repository
huggingface-cli repo create smartliva-models --type model

# Upload models
huggingface-cli upload kingphuripol/smartliva-models \
  medgemma_model.pth \
  maxvit_large_best.pth
```

#### 2. แก้โค้ดให้ download จาก Hugging Face

แก้ `backend/app/main.py`:

```python
from huggingface_hub import hf_hub_download
import torch

@app.on_event("startup")
async def load_models():
    # Download from Hugging Face
    maxvit_path = hf_hub_download(
        repo_id="kingphuripol/smartliva-models",
        filename="maxvit_large_best.pth",
        cache_dir="/tmp"
    )
    
    medgemma_path = hf_hub_download(
        repo_id="kingphuripol/smartliva-models",
        filename="medgemma_model.pth",
        cache_dir="/tmp"
    )
    
    # Load models
    maxvit_model = torch.load(maxvit_path)
    medgemma_model = torch.load(medgemma_path)
```

### ตัวเลือกที่ 2: AWS S3

#### 1. Upload to S3

```bash
# Install AWS CLI
brew install awscli

# Configure
aws configure

# Create bucket
aws s3 mb s3://smartliva-models

# Upload models
aws s3 cp medgemma_model.pth s3://smartliva-models/
aws s3 cp maxvit_large_best.pth s3://smartliva-models/

# Make files public (optional)
aws s3api put-object-acl --bucket smartliva-models \
  --key medgemma_model.pth --acl public-read
```

#### 2. แก้โค้ดให้ download จาก S3

```python
import boto3
import os

@app.on_event("startup")
async def load_models():
    s3 = boto3.client('s3')
    
    # Download models to /tmp
    s3.download_file(
        'smartliva-models',
        'maxvit_large_best.pth',
        '/tmp/maxvit_large_best.pth'
    )
    
    s3.download_file(
        'smartliva-models',
        'medgemma_model.pth',
        '/tmp/medgemma_model.pth'
    )
    
    # Load models
    maxvit_model = torch.load('/tmp/maxvit_large_best.pth')
    medgemma_model = torch.load('/tmp/medgemma_model.pth')
```

### ตัวเลือกที่ 3: Google Cloud Storage

```bash
# Install gcloud
brew install google-cloud-sdk

# Login
gcloud auth login

# Create bucket
gsutil mb gs://smartliva-models

# Upload models
gsutil cp medgemma_model.pth gs://smartliva-models/
gsutil cp maxvit_large_best.pth gs://smartliva-models/

# Make public (optional)
gsutil iam ch allUsers:objectViewer gs://smartliva-models
```

### ตัวเลือกที่ 4: Git LFS (ไม่แนะนำสำหรับไฟล์ใหญ่มาก)

```bash
# Install Git LFS
brew install git-lfs
git lfs install

# Track large files
git lfs track "*.pth"
git add .gitattributes

# Commit
git add maxvit_large_best.pth medgemma_model.pth
git commit -m "Add models with LFS"
git push

# Note: GitHub LFS มี limit 1GB สำหรับ free tier
```

---

## 🎯 แนวทางที่แนะนำ

### สำหรับ Development (Local)

```bash
# เก็บ models ไว้ในโฟลเดอร์ที่แยกออกมา
mkdir -p ~/SmartLiva-Models
mv medgemma_model.pth ~/SmartLiva-Models/
mv maxvit_large_best.pth ~/SmartLiva-Models/

# Symlink กลับมา (optional)
ln -s ~/SmartLiva-Models/medgemma_model.pth .
ln -s ~/SmartLiva-Models/maxvit_large_best.pth .
```

### สำหรับ Production

1. **Upload models** → Hugging Face / S3 / GCS
2. **แก้โค้ด** → Download on startup หรือ lazy loading
3. **Cache models** → เก็บใน `/tmp` หรือ persistent volume
4. **Optimize models**:
   - Model quantization (reduce size)
   - Model pruning
   - ONNX conversion

---

## 🔧 Model Optimization (ลดขนาด)

### Quantization (INT8)

```python
import torch

# Load original model
model = torch.load('medgemma_model.pth')

# Quantize to INT8 (reduce size by ~75%)
model_int8 = torch.quantization.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)

# Save quantized model
torch.save(model_int8, 'medgemma_model_int8.pth')

# Before: 16GB → After: ~4GB
```

### Model Pruning

```python
import torch.nn.utils.prune as prune

# Prune 30% of weights
for module in model.modules():
    if isinstance(module, torch.nn.Linear):
        prune.l1_unstructured(module, name='weight', amount=0.3)

# Remove pruning reparameterization
for module in model.modules():
    if isinstance(module, torch.nn.Linear):
        prune.remove(module, 'weight')

torch.save(model, 'medgemma_model_pruned.pth')
```

### ONNX Conversion

```python
import torch.onnx

# Export to ONNX
dummy_input = torch.randn(1, 3, 224, 224)
torch.onnx.export(
    model,
    dummy_input,
    "model.onnx",
    opset_version=11
)
```

---

## 📊 เปรียบเทียบตัวเลือก

| Method | Cost | Size Limit | Speed | Best For |
|--------|------|------------|-------|----------|
| **Hugging Face** | ฟรี | ไม่จำกัด | ปานกลาง | Open source |
| **AWS S3** | ~$0.023/GB/mo | ไม่จำกัด | เร็ว | Production |
| **Google Cloud** | ~$0.020/GB/mo | ไม่จำกัด | เร็ว | Production |
| **Git LFS** | จำกัด (1GB free) | ขึ้นกับ plan | ช้า | ไฟล์เล็ก |

---

## ✅ Checklist

- [ ] Backup models ก่อนลบ
- [ ] รัน `./cleanup-large-files.sh`
- [ ] Upload models ไป cloud storage
- [ ] แก้โค้ดให้ download models
- [ ] Test ใน local
- [ ] อัปเดต `.gitignore`
- [ ] Commit และ push
- [ ] Deploy!

---

## 🆘 คำถามที่พบบ่อย

### Q: ถ้าลบ model files แล้วจะใช้งานได้ไหม?

A: ใช้งานใน local ไม่ได้ จนกว่าจะ download มาใหม่หรือแก้โค้ดให้ดึงจาก cloud

### Q: Training data ควรเก็บไว้ไหม?

A: ควร backup ไว้ที่อื่น (external drive, cloud) แล้วลบออกจาก Git

### Q: node_modules ลบแล้วต้องทำยังไง?

A: รัน `cd frontend && npm install` เพื่อติดตั้งใหม่

### Q: ถ้าไม่ต้องการลบ model files?

A: ใช้ `.dockerignore` และ `.vercelignore` เพื่อไม่ให้ deploy ขึ้นไป แต่ก็ยังใหญ่ใน local

---

## 📝 สรุป

**ก่อนทำความสะอาด:** 48GB
**หลังทำความสะอาด:** ~100MB ✅

**ขั้นตอนต่อไป:**
1. รัน `./cleanup-large-files.sh`
2. Upload models ไป Hugging Face (แนะนำ)
3. แก้โค้ดให้ download จาก cloud
4. Commit และ deploy!

---

**🎉 หลังทำแล้ว deploy จะเร็วและไม่เจอปัญหาขนาดไฟล์!**
