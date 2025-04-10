#!/bin/bash
set -x
exec > >(tee /var/log/user-data.log|logger -t user-data ) 2>&1
echo BEGIN
date '+%Y-%m-%d %H:%M:%S'

# get release information from pipeline
source /etc/environment

# set env variables


# pull release bundle from s3 and cd into project directory
aws s3 cp s3://costal-release-bucket/$RELEASE_BUNDLE_NAME /home/ec2-user/costal/
cd /home/ec2-user/costal/

# create .env using the exported variables
cat << EOF > /home/ec2-user/costal/.env
DB_NAME=${DB_NAME}
DB_HOST=${DB_HOST}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD='${DB_PASSWORD}'
DB_PORT=${DB_PORT}
RELEASE_BUNDLE_NAME=${RELEASE_BUNDLE_NAME}
ECR_REPOSITORY=${ECR_REPOSITORY}
RELEASE=${RELEASE}
CANVAS_URL=${CANVAS_URL}
API_CLIENT_ID=${API_CLIENT_ID}
API_CLIENT_ID_SECRET=${API_CLIENT_ID_SECRET}
AWS_ACCESS_KEY=${AWS_ACCESS_KEY_ID}
AWS_SECRET_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_REGION=${AWS_REGION}
EOF

# unzip and remove .zip file
unzip /home/ec2-user/costal/$RELEASE_BUNDLE_NAME -d /home/ec2-user/costal
rm $RELEASE_BUNDLE_NAME

# update yum and install docker
sudo yum update -y
sudo yum install -y docker

# install docker-compose plugin
sudo curl -L https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-compose-plugin-2.6.0-3.el7.x86_64.rpm -o ./compose-plugin.rpm
sudo yum install ./compose-plugin.rpm -y

# start docker daemon
systemctl enable docker
systemctl start docker

# create .env
touch .env

# login to ecr
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws

# start docker compose
docker compose -f docker-compose-aws.yml up