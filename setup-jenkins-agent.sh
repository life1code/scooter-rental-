#!/bin/bash
# Setup Dev Instance as Jenkins Agent
# Run this on dev instance (3.25.139.98)

set -e

echo "=== Setting up Dev Instance as Jenkins Agent ==="

# 1. Update system
echo "Updating system..."
apt-get update
apt-get upgrade -y

# 2. Install Java (required for Jenkins agent)
echo "Installing Java..."
apt-get install -y openjdk-17-jre-headless

# 3. Install Docker
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
fi

# 4. Install K3s
echo "Installing K3s..."
if ! command -v k3s &> /dev/null; then
    curl -sfL https://get.k3s.io | sh -
    sleep 30
fi

# 5. Install Helm
echo "Installing Helm..."
if ! command -v helm &> /dev/null; then
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

# 6. Install Git
echo "Installing Git..."
apt-get install -y git

# 7. Create Jenkins user
echo "Creating Jenkins user..."
if ! id -u jenkins &> /dev/null; then
    useradd -m -s /bin/bash jenkins
    usermod -aG docker jenkins
    usermod -aG sudo jenkins
    echo "jenkins ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/jenkins
fi

# 8. Setup workspace
echo "Setting up Jenkins workspace..."
mkdir -p /var/jenkins
chown -R jenkins:jenkins /var/jenkins

# 9. Setup SSH for Jenkins user
echo "Setting up SSH..."
mkdir -p /home/jenkins/.ssh
chmod 700 /home/jenkins/.ssh
touch /home/jenkins/.ssh/authorized_keys
chmod 600 /home/jenkins/.ssh/authorized_keys
chown -R jenkins:jenkins /home/jenkins/.ssh

# 10. Configure K3s access for Jenkins user
echo "Configuring K3s access..."
mkdir -p /home/jenkins/.kube
cp /etc/rancher/k3s/k3s.yaml /home/jenkins/.kube/config
chown jenkins:jenkins /home/jenkins/.kube/config
echo "export KUBECONFIG=/home/jenkins/.kube/config" >> /home/jenkins/.bashrc

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. On Jenkins controller, copy SSH public key to this instance:"
echo "   sudo -u jenkins ssh-copy-id jenkins@3.25.139.98"
echo ""
echo "2. Add this instance as an agent in Jenkins:"
echo "   - Name: dev-agent"
echo "   - Host: 3.25.139.98"
echo "   - Remote directory: /var/jenkins"
echo "   - Label: dev-agent"
echo ""
