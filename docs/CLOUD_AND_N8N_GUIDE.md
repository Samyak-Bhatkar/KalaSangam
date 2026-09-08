# ShilpSetu AI — Cloud & n8n Architecture Guide
### Autonomous AI-Driven Smart Cataloging & Market Linkage System
**Client**: Ministry of Social Justice and Empowerment (MoSJE), Government of India  
**Target Beneficiaries**: Marginalized Artisans, Weavers, and Micro-Entrepreneurs (NBCFDC & NSFDC)

---

## 1. Architectural Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SHILPSETU AI CLOUD STACK                         │
│                                                                             │
│  [Mobile App / Web] ──▶ [FastAPI Cloud Backend] ──▶ [Cloud Object Storage]  │
│                                  │                   (GCS / S3 / Supabase)  │
│                           Webhook Trigger                                   │
│                                  ▼                                          │
│                       ┌─────────────────────┐                               │
│                       │    n8n AUTOMATION   │                               │
│                       │      WORKFLOWS      │                               │
│                       └──────────┬──────────┘                               │
│                                  │                                          │
│            ┌─────────────────────┼────────────────────┐                     │
│            ▼                     ▼                    ▼                     │
│    [WhatsApp Voice & Bot]  [ONDC / GeM Sync]    [MoSJE Ministry Dashboard]   │
│   (Artisan Alerts & B2B)  (Multi-Channel Ecom)     (Google Sheets/Supabase)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

ShilpSetu AI leverages **n8n** as an event-driven workflow automation engine to bridge high-tech AI cataloging with rural communication channels (**WhatsApp**, interactive voice alerts, SMS) and institutional commerce networks (**ONDC**, **GeM**).

---

## 2. 1-Command Local Startup (Docker Compose)

The repository provides a unified multi-container orchestration in `docker-compose.yml`:
- **`backend`**: FastAPI Python 3.11 with FFmpeg, OpenCV, and AI studio engines (`:8000`).
- **`frontend`**: React / Vite mobile-first web app served by Nginx (`:3000`).
- **`n8n`**: Workflow automation engine (`:5678`).
- **`postgres`**: Relational database for n8n execution state and catalog persistence (`:5432`).

### Run:
```bash
# In the project root
docker compose up -d
```

### Access Services:
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **FastAPI Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
- **n8n Dashboard**: [http://localhost:5678](http://localhost:5678)

---

## 3. The 4 Core n8n Workflows

Pre-configured workflow JSON templates are stored in `n8n/workflows/`:

| Workflow File | Trigger Path | Channel / Action |
|---|---|---|
| `bargain_guard_whatsapp.json` | `/webhook/bargain-guard` | WhatsApp voice note & quick reply buttons for rural artisans |
| `ondc_gem_sync.json` | `/webhook/ondc-publish` | Multi-channel broadcast to ONDC staging gateway & GeM draft |
| `mosje_analytics_sync.json` | `/webhook/ministry-analytics` | Real-time statutory living wage & cluster sync to Google Sheets |

### How to Import Workflows into n8n:
1. Open [http://localhost:5678](http://localhost:5678) in your browser.
2. Complete the 1-minute initial admin setup.
3. In the left navigation, click **Workflows** ➔ **Add Workflow** ➔ **Import from File**.
4. Select the JSON file from `n8n/workflows/` (or from `/data/workflows/` inside the container).
5. Click **Save** and toggle the workflow switch to **Active**.

---

## 4. Setting Up WhatsApp Communication for Artisans

Rural artisans do not manage web portals; they receive notifications and make decisions via WhatsApp.

### Option A: Meta WhatsApp Cloud API (Recommended & Free Tier)
1. Go to the [Meta for Developers Portal](https://developers.facebook.com/) and create a Business App.
2. In the WhatsApp product section, get your **Temporary Access Token** and **Phone Number ID**.
3. In n8n, create a new **WhatsApp Credential**:
   - Access Token: `EAAG...`
   - Business Account ID: Your WABA ID
4. Free Tier includes **1,000 service conversations per month**.

### Option B: Twilio / Gupshup WhatsApp API
1. Create a Twilio account and activate the **Twilio Sandbox for WhatsApp**.
2. Set Account SID and Auth Token in n8n's Twilio node.

---

## 5. Production Cloud Deployment Guide

### Architecture Option 1: Google Cloud Platform (GCP) *(Recommended)*
1. **FastAPI Backend on Cloud Run**:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/shilpsetu-backend ./backend
   gcloud run deploy shilpsetu-backend \
     --image gcr.io/YOUR_PROJECT_ID/shilpsetu-backend \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated \
     --memory 2Gi \
     --cpu 2
   ```
2. **Media Assets on Google Cloud Storage (GCS)**:
   - Create bucket `shilpsetu-media` in region `asia-south1`.
   - Set environment variables in Cloud Run:
     ```env
     CLOUD_STORAGE_PROVIDER=gcs
     CLOUD_STORAGE_BUCKET=shilpsetu-media
     ```
3. **n8n on Compute Engine (e2-small)**:
   - Run n8n with Docker Compose on a persistent Compute Engine instance with an external static IP.

### Architecture Option 2: AWS Deployment
1. **Backend**: AWS App Runner or ECS Fargate with container image from ECR.
2. **Storage**: AWS S3 bucket (`shilpsetu-media`) with CloudFront CDN distribution.
   ```env
   CLOUD_STORAGE_PROVIDER=s3
   CLOUD_STORAGE_BUCKET=shilpsetu-media
   CLOUD_STORAGE_REGION=ap-south-1
   ```
3. **n8n**: Hosted on an EC2 `t3.small` instance or AWS Elastic Beanstalk.

---

## 6. Testing the Integration End-to-End

### Test 1: Verify Backend Health with n8n Status
```bash
curl http://localhost:8000/health
```
Response:
```json
{
  "status": "healthy",
  "app": "ShilpSetu AI - Virtual Business Manager",
  "version": "1.0.0",
  "ministry": "Ministry of Social Justice and Empowerment (MoSJE)",
  "cloud_and_n8n": {
    "n8n_enabled": true,
    "cloud_storage_provider": "local",
    "n8n_base_url": "http://n8n:5678"
  }
}
```

### Test 2: Simulate Bargain Guard Wholesale Offer (Triggers WhatsApp Alert)
```bash
curl -X POST "http://localhost:8000/api/v1/b2b/negotiate" \
     -H "Content-Type: application/json" \
     -d '{
       "product_id": "CRAFT-NBCFDC-002",
       "buyer_offer_inr": 1200,
       "quantity": 25,
       "base_cost_inr": 1750,
       "craft_category": "Terracotta & Pottery",
       "b2c_price_inr": 2450
     }'
```
*Result*: The backend evaluates the lowball offer, calculates the ₹550/unit loss, and dispatches a background webhook to n8n at `http://n8n:5678/webhook/bargain-guard`, triggering the WhatsApp notification flow.
