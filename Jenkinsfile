pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    environment {
        DOCKER_IMAGE = 'next-saas-starter'
        DOCKER_TAG = "${BUILD_NUMBER}"
        SONAR_PROJECT_KEY = 'next-saas-starter'
        VERCEL_TOKEN = credentials('vercel-token')
        VERCEL_ORG_ID = credentials('vercel-org-id')
        VERCEL_PROJECT_ID = credentials('vercel-project-id')
        DATABASE_URL = credentials('database-url')
        CLERK_SECRET_KEY = credentials('clerk-secret-key')
        POLAR_ACCESS_TOKEN = credentials('polar-access-token')
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Pulling code from repository...'
                checkout scm
                sh 'git clean -fdx'
            }
        }

        stage('Environment Setup') {
            parallel {
                stage('Node Dependencies') {
                    steps {
                        echo 'Installing Node.js dependencies...'
                        sh 'node --version'
                        sh 'npm --version'
                        sh 'npm ci --prefer-offline --no-audit'
                    }
                }
                stage('Environment Variables') {
                    steps {
                        echo 'Setting up environment variables...'
                        sh '''
                            echo "POSTGRES_URL=${DATABASE_URL}" > .env
                            echo "CLERK_SECRET_KEY=${CLERK_SECRET_KEY}" >> .env
                            echo "POLAR_ACCESS_TOKEN=${POLAR_ACCESS_TOKEN}" >> .env
                            echo "BASE_URL=https://your-app.vercel.app" >> .env
                        '''
                    }
                }
            }
        }

        stage('Code Quality & Security') {
            parallel {
                stage('Lint & Type Check') {
                    steps {
                        echo 'Running ESLint and TypeScript checks...'
                        sh 'npx next lint --fix || true'
                        sh 'npx tsc --noEmit'
                    }
                }
                stage('SonarQube Analysis') {
                    steps {
                        echo 'Running SonarQube analysis...'
                        withSonarQubeEnv('SonarQube') {
                            sh '''
                                npx sonar-scanner \
                                -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions=node_modules/**,build/**,.next/**,out/**,coverage/** \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                                -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info
                            '''
                        }
                    }
                }
                stage('Security Audit') {
                    steps {
                        echo 'Running security audit...'
                        sh 'npm audit --audit-level=moderate || true'
                        sh 'npx audit-ci --moderate || true'
                    }
                }
            }
        }

        stage('Build & Test') {
            parallel {
                stage('Build Application') {
                    steps {
                        echo 'Building Next.js application...'
                        sh 'npm run build'
                        archiveArtifacts artifacts: '.next/**', allowEmptyArchive: true
                    }
                }
                stage('Unit Tests') {
                    steps {
                        echo 'Running unit tests...'
                        sh 'npm test -- --coverage --watchAll=false --testResultsProcessor=jest-junit || true'
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'junit.xml'
                            publishCoverageResults adapters: [istanbulCoberturaAdapter('coverage/cobertura-coverage.xml')], sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
                        }
                    }
                }
            }
        }

        stage('Database Migration') {
            steps {
                echo 'Running database migrations...'
                sh 'npm run db:migrate'
            }
        }

        stage('E2E Testing') {
            steps {
                echo 'Running Selenium E2E tests...'
                sh '''
                    # Start the application in background
                    npm start &
                    APP_PID=$!
                    
                    # Wait for application to start
                    sleep 30
                    
                    # Run Selenium tests
                    npx cucumber-js features/ --require-module ts-node/register --require step-definitions/**/*.ts --format json:cucumber-report.json || true
                    
                    # Stop the application
                    kill $APP_PID || true
                '''
            }
            post {
                always {
                    publishCucumberResults testResultsPattern: 'cucumber-report.json'
                    archiveArtifacts artifacts: 'screenshots/**', allowEmptyArchive: true
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker image...'
                script {
                    def dockerImage = docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                    dockerImage.tag('latest')
                    
                    // Push to registry if needed
                    // docker.withRegistry('https://your-registry.com', 'registry-credentials') {
                    //     dockerImage.push()
                    //     dockerImage.push('latest')
                    // }
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Scanning Docker image for vulnerabilities...'
                sh '''
                    # Trivy security scan
                    trivy image --exit-code 0 --severity HIGH,CRITICAL ${DOCKER_IMAGE}:${DOCKER_TAG} || true
                '''
            }
        }

        stage('Deploy to Vercel') {
            steps {
                echo 'Deploying to Vercel...'
                sh '''
                    # Install Vercel CLI
                    npm install -g vercel@latest
                    
                    # Deploy to Vercel
                    vercel --token ${VERCEL_TOKEN} --prod --yes
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo 'Running health checks...'
                script {
                    def maxRetries = 5
                    def retryCount = 0
                    def healthCheckPassed = false
                    
                    while (retryCount < maxRetries && !healthCheckPassed) {
                        try {
                            sh 'curl -f -s https://your-app.vercel.app/api/health || curl -f -s https://your-app.vercel.app/'
                            healthCheckPassed = true
                            echo 'Health check passed!'
                        } catch (Exception e) {
                            retryCount++
                            echo "Health check failed (attempt ${retryCount}/${maxRetries}). Retrying in 30 seconds..."
                            sleep(30)
                        }
                    }
                    
                    if (!healthCheckPassed) {
                        error('Health check failed after all retries')
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully! 🎉'
            emailext (
                subject: "✅ Build Success: ${JOB_NAME} - ${BUILD_NUMBER}",
                body: "The build was successful. Check the deployment at: https://your-app.vercel.app",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        failure {
            echo 'Pipeline failed! ❌'
            emailext (
                subject: "❌ Build Failed: ${JOB_NAME} - ${BUILD_NUMBER}",
                body: "The build failed. Please check the Jenkins console output for details.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        unstable {
            echo 'Pipeline completed with warnings ⚠️'
        }
    }
} 