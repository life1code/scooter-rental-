#!/bin/bash
set -e

echo "Installing Secrets Store CSI Driver..."
helm repo add secrets-store-csi-driver https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts
helm repo update
helm upgrade --install csi-secrets-store secrets-store-csi-driver/secrets-store-csi-driver --namespace kube-system --set syncSecret.enabled=true

echo "Installing AWS Secrets Manager Provider..."
kubectl apply -f https://raw.githubusercontent.com/aws/secrets-store-csi-driver-provider-aws/main/deployment/installer.yaml

echo "Installing AWS S3 CSI Driver (if not already present)..."
# Using the aws-mountpoint-s3-csi-driver which is standard for EKS
helm repo add aws-mountpoint-s3-csi-driver https://awslabs.github.io/mountpoint-s3-csi-driver
helm repo update
helm upgrade --install s3-csi-driver aws-mountpoint-s3-csi-driver/aws-mountpoint-s3-csi-driver --namespace kube-system

echo "Cluster dependencies installed successfully!"
