pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
    }

    stages {
        stage('Clone Repo') {
            steps {
                git url: 'https://github.com/Droovian/img-comp-api.git', branch: 'master'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t droovian/img-comp-api .'
            }
        }

        stage('Login to Docker Hub') {
            steps {
                sh 'echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin'
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                sh 'docker push droovian/img-comp-api'
            }
        }

        stage('Deploy to EC2') {
        steps {
            sh '''
            ssh -i ~/.ssh/id_rsa -o StrictHostKeyChecking=no ubuntu@43.205.138.111 "
                docker pull droovian/img-comp-api:latest &&

                docker stop img-comp-api || true &&
                docker rm img-comp-api || true &&

                docker run -d --name img-comp-api -p 3000:3000 \
                    -e AWS_ACCESS_KEY=$AWS_ACCESS_KEY \
                    -e AWS_SECRET_KEY=$AWS_SECRET_KEY \
                    -e S3_BUCKET=$S3_BUCKET \
                    droovian/img-comp-api:latest
            "
            '''
        }
    }

    }
}
