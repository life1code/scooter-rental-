#!/bin/bash
set -e

# 1. Update and Install Basic Tools
echo "Updating system..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl wget unzip git

# 2. Install Docker
echo "Installing Docker..."
sudo apt-get install -y docker.io
sudo usermod -aG docker ubuntu
sudo systemctl enable docker
sudo systemctl start docker
sudo chmod 666 /var/run/docker.sock

# 3. Install K3s (Lightweight Kubernetes)
echo "Installing K3s..."
curl -sfL https://get.k3s.io | sh -
# Make kubeconfig accessible to ubuntu user
sudo chmod 644 /etc/rancher/k3s/k3s.yaml
mkdir -p /home/ubuntu/.kube
sudo cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config
sudo chown ubuntu:ubuntu /home/ubuntu/.kube/config
echo "KUBECONFIG=~/.kube/config" >> /home/ubuntu/.bashrc

# 4. Install Helm
echo "Installing Helm..."
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# 5. Install Java (for agents if needed locally)
sudo apt-get install -y openjdk-17-jre

# 6. Run Jenkins (Dockerized)
echo "Starting Jenkins..."
# We mount docker sock so Jenkins can spawn sibling containers (Docker-in-Docker equivalent)
sudo docker run -d \
  --name jenkins \
  --restart always \
  -p 8080:8080 -p 50000:50000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v jenkins_home:/var/jenkins_home \
  -v /home/ubuntu/.kube:/var/jenkins_home/.kube \
  jenkins/jenkins:lts

echo "Setup Complete! Jenkins is running on port 8080."
echo "Initial Admin Password:"
sleep 10
sudo docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
