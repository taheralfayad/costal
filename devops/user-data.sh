#!/bin/bash
set -x
exec > >(tee /var/log/user-data.log|logger -t user-data ) 2>&1
echo BEGIN
date '+%Y-%m-%d %H:%M:%S'

# set env variables
export RELEASE_BUNDLE_NAME=
export ECR_REPOSITORY=
export RELEASE=

# pull release bundle from s3 and cd into project directory
aws s3 cp s3://costal-release-bucket/$RELEASE_BUNDLE_NAME /home/ec2-user/costal/
cd /home/ec2-user/costal/

# unzip and remove .zip file
unzip /home/ec2-user/costal/$RELEASE_BUNDLE_NAME -d /home/ec2-user/costal
rm $RELEASE_BUNDLE_NAME

# update yum and install docker
sudo yum update -y
sudo yum install -y docker

# install docker-compose plugin
sudo curl -L https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-compose-plugin-2.6.0-3.el7.x86_64.rpm -o ./compose-plugin.rpm
sudo yum install ./compose-plugin.rpm -y

# give docker user necessary premissions
sudo usermod -aG docker $USER
newgrp docker

# start docker daemon
sudo systemctl enable docker
sudo systemctl start docker

# create .env
touch .env

# login to ecr
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REPOSITORY

# start docker compose
sudo docker compose -f docker-compose-aws.yml up