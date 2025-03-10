# Use an official Python runtime as a parent image
FROM nikolaik/python-nodejs:python3.10-nodejs22-slim
ARG REQUIREMENTS

# Set environment variables
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /app/

COPY /lti/frontend/package.json /app/

RUN npm install --verbose --force

# Add this line to install the necessary libraries
RUN apt-get update \
  # dependencies for building Python packages
  && apt-get install -y --no-install-recommends \
  build-essential \
  # cleaning up unused files
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y \
  build-essential \
  cmake \
  g++ \
  && rm -rf /var/lib/apt/lists/*


RUN apt-get update && apt-get install -y git

COPY ./requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY ./ /app/

RUN python manage.py collectstatic --noinput