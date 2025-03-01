COMPOSE_FILE=docker-compose.yml
DOCKER_COMPOSE=docker compose -f $(COMPOSE_FILE)

default: build

#================================================================================
# Managing the Docker environment (Building and Starting)
#================================================================================
build: ## Build all Docker images
	@echo "Building Costal images"
	@$(DOCKER_COMPOSE) build

start-attached: ## Start the server in attached mode
	@echo "${GREEN}Starting Costal in attached mode${RESET}"
	$(DOCKER_COMPOSE) up

#==============================================
# Application management commands
#==============================================

makemigrations: ## Create migrations using the Django `makemigrations` management command
	$(DOCKER_COMPOSE) run --rm web python manage.py makemigrations

migrate: ## Run migrations using the Django `migrate` management command
	$(DOCKER_COMPOSE) run --rm web python manage.py migrate

revertmigration: ## Reverts a specific migration. Example: make migration=0001_initial revertmigration. To revert all migrations, use migration=zero
	@$(DOCKER_COMPOSE) run --rm web python manage.py migrate lti $(migration)

create-superuser: ## Create a new superuser using the Django `createsuperuser` management command
	$(DOCKER_COMPOSE) run --rm web python manage.py createsuperuser
	
test: ## Run automated tests
	$(DOCKER_COMPOSE) run --rm web python manage.py test

collectstatic: ## Collect static files
	@$(DOCKER_COMPOSE) run --rm web python manage.py collectstatic --noinput

generate-keys: ## Create new public and private keys and assign them to a keyset
	${DOCKER_COMPOSE} run --rm web python cli.py generate_keys

register: ## Add a new registration for Templater in a platform
	${DOCKER_COMPOSE} run --rm web python cli.py add_registration

deploy: ## Add a new deployment for Templater to an existing registration
	${DOCKER_COMPOSE} run --rm web python cli.py add_deployment

test-adaptive-learning-model:
	$(DOCKER_COMPOSE) run --rm web python ./testing_adaptive_learning.py