pipeline {
    agent none

    options {
        parallelsAlwaysFailFast()
        disableConcurrentBuilds()
    }

    stages {
        stage('Linux') {
            agent any
            when {
                beforeAgent true
                anyOf {
                    branch pattern: '.*dev.*', comparator: 'REGEXP'
                    branch 'master'
                    changeRequest()
                }
            }
            stages {
                stage('Build Docker Image') {
                    steps {
                        dir('diagramflow') {
                            sh 'sudo docker compose build'
                            sh 'sudo docker compose up -d'
                        }
                    }
                }
                stage('Clean Docker') {
                    steps {
                        script {
                            timeout(time: 30, unit: 'MINUTES') {
                                def userInput = input(
                                    message: 'Do you want to stop the containers now?',
                                    parameters: [
                                        choice(name: 'StopContainers', choices: ['Yes', 'No'], description: 'Choose whether to stop the containers now.')
                                    ]
                                )
                                
                                if (userInput == 'Yes') {
                                    sh 'docker stop $(docker ps -aq) || true'
                                    sh 'docker rm $(docker ps -aq) || true'
                                    sh 'docker rmi $(docker images -q) || true'
                                } else {
                                    sleep 3600
                                    echo 'Cleaning up after an hour...'
                                    sh 'docker stop $(docker ps -aq) || true'
                                    sh 'docker rm $(docker ps -aq) || true'
                                    sh 'docker rmi $(docker images -q) || true'
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
