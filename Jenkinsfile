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
                    agent {
                        docker {
                            reuseNode true
                            image "docker-default"
                            args '-v /var/run/docker.sock:/var/run/docker.sock'
                        }
                    }
                    steps {
                        dir('diagramflow') {
                          sh 'docker-compose build'
                          sh 'docker-compose up -d'
                        }
                    }
                }
                stage('Clean Docker') {
                    steps{
                        script {
                            def userInput = input(
                                message: 'Do you want to stop the containers now?',
                                parameters: [
                                    choice(choices: ['Yes', 'No'], defaultValue: 'No'  )
                                ],
                                timeout: 1800
                            )

                            if (userInput == 'Yes') {
                                sh 'docker-compose down'
                            } else {
                                sleep 3600
                                echo 'Zatrzymanie i usunięcie kontenerów po godzinie...'
                                sh 'docker-compose down'
                            }
                        }
                    }
                }
            }
        }
    }
}