import os
import boto3
import base64

client = boto3.client("ec2")

RELEASE_HASH = os.getenv("COMMIT_TAG")
LAUNCH_TEMPLATE_ID = os.getenv("LAUNCH_TEMPLATE_ID")
DESCRIPTION = "COSTAL Webserver Release: " + RELEASE_HASH
print(f"Using Launch Tepmlate: {LAUNCH_TEMPLATE_ID}")

# Update user_data.sh
if os.path.exists("user_data.sh"):
    with open("user_data.sh", "r") as f:
        user_data = f.read()
    encoded_user_data = base64.b64encode(user_data.encode("utf-8")).decode("utf-8")
else:
    print(f"ERROR: user_data.sh not found")
    encoded_user_data = None

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