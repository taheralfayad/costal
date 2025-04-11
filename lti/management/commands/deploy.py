from django.core.management.base import BaseCommand
from django.core.exceptions import ObjectDoesNotExist
from lti.models import Deployment, Registration


class Command(BaseCommand):
    help = "Add a new LTI deployment to an existing registration"

    def handle(self, *args, **options):
        self.add_deployment()

    def add_deployment(self):
        self.stdout.write("Which registration would you like to add a deployment for?")
        for registration in Registration.objects.all():
            self.stdout.write(
                f"  {registration.id} - {registration.client_id} {registration.issuer}\n"
                f"      ({registration.deployments.count()} deployments)"
            )
        reg_id = input("Select Registration: ")

        try:
            registration = Registration.objects.get(id=reg_id)
            self.stdout.write(
                f"Provide the new deployment ID to attach to registration {registration.id}"
            )
            deploy_id = input("Deployment ID: ")

            new_deploy = Deployment.objects.create(
                deployment_id=deploy_id, registration=registration
            )

            registration.deployments.add(new_deploy)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Added deployment {new_deploy.id} ({new_deploy.deployment_id})."
                )
            )
        except ObjectDoesNotExist:
            self.stdout.write(
                self.style.ERROR(
                    f"Unable to find registration with ID '{reg_id}'. Cancelling..."
                )
            )
