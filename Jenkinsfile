pipeline {
    agent any

    environment {
        APP_NAME = 'scooter-rental'
        // Use ttl.sh ephemeral registry (no auth required, images last 2h)
        REGISTRY = 'ttl.sh'
        // Unique image tag per build
        IMAGE_TAG = "scooter-rental-${env.BUILD_NUMBER}:2h"
        K8S_NAMESPACE = 'default'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Image') {
            steps {
                script {
                    echo "Building & Pushing to ttl.sh..."
                    def fullImage = "${REGISTRY}/${IMAGE_TAG}"
                    
                    // Build and Push
                    sh "docker build -t ${fullImage} ."
                    sh "docker push ${fullImage}"
                }
            }
        }

        stage('Infrastructure Setup') {
            steps {
                script {
                    echo "Ensuring Cluster Dependencies (CSI Drivers)..."
                    sh """
                        helm repo add secrets-store-csi-driver https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts || true
                        helm repo add aws-mountpoint-s3-csi-driver https://awslabs.github.io/mountpoint-s3-csi-driver || true
                        helm repo update

                        # Install Secrets Store CSI Driver
                        helm upgrade --install csi-secrets-store secrets-store-csi-driver/secrets-store-csi-driver --namespace kube-system --set syncSecret.enabled=true
                        
                        # Install AWS Secrets Manager Provider
                        kubectl apply -f https://raw.githubusercontent.com/aws/secrets-store-csi-driver-provider-aws/main/deployment/aws-provider-installer.yaml

                        # Install S3 CSI Driver
                        helm upgrade --install s3-csi-driver aws-mountpoint-s3-csi-driver/aws-mountpoint-s3-csi-driver --namespace kube-system
                    """
                }
            }
        }

        stage('Deploy with Helm') {
            steps {
                script {
                    echo "Deploying to Kubernetes..."
                    // ttl.sh format: ttl.sh/repo:tag
                    // Here: repo=ttl.sh/scooter-rental-<num>, tag=2h
                    // Or simply passing the full repo and tag split
                    
                    sh """
                        helm upgrade --install ${APP_NAME} ./charts/scooter-rental \
                        --namespace ${K8S_NAMESPACE} \
                        --set image.repository=${REGISTRY}/scooter-rental-${env.BUILD_NUMBER} \
                        --set image.tag=2h \
                        --set image.pullPolicy=Always \
                        --disable-openapi-validation
                    """
                }
            }
        }
    }

    post {
        failure {
            echo "Pipeline failed. Check logs."
        }
    }
}
