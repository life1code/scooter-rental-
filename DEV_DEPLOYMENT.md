# Standalone Dev Instance Deployment Guide

## Quick Start

SSH into the dev instance and run these commands:

```bash
# 1. Copy the setup script to the dev instance
scp -i ~/.ssh/your-key.pem setup-dev-instance.sh ubuntu@3.25.139.98:~

# 2. SSH into the dev instance
ssh -i ~/.ssh/your-key.pem ubuntu@3.25.139.98

# 3. Run the setup script
chmod +x setup-dev-instance.sh
./setup-dev-instance.sh

# 4. Add secrets to .env.production
nano /opt/scooter-rental-dev/.env.production

# 5. Deploy the application
cd /opt/scooter-rental-dev
docker compose up -d

# 6. Install SSL certificate (optional, for HTTPS)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d dev.ceylonrider.com
```

## Required Secrets

Add these to `/opt/scooter-rental-dev/.env.production`:

```env
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
RESEND_API_KEY=your-resend-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET_NAME=amzn-s3-scooter-bucket
AWS_S3_BACKUP_BUCKET_NAME=your-backup-bucket
AWS_REGION=ap-southeast-2
```

## DNS Configuration

Update Cloudflare DNS:
- Type: A
- Name: dev
- Content: `3.25.139.98`
- Proxy: Enabled (orange cloud)

## Deployment

For future deployments:

```bash
cd /opt/scooter-rental-dev
./deploy-dev.sh
```

## Troubleshooting

**Check container status:**
```bash
docker ps
docker compose logs -f
```

**Restart the application:**
```bash
cd /opt/scooter-rental-dev
docker compose restart
```

**View Nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

## Architecture

```
Internet → Cloudflare → dev.ceylonrider.com (3.25.139.98)
                              ↓
                          Nginx (port 80/443)
                              ↓
                      Docker Container (port 3000)
                              ↓
                      Dev RDS Database
```
