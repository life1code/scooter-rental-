pipeline {
    agent {
        label "${env.GIT_BRANCH == 'origin/main' || env.GIT_BRANCH == 'main' ? 'built-in' : 'scooter-dev'}"
    }

    environment {
        // Namespace is always default (separate clusters for prod/dev)
        K8S_NAMESPACE = "default"
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
                    echo "Deploying to Kubernetes in namespace ${K8S_NAMESPACE}..."
                    def isProd = (env.GIT_BRANCH == 'origin/main' || env.GIT_BRANCH == 'main')
                    
                    // Dev uses local K3s, prod uses remote kubeconfig
                    def kubeconfigParam = isProd ? "--kubeconfig remote-kubeconfig.yaml" : ""
                    def valuesParam = isProd ? "" : "-f ./charts/scooter-rental/dev-values.yaml"
                    def nodePortParam = isProd ? "--set service.nodePort=30080 --set adminer.nodePort=30081" : ""
                    
                    // Set KUBECONFIG for K3s on dev agent
                    def kubeconfigEnv = isProd ? "" : "export KUBECONFIG=/etc/rancher/k3s/k3s.yaml && "
                    
                    sh """
                        ${kubeconfigEnv}helm upgrade --install ${APP_NAME} ./charts/scooter-rental \
                        ${kubeconfigParam} \
                        --namespace ${K8S_NAMESPACE} \
                        --set image.repository=${REGISTRY}/scooter-rental-${env.BUILD_NUMBER} \
                        --set image.tag=2h \
                        --set image.pullPolicy=Always \
                        ${nodePortParam} \
                        ${valuesParam} \
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
