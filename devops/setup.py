import os
import boto3
import base64

client = boto3.client("ec2")

USER_DATA_PATH = "devops/user-data.sh"
RELEASE_HASH = os.getenv("COMMIT_TAG")
LAUNCH_TEMPLATE_ID = os.getenv("LAUNCH_TEMPLATE_ID")
DESCRIPTION = "COSTAL Webserver Release: " + RELEASE_HASH
print(f"Using Launch Tepmlate: {LAUNCH_TEMPLATE_ID}")

env_vars = {
    "RELEASE_BUNDLE_NAME": f"{RELEASE_HASH}.zip",
    "RELEASE": RELEASE_HASH,
    "ECR_REPOSITORY": os.getenv('ECR_REPOSITORY'),
    "CANVAS_URL": os.getenv("CANVAS_URL", ""),
    "API_CLIENT_ID": os.getenv("API_CLIENT_ID", ""),
    "API_CLIENT_ID_SECRET": os.getenv("API_CLIENT_ID_SECRET", ""),
    "DB_NAME": os.getenv("DB_NAME", ""),
    "DB_HOST": os.getenv("DB_HOST", ""),
    "DB_USERNAME": os.getenv("DB_USERNAME", ""),
    "DB_PASSWORD": os.getenv("DB_PASSWORD", ""),
    "DB_PORT": os.getenv("DB_PORT", ""),
}

if os.path.exists(USER_DATA_PATH):
    with open(USER_DATA_PATH, "r") as f:
        user_data = f.read()
else:
    print(f"ERROR: {USER_DATA_PATH} not found")
    exit(1)

# Update user-data.sh
env_exports = "\n".join([f"export {key}={value}" for key, value in env_vars.items()])
updated_user_data = user_data.replace("# set env variables", f"# set env variables\n{env_exports}")
encoded_user_data = base64.b64encode(updated_user_data.encode("utf-8")).decode("utf-8")

# Use default as base version
LATEST_VERSION = client.describe_launch_template_versions(
    LaunchTemplateId=LAUNCH_TEMPLATE_ID,
    Filters=[{"Name": "is-default-version", "Values": ["true"]}],
)["LaunchTemplateVersions"][0]

CURRENT_VERSION_NUMBER = LATEST_VERSION["VersionNumber"]
TEMPLATE_TAG_SPECIFICATIONS = LATEST_VERSION["LaunchTemplateData"]["TagSpecifications"]
for spec in TEMPLATE_TAG_SPECIFICATIONS:
    release = None

    for tag in spec["Tags"]:
        if tag["Key"] == "Release":
            release = tag
            break

    if release:
        release["Value"] = RELEASE_HASH
    else:
        spec["Tags"].append({"Key": "Release", "Value": RELEASE_HASH})

launch_template_data = {
    "TagSpecifications": TEMPLATE_TAG_SPECIFICATIONS,
    "UserData": encoded_user_data,
}

# Create the new launch template version
response = client.create_launch_template_version(
    LaunchTemplateId=LAUNCH_TEMPLATE_ID,
    SourceVersion=str(LATEST_VERSION["VersionNumber"]),
    VersionDescription=DESCRIPTION,
    LaunchTemplateData=launch_template_data,
)

version = response["LaunchTemplateVersion"]["VersionNumber"]
response = client.modify_launch_template(
    LaunchTemplateId=LAUNCH_TEMPLATE_ID, DefaultVersion=str(version)
)

print(response)
