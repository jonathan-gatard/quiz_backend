pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                script {
                    sshagent(['1c4499aa-ab4c-47ad-86d7-65d364959d66']) {
                        sh "ssh jonathan@localhost 'cd /srv'"
                        sh "ssh jonathan@localhost 'docker-compose build quiz_backend'"
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    sshagent(['1c4499aa-ab4c-47ad-86d7-65d364959d66']) {
                        sh "ssh jonathan@localhost 'cd /srv'"
                        sh "ssh jonathan@localhost 'docker-compose up -d quiz_backend'"
                    }
                }
            }
        }
    }
}
