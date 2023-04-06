pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                echo 'Building...'
            }
        }
        stage('Execute command on parent') {
            steps {
                script {
                    sshagent(['1c4499aa-ab4c-47ad-86d7-65d364959d66']) {
                        sh "ssh jonathan@localhost 'ls /srv/'"
                    }
                }
            }
        }
    }
}
