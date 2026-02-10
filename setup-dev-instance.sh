#!/bin/bash
set -e

echo "=== Scooter Rental Dev Instance Setup ==="
echo "This script will set up the dev environment on 3.25.139.98"

# Update system
echo "Updating system packages..."
sudo apt-get update

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
else
    echo "Docker already installed"
fi

# Install Docker Compose if not present
if ! command -v docker compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo apt-get install -y docker-compose-plugin
else
    echo "Docker Compose already installed"
fi

# Install Nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt-get install -y nginx
else
    echo "Nginx already installed"
fi

# Install Git if not present
if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    sudo apt-get install -y git
else
    echo "Git already installed"
fi

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /opt/scooter-rental-dev
sudo chown ubuntu:ubuntu /opt/scooter-rental-dev
cd /opt/scooter-rental-dev

# Clone repository if not exists
if [ ! -d ".git" ]; then
    echo "Cloning repository..."
    git clone https://github.com/life1code/scooter-rental-.git .
fi

# Checkout feature branch
echo "Checking out feature/host-system branch..."
git fetch origin
git checkout feature/host-system
git pull origin feature/host-system

# Create .env.production file
echo "Creating .env.production file..."
cat > .env.production << 'EOF'
DATABASE_URL=postgresql://scooter_admin:ScooterPass2026@scooter-db.c3gocgi6okg2.ap-southeast-2.rds.amazonaws.com:5432/postgres?sslmode=require
NEXTAUTH_URL=https://dev.ceylonrider.com
NEXT_PUBLIC_BASE_URL=https://dev.ceylonrider.com
NODE_ENV=production
EOF

echo "Please add the following secrets to .env.production:"
echo "  - NEXTAUTH_SECRET"
echo "  - GOOGLE_CLIENT_ID"
echo "  - GOOGLE_CLIENT_SECRET"
echo "  - RESEND_API_KEY"
echo "  - AWS_ACCESS_KEY_ID"
echo "  - AWS_SECRET_ACCESS_KEY"
echo "  - AWS_S3_BUCKET_NAME"
echo "  - AWS_S3_BACKUP_BUCKET_NAME"

# Copy docker-compose file
echo "Setting up Docker Compose..."
cp docker-compose.dev.yml docker-compose.yml

# Configure Nginx
echo "Configuring Nginx..."
sudo cp nginx-dev.conf /etc/nginx/sites-available/dev.ceylonrider.com
sudo ln -sf /etc/nginx/sites-available/dev.ceylonrider.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Add the missing secrets to /opt/scooter-rental-dev/.env.production"
echo "2. Update Cloudflare DNS: dev.ceylonrider.com -> 3.25.139.98"
echo "3. Run: cd /opt/scooter-rental-dev && docker compose up -d"
echo "4. Install SSL certificate: sudo certbot --nginx -d dev.ceylonrider.com"
echo ""
