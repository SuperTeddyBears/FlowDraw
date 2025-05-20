#!/bin/bash

docker ps -aq | xargs -r docker stop

docker ps -aq | xargs -r docker rm -f

docker images -q | xargs -r docker rmi -f

docker volume ls -q | xargs -r docker volume rm

docker network ls --format '{{.Name}}' \
  | grep -vE '^(bridge|host|none)$' \
  | xargs -r docker network rm

docker builder prune -af

docker system prune -af --volumes
