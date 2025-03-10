import os
import sys

import django
from Crypto.PublicKey import RSA
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError


def setup_enviroment():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "costal.settings")
    django.setup()


def generate_keys():
    from lti.models import Key, KeySet

    def get_keyset():
        all_keysets = KeySet.objects.all()

        print(
            "Would you like to create your new key in a new key set or use an existing one?\n"
            "  1 - Create a new key set\n"
            f"  2 - Use an existing key set ({all_keysets.count()} available)"
        )
        new_or_old = input("Selection number: ")

        if new_or_old == "1":
            print("Creating new key set...")
            selected_keyset = KeySet()
            selected_keyset = KeySet.objects.create()
            print(f"Created new key set: {selected_keyset.id}")
        elif new_or_old == "2":
            print("Which keyset would you like to use?")
            for keyset in all_keysets:
                # TODO: improve keyset details with related registration info
                print(f"  {keyset.id} - {keyset.keys.count()} keys")

            keyset_id = input("Key Set ID: ")

            selected_keyset = KeySet.objects.filter(id=keyset_id).first()
            if selected_keyset:
                print(f"Using key set: {selected_keyset.id}")
            else:
                print(
                    f"Unable to find keyset with key set ID '{keyset_id}'. Cancelling..."
                )
                return None

        else:
            print(f"Invalid option '{new_or_old}'. Cancelling...")
            return None

        return selected_keyset

    def create_keys(keyset, alg="RS256"):
        print("Starting key generation...")

        key = RSA.generate(4096)

        print("Generating Private Key...")
        private_key = key.exportKey()

        print("Generating Public Key...")
        public_key = key.publickey().exportKey()

        newkey = Key.objects.create(
            public_key=public_key, private_key=private_key, alg=alg
        )

        keyset.keys.add(newkey)
        print(
            f"Created new Public and Private key #{newkey.id} ({newkey.alg}) "
            f"in key set #{keyset.id}"
        )

    keyset = get_keyset()
    if not keyset:
        print("Unable to get valid keyset. Exiting.")
        return 1

    create_keys(keyset)

    print(
        "Keys created.\n\n"
        "To add a new registration: \n"
        "- If you are using a makefile, run `make register`\n"
        "- If you are running this script directly, run `python cli.py register`\n"
    )


def add_registration():
    from lti.models import KeySet, Registration

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

    print("Which platform are you using?")
    for index, platform in enumerate(platform_options, start=1):
        print(f"  {index} - {platform['name']}")

    platform_choice = input("Platform Number: ")

    try:
        platform_choice = int(platform_choice)
        assert platform_choice > 0

        selected_platform = platform_options[platform_choice - 1]
        if platform_choice == len(platform_options):
            # Update other platform url base from user input
            print("Provide your server url. Remove any trailing slashes.")
            platform_url = input("Server URL: ")
            selected_platform["url_base"] = platform_url

    except (AssertionError, IndexError, ValueError):
        print(f"Invalid option '{platform_choice}'")
        return

    print(f"Registering in {selected_platform['name']}...")

    # client_id
    print(f"Input the Client ID provided by {selected_platform['name']}s")
    client_id = input("Client ID: ")

    # key_set_id
    print("Which keyset would you like to use?")
    for keyset in KeySet.objects.all():
        # TODO: improve keyset details with related registration info
        print(f"  {keyset.id} - {keyset.keys.count()} keys")

    keyset_id = input("Key Set ID: ")

    selected_keyset = KeySet.objects.filter(id=keyset_id).first()
    if selected_keyset:
        print(f"Using key set: {selected_keyset.id}")
    else:
        print(f"Unable to find keyset with key set ID '{keyset_id}'. Cancelling...")
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

        print(
            f"Created new registration: {new_reg.id}\n"
            "Don't forget to enable the Client ID!\n\n"
            "To add a deployment: \n"
            "- If you are using a makefile, run `make deploy`\n"
            "- If you are running this script directly, run `python cli.py deploy`\n"
        )
    except IntegrityError:
        print("A registration with that issuer and client_id already exists.")
        # TODO: handle duplicate registration case


def add_deployment():
    from lti.models import Deployment, Registration

    print("Which registration would you like to add a deployment for?")
    for registration in Registration.objects.all():
        print(
            f"  {registration.id} - {registration.client_id} {registration.issuer}\n"
            f"      ({registration.deployments.count()} deployments)"
        )
    reg_id = input("Select Registration: ")

    try:
        registration = Registration.objects.get(id=reg_id)
        print(
            f"Provide the new deployment ID to attach to registration {registration.id}"
        )
        deploy_id = input("Deployment ID: ")

        new_deploy = Deployment.objects.create(
            deployment_id=deploy_id, registration=registration
        )

        registration.deployments.add(new_deploy)
        print(f"Added deployment {new_deploy.id} ({new_deploy.deployment_id}).")
    except ObjectDoesNotExist:
        print(f"Unable to find registration with ID '{reg_id}'. Cancelling...")


def main():
    if len(sys.argv) != 2:
        print("Usage: python cli.py <function_name>")
        return

    setup_enviroment()  # Setup Django environment

    function_name = sys.argv[1]
    if function_name == "generate_keys":
        generate_keys()
    elif function_name == "add_registration":
        add_registration()
    elif function_name == "add_deployment":
        add_deployment()
    else:
        print(f"Function '{function_name}' not found.")


if __name__ == "__main__":
    main()
