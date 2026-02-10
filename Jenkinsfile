pipeline {
    agent any

    environment {
        // Use default namespace for main branch, 'dev' for others to prevent production impact
        K8S_NAMESPACE = "${env.GIT_BRANCH == 'origin/main' || env.GIT_BRANCH == 'main' ? 'default' : 'dev'}"
        APP_NAME = "${env.GIT_BRANCH == 'origin/main' || env.GIT_BRANCH == 'main' ? 'scooter-rental' : 'scooter-rental-dev'}"
        
        REGISTRY = 'ttl.sh'
        IMAGE_TAG = "scooter-rental-${env.BUILD_NUMBER}:2h"
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
                        --kubeconfig remote-kubeconfig.yaml \
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
