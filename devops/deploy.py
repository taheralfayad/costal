import os
import shutil
import subprocess
import zipfile
from pathlib import Path
from dotenv import load_dotenv
import boto3

if not Path('devops/.deploy.env').exists():
    print("Create a .deploy.env file")
    exit()

load_dotenv('devops/.deploy.env')

COMMIT_TAG = os.getenv('COMMIT_TAG')
ECR_REPOSITORY = os.getenv('ECR_REPOSITORY')
DEPLOY_BUNDLE_BUCKET = os.getenv('DEPLOY_BUNDLE_BUCKET')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
LAUNCH_TEMPLATE_ID = os.getenv('LAUNCH_TEMPLATE_ID')
CANVAS_URL = os.getenv('CANVAS_URL')
API_CLIENT_ID = os.getenv('API_CLIENT_ID')
API_CLIENT_ID_SECRET = os.getenv('API_CLIENT_ID_SECRET')
DB_NAME = os.getenv('DB_NAME')
DB_HOST = os.getenv('DB_HOST')
DB_USERNAME = os.getenv('DB_USERNAME')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_PORT = os.getenv('DB_PORT')

# Build and tag images
subprocess.run(['docker', 'compose', '-f', 'docker-compose.deploy.yml', 'build'], check=True)
subprocess.run(['docker', 'images'], check=True)
subprocess.run(['docker', 'ps', '-a'], check=True)
subprocess.run(['docker', 'tag', 'costal-web', f'backend:web-{COMMIT_TAG}'], check=True)
subprocess.run(['docker', 'tag', 'costal-adaptive-engine', f'backend:adaptive-engine-{COMMIT_TAG}'], check=True)

# Login to Amazon ECR (Private)
login = subprocess.Popen(
    ['aws', 'ecr', 'get-login-password', '--region', AWS_REGION],
    stdout=subprocess.PIPE
)
docker_login = subprocess.Popen(
    ['docker', 'login', '--username', 'AWS', '--password-stdin', ECR_REPOSITORY],
    stdin=login.stdout
)
login.stdout.close()
docker_login.communicate()

# Tag and push images to ECR
subprocess.run(['docker', 'tag', f'backend:web-{COMMIT_TAG}', f'{ECR_REPOSITORY}:web-{COMMIT_TAG}'], check=True)
subprocess.run(['docker', 'tag', f'backend:adaptive-engine-{COMMIT_TAG}', f'{ECR_REPOSITORY}:adaptive-engine-{COMMIT_TAG}'], check=True)
subprocess.run(['docker', 'push', f'{ECR_REPOSITORY}:web-{COMMIT_TAG}'], check=True)
subprocess.run(['docker', 'push', f'{ECR_REPOSITORY}:adaptive-engine-{COMMIT_TAG}'], check=True)

# Build release bundle and upload to S3
bundle_name = f"{COMMIT_TAG}.zip"
with zipfile.ZipFile(bundle_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipf.write('docker-compose-aws.yml')
    for root, dirs, files in os.walk('devops/'):
        for file in files:
            filepath = os.path.join(root, file)
            zipf.write(filepath)

s3 = boto3.client('s3', region_name=AWS_REGION)
s3.upload_file(bundle_name, DEPLOY_BUNDLE_BUCKET, bundle_name)

# Run setup script for Launch Template
env_setup = os.environ.copy()
env_setup.update({
    'LAUNCH_TEMPLATE_ID': LAUNCH_TEMPLATE_ID,
    'ECR_REPOSITORY': ECR_REPOSITORY,
    'CANVAS_URL': CANVAS_URL,
    'API_CLIENT_ID': API_CLIENT_ID,
    'API_CLIENT_ID_SECRET': API_CLIENT_ID_SECRET,
    'DB_NAME': DB_NAME,
    'DB_HOST': DB_HOST,
    'DB_USERNAME': DB_USERNAME,
    'DB_PASSWORD': DB_PASSWORD,
    'DB_PORT': DB_PORT
})
subprocess.run(['python3', 'devops/setup.py'], check=True, env=env_setup)

# Restart instances via Auto Scaling
autoscaling = boto3.client('autoscaling', region_name=AWS_REGION)
autoscaling.start_instance_refresh(
    AutoScalingGroupName='costal-asg'
)

print("Deployment completed successfully.")
