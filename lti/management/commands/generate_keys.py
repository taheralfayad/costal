from django.core.management.base import BaseCommand
from Crypto.PublicKey import RSA
from lti.models import Key, KeySet


class Command(BaseCommand):
    help = 'Generate RSA keys for LTI authentication'

    def handle(self, *args, **options):
        self.generate_keys()

    def generate_keys(self):
        keyset = self.get_keyset()
        if not keyset:
            self.stdout.write(self.style.ERROR('Unable to get valid keyset. Exiting.'))
            return

        self.create_keys(keyset)

        self.stdout.write(self.style.SUCCESS(
            'Keys created.\n\n'
            'To add a new registration: \n'
            'Run `python manage.py register`\n'
        ))

    def get_keyset(self):
        all_keysets = KeySet.objects.all()

        self.stdout.write(
            "Would you like to create your new key in a new key set or use an existing one?\n"
            "  1 - Create a new key set\n"
            f"  2 - Use an existing key set ({all_keysets.count()} available)"
        )
        new_or_old = input("Selection number: ")

        if new_or_old == "1":
            self.stdout.write("Creating new key set...")
            selected_keyset = KeySet.objects.create()
            self.stdout.write(self.style.SUCCESS(f"Created new key set: {selected_keyset.id}"))
        elif new_or_old == "2":
            self.stdout.write("Which keyset would you like to use?")
            for keyset in all_keysets:
                self.stdout.write(f"  {keyset.id} - {keyset.keys.count()} keys")

            keyset_id = input("Key Set ID: ")

            selected_keyset = KeySet.objects.filter(id=keyset_id).first()
            if selected_keyset:
                self.stdout.write(self.style.SUCCESS(f"Using key set: {selected_keyset.id}"))
            else:
                self.stdout.write(
                    self.style.ERROR(f"Unable to find keyset with key set ID '{keyset_id}'. Cancelling...")
                )
                return None

        else:
            self.stdout.write(self.style.ERROR(f"Invalid option '{new_or_old}'. Cancelling..."))
            return None

        return selected_keyset

    def create_keys(self, keyset, alg="RS256"):
        self.stdout.write("Starting key generation...")

        key = RSA.generate(4096)

        self.stdout.write("Generating Private Key...")
        private_key = key.exportKey()

        self.stdout.write("Generating Public Key...")
        public_key = key.publickey().exportKey()

        newkey = Key.objects.create(
            public_key=public_key, private_key=private_key, alg=alg
        )

        keyset.keys.add(newkey)
        self.stdout.write(
            self.style.SUCCESS(
                f"Created new Public and Private key #{newkey.id} ({newkey.alg}) "
                f"in key set #{keyset.id}"
            )
        )