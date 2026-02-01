pipeline {
    agent any

    environment {
        // App Name
        APP_NAME = 'scooter-rental'
        // Docker Registry (Replace with your actual registry, e.g., AWS ECR or Docker Hub)
        DOCKER_REGISTRY = 'scooter-rental' 
        // Kubernetes Namespace
        K8S_NAMESPACE = 'default'
        // Image Tag based on Build Number
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image..."
                    // Build image
                    sh "docker build -t ${APP_NAME}:${IMAGE_TAG} ."
                    
                    // Since we are running single-node K3s, we need to import the image 
                    // from Docker (Jenkins) to K3s (containerd)
                    echo "Importing image to K3s..."
                    sh "docker save ${APP_NAME}:${IMAGE_TAG} | sudo k3s ctr images import -"
                }
            }
        }

        stage('Deploy with Helm') {
            steps {
                script {
                    echo "Deploying to Kubernetes..."
                    
                    // Upgrade or Install the chart
                    // We use imagePullPolicy=Never so K3s uses the local image we just imported
                    sh """
                        helm upgrade --install ${APP_NAME} ./charts/scooter-rental \
                        --namespace ${K8S_NAMESPACE} \
                        --set image.repository=${APP_NAME} \
                        --set image.tag=${IMAGE_TAG} \
                        --set image.pullPolicy=Never
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline succeeded!"
        }
        failure {
            echo "Pipeline failed."
        }
    }
}
