docker ps -aq | ForEach-Object { docker stop $_ } 2>$null

docker ps -aq | ForEach-Object { docker rm -f $_ } 2>$null

docker images -q | ForEach-Object { docker rmi -f $_ } 2>$null

docker volume ls -q | ForEach-Object { docker volume rm $_ } 2>$null

$defaultNets = @("bridge", "host", "none")
docker network ls --format "{{.Name}}" | Where-Object { $defaultNets -notcontains $_ } | ForEach-Object { docker network rm $_ } 2>$null

docker builder prune -af
docker system prune -af --volumes
