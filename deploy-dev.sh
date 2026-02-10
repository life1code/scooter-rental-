#!/bin/bash
set -e

echo "=== Deploying to Dev Instance ==="

cd /opt/scooter-rental-dev

# Pull latest changes
echo "Pulling latest changes from feature/host-system..."
git fetch origin
git checkout feature/host-system
git pull origin feature/host-system

# Stop existing containers
echo "Stopping existing containers..."
docker compose down || true

# Build and start containers
echo "Building and starting containers..."
docker compose up -d --build

# Wait for container to be healthy
echo "Waiting for application to start..."
sleep 10

# Check if container is running
if docker ps | grep -q scooter-rental-dev; then
    echo "✅ Deployment successful!"
    echo "Application is running at http://localhost:3000"
    echo "Public URL: https://dev.ceylonrider.com"
else
    echo "❌ Deployment failed!"
    echo "Checking logs..."
    docker compose logs --tail=50
    exit 1
fi

# Show logs
echo ""
echo "Recent logs:"
docker compose logs --tail=20
