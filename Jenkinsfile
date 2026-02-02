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

        stage('Deploy with Helm') {
            steps {
                script {
                    echo "Deploying to Kubernetes..."
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
