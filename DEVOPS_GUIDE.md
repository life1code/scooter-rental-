# DevOps Setup Guide: EC2 + Jenkins Agent

This guide explains how to set up an AWS EC2 instance to serve as a Jenkins Agent for building and deploying your Scooter Rental app.

## Prerequisites
- AWS Account
- Jenkins Master server running (can be on another EC2 or local)

## Step 1: Launch EC2 Instance
1.  **AMI**: specific Linux AMI (e.g., Ubuntu 22.04 LTS or Amazon Linux 2023).
2.  **Instance Type**: `t3.small` or `t3.medium` (Building Docker images requires RAM).
3.  **Key Pair**: Create or select a key pair to SSH into the machine.
4.  **Security Group**: Allow SSH (Port 22).

## Step 2: Install Required Tools on EC2

First, ensure your key has the correct permissions:
```bash
chmod 400 scooter-key.pem
```

Then SSH into your new instance:
```bash
ssh -i "scooter-key.pem" ubuntu@3.25.163.22
```

Run the following commands to install dependencies:

### 1. Update System
```bash
sudo apt-get update && sudo apt-get upgrade -y
```

### 2. Install Java (Required for Jenkins Agent)
```bash
sudo apt-get install openjdk-17-jre -y
java -version
```

### 3. Install Docker
```bash
# Install Docker
sudo apt-get install docker.io -y

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Give 'ubuntu' user permission to run Docker
sudo usermod -aG docker ubuntu
sudo usermod -aG docker jenkins # If you create a jenkins user later

# IMPORTANT: Log out and log back in for group changes to take effect!
exit
ssh -i "your-key.pem" ubuntu@your-ec2-ip
```

### 4. Install Kubectl (Kubernetes CLI)
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client
```

### 5. Install Helm
```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version
```

## Step 3: Connect Agent to Jenkins Master
1.  Go to your Jenkins Dashboard -> **Manage Jenkins** -> **Nodes**.
2.  Click **"New Node"**.
3.  Name: `ec2-agent`, Type: **Permanent Agent**.
4.  **Remote root directory**: `/home/ubuntu/jenkins`.
5.  **Labels**: `ec2` (Use this in your Jenkinsfile: `agent { label 'ec2' }`).
6.  **Launch method**: "Launch agent by connecting it to the controller" (or via SSH if preferred).
    *   *Note:* If using "Launch by connecting", you need to download the `agent.jar` on the EC2 and run the command provided by Jenkins.

## Step 4: Configure Kubernetes Access
For the agent to deploy to your cluster (e.g., EKS or Minikube), it needs a `~/.kube/config` file.
1.  Copy your cluster's kubeconfig to `/home/ubuntu/.kube/config` on the EC2 instance.
    ```bash
    mkdir -p ~/.kube
    # Paste your config content into ~/.kube/config
    chmod 600 ~/.kube/config
    ```

## Step 5: Run the Pipeline
1.  Create a new **Pipeline** job in Jenkins.
2.  In "Pipeline Definition", select **"Pipeline script from SCM"**.
3.  SCM: **Git**.
4.  Repository URL: Your GitHub repo URL.
5.  Branch: `*/main`.
6.  Script Path: `Jenkinsfile`.
7.  Save and **Build Now**!

## Step 6: Accessing Jenkins (Setup Complete)
Your Jenkins is now running!

**Jenkins URL**: `http://3.25.163.22:8080`
**Initial Admin Password**: `829634c21f11418ca45cd6ab561d2da0`

### Pipeline Configuration
1.  **Install Plugins**: Install "Kubernetes CLI" and "Docker Pipeline" plugins.
2.  **Create Pipeline**: Use the steps in "Step 5" above. Use repository: `https://github.com/life1code/scooter-rental-.git`.

## Step 7: Accessing Your App
Once the pipeline deploys successfully:
**App URL**: `http://3.25.163.22:30080` or `https://rydex.ceilao.com`

## Database (RDS)
Your Database `scooter-db` is active.
Host: `scooter-db.cyhsgau6y5r0.ap-southeast-2.rds.amazonaws.com`
User: `scooter_admin`
Pass: `scooter_password_123`

