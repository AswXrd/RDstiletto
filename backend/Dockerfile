# --- Build backend image with Python, Terraform, and Google Cloud CLI ---
FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install system deps, Terraform, and gcloud CLI
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl ca-certificates gnupg unzip apt-transport-https lsb-release && \
    rm -rf /var/lib/apt/lists/*

# HashiCorp APT (Terraform)
RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
      https://apt.releases.hashicorp.com $(. /etc/os-release && echo $VERSION_CODENAME) main" \
      > /etc/apt/sources.list.d/hashicorp.list

# Google Cloud CLI APT
RUN curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] \
      https://packages.cloud.google.com/apt cloud-sdk main" \
      > /etc/apt/sources.list.d/google-cloud-sdk.list

RUN apt-get update && apt-get install -y --no-install-recommends \
      terraform google-cloud-cli && \
    rm -rf /var/lib/apt/lists/*

# App setup
WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy app code
COPY main.py /app/main.py

# # Copy TF template into image
# COPY tf /app/tf_template

# Create data dir for TF and entrypoint
RUN mkdir -p /data/tf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
