FROM python:3.12-slim

WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Add this line to install the necessary libraries
RUN apt-get update \
  # dependencies for building Python packages
  && apt-get install -y --no-install-recommends \
  build-essential \
  # cleaning up unused files
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y git

# Install the dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
