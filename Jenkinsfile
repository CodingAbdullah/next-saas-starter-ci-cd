pipeline {
    agent any

    environment {
        // Define your environment variables here or load from a file
        NODE_ENV = 'production'
        // Example: API_KEY = credentials('your-jenkins-secret-id')
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Pulling code from repository...'
                checkout scm
            }
        }

        stage('Setup Environment') {
            steps {
                echo 'Setting up Node.js and dependencies...'
                // Install Node.js if not present, or use Jenkins NodeJS plugin
                sh 'node -v || nvm install 18'
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                echo 'Building the application...'
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                // Adjust to your test command
                sh 'npm test'
            }
            post {
                always {
                    junit '**/test-results.xml' // If you use JUnit XML output
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                // Add your deployment script/command here
                // Example: sh './deploy.sh'
            }
        }

        stage('Confirm') {
            steps {
                echo 'Confirming deployment...'
                // Add health check or smoke test here
                // Example: sh 'curl -f https://your-app-url/health'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed.'
        }
        always {
            cleanWs()
        }
    }
} 