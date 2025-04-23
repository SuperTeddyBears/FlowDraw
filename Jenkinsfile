pipeline {
    agent none

    options {
        parallelsAlwaysFailFast()
        disableConcurrentBuilds()
    }

    stages {
        stage('Windows') {
            agent {
                label 'windows'
            }
            when {
                beforeAgent true
                anyOf {
                    branch pattern: '.*dev.*', comparator: 'REGEXP'
                    branch 'master'
                    changeRequest()
                }
            }
            stages {
                stage('Build application') {
                    agent {
                        docker {
                            image ".../jenkins-build-containers-prod:ve-services-windows"
                        }
                    }
                    steps {
                        dir('diagramflow/deployment') {
                          powershell './build.ps1'
                        }
                    }
                }
            }
        }
    }
}