#!/bin/bash

COMPOSE_FILE="docker-compose.yml"
DOCKER_COMPOSE="docker compose -f ${COMPOSE_FILE}"
GREEN='\033[0;32m'
RESET='\033[0m'

show_help() {
  echo "Docker Management Script"
  echo ""
  echo "Available commands:"
  echo "  build                   - Build all Docker images"
  echo "  start-attached          - Start the server in attached mode"
  echo "  makemigrations          - Create migrations using Django makemigrations"
  echo "  migrate                 - Run migrations using Django migrate"
  echo "  revertmigration         - Reverts a specific migration (use migration=<migration_name>)"
  echo "  create-superuser        - Create a new Django superuser"
  echo "  test                    - Run automated tests"
  echo "  collectstatic           - Collect static files"
  echo "  generate-keys           - Create new public and private keys"
  echo "  register                - Add a new registration for Templater in a platform"
  echo "  deploy                  - Add a new deployment for Templater"
  echo "  format                  - Run Python code formatter and linter"
  echo "  test-adaptive-learning-model - Test the adaptive learning model"
  echo "  help                    - Show this help message"
}

build() {
  echo "Building Costal images"
  ${DOCKER_COMPOSE} build
}

start_attached() {
  echo -e "${GREEN}Starting Costal in attached mode${RESET}"
  ${DOCKER_COMPOSE} up
}

make_migrations() {
  ${DOCKER_COMPOSE} run --rm web python manage.py makemigrations
}

migrate() {
  ${DOCKER_COMPOSE} run --rm web python manage.py migrate
}

revert_migration() {
  if [ -z "$migration" ]; then
    echo "Error: Migration parameter is missing. Usage: ./script.sh revertmigration migration=<migration_name>"
    exit 1
  fi
  ${DOCKER_COMPOSE} run --rm web python manage.py migrate lti ${migration}
}

create_superuser() {
  ${DOCKER_COMPOSE} run --rm web python manage.py createsuperuser
}

run_tests() {
  ${DOCKER_COMPOSE} run --rm web python manage.py test
}

collect_static() {
  ${DOCKER_COMPOSE} run --rm web python manage.py collectstatic --noinput
}

generate_keys() {
  ${DOCKER_COMPOSE} run --rm web python cli.py generate_keys
}

register() {
  ${DOCKER_COMPOSE} run --rm web python cli.py add_registration
}

deploy() {
  ${DOCKER_COMPOSE} run --rm web python cli.py add_deployment
}

format_code() {
  ${DOCKER_COMPOSE} run --rm web sh -c "black . && flake8 ."
}

test_adaptive_learning_model() {
  ${DOCKER_COMPOSE} run --rm web python ./testing_adaptive_learning.py
}

case "$1" in
  build)
    build
    ;;
  start-attached)   
    start_attached
    ;;
  makemigrations)
    make_migrations
    ;;
  migrate)
    migrate
    ;;
  revertmigration)
    for arg in "$@"; do
      if [[ $arg == migration=* ]]; then
        migration="${arg#*=}"
      fi
    done
    revert_migration
    ;;
  create-superuser)
    create_superuser
    ;;
  test)
    run_tests
    ;;
  collectstatic)
    collect_static
    ;;
  generate-keys)
    generate_keys
    ;;
  register)
    register
    ;;
  deploy)
    deploy
    ;;
  format)
    format_code
    ;;
  test-adaptive-learning-model)
    test_adaptive_learning_model
    ;;
  help|*)
    show_help
    ;;
esac