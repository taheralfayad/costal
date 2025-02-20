#!/usr/bin/python

import json
import os

import boto3

client = boto3.client("secretsmanager", "us-east-1")
secret_arn = os.getenv("SECRET_ARN")

if not secret_arn:
    raise KeyError("Environment variable `SECRET_ARN` must be set.")

secret_value = client.get_secret_value(SecretId=secret_arn)["SecretString"]
secrets = json.loads(secret_value)

with open(".env", "w+") as f:
    for key, value in secrets.items():
        f.write("%s=%s\n" % (key, value))

print("Successfully wrote .env file and keys")
