//veracode
//blackduck
//sonercube

//--testy


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
                    steps{
                        script {
                            timeout(time: 30, unit: 'MINUTES') {
                                def userInput = input(
                                    message: 'Do you want to stop the containers now?',
                                    parameters: [
                                        choice(choices: ['Yes', 'No'], description: 'Choose whether to stop the containers now.')
                                    ]
                                )

                                if (userInput == 'Yes') {
                                    sh 'sudo docker compose down'
                                } else {
                                    sleep 3600
                                    echo 'Zatrzymanie i usunięcie kontenerów po godzinie...'
                                    sh 'sudo docker compose down'
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}