from django.core.management.base import BaseCommand
from django.db import IntegrityError
from lti.models import KeySet, Registration


class Command(BaseCommand):
    help = "Register the LTI tool with a platform"

    def handle(self, *args, **options):
        self.add_registration()

    def add_registration(self):
        platform_options = [
            {
                "name": "Local Canvas Platform",
                "url_base": "http://canvas.docker",
                "issuer": "https://canvas.instructure.com",
            },
            {
                "name": "Other Canvas Platform",
                "url_base": "replaceme",
                "issuer": "https://canvas.instructure.com",
            },
        ]

        self.stdout.write("Which platform are you using?")
        for index, platform in enumerate(platform_options, start=1):
            self.stdout.write(f"  {index} - {platform['name']}")

        platform_choice = input("Platform Number: ")

        try:
            platform_choice = int(platform_choice)
            assert platform_choice > 0

            selected_platform = platform_options[platform_choice - 1]
            if platform_choice == len(platform_options):
                self.stdout.write(
                    "Provide your server url. Remove any trailing slashes."
                )
                platform_url = input("Server URL: ")
                selected_platform["url_base"] = platform_url

        except (AssertionError, IndexError, ValueError):
            self.stdout.write(self.style.ERROR(f"Invalid option '{platform_choice}'"))
            return

        self.stdout.write(f"Registering in {selected_platform['name']}...")

        # client_id
        self.stdout.write(
            f"Input the Client ID provided by {selected_platform['name']}s"
        )
        client_id = input("Client ID: ")

        # key_set_id
        self.stdout.write("Which keyset would you like to use?")
        for keyset in KeySet.objects.all():
            self.stdout.write(f"  {keyset.id} - {keyset.keys.count()} keys")

        keyset_id = input("Key Set ID: ")

        selected_keyset = KeySet.objects.filter(id=keyset_id).first()
        if selected_keyset:
            self.stdout.write(
                self.style.SUCCESS(f"Using key set: {selected_keyset.id}")
            )
        else:
            self.stdout.write(
                self.style.ERROR(
                    f"Unable to find keyset with key set ID '{keyset_id}'. Cancelling..."
                )
            )
            return

        try:
            new_reg = Registration.objects.create(
                issuer=selected_platform["issuer"],
                client_id=client_id,
                key_set=selected_keyset,
                platform_login_auth_endpoint=(
                    f"{selected_platform['url_base']}/api/lti/authorize_redirect"
                ),
                platform_service_auth_endpoint=(
                    f"{selected_platform['url_base']}/login/oauth2/token"
                ),
                platform_jwks_endpoint=f"{selected_platform['url_base']}/api/lti/security/jwks",
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f"Created new registration: {new_reg.id}\n"
                    "Don't forget to enable the Client ID!\n\n"
                    "To add a deployment: \n"
                    "Run `python manage.py deploy`\n"
                )
            )
        except IntegrityError:
            self.stdout.write(
                self.style.ERROR(
                    "A registration with that issuer and client_id already exists."
                )
            )
