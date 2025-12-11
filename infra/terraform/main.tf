locals {
  name       = var.project_name
  tag        = "${var.project_name}-tag"
  ssh_key_md = "${var.ssh_username}:${var.public_key}"
  ssh_cidr   = "${var.home_ip}/32"
}

# Enable Compute API (safe if already enabled)
resource "google_project_service" "compute" {
  project            = var.project_id
  service            = "compute.googleapis.com"
  disable_on_destroy = false
}

# Network
resource "google_compute_network" "this" {
  name                    = "${local.name}-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "public" {
  name          = "${local.name}-subnet"
  ip_cidr_range = "10.20.1.0/24"
  region        = var.region
  network       = google_compute_network.this.id
}

# Firewall: SSH from home / HTTP from anywhere
resource "google_compute_firewall" "ssh_from_home" {
  name    = "${local.name}-ssh-home"
  network = google_compute_network.this.name

  direction     = "INGRESS"
  priority      = 1000
  source_ranges = [local.ssh_cidr]

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  target_tags = [local.tag]
}

resource "google_compute_firewall" "http_from_all" {
  name    = "${local.name}-http-all"
  network = google_compute_network.this.name

  direction     = "INGRESS"
  priority      = 1000
  source_ranges = ["0.0.0.0/0"]

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  target_tags = [local.tag]
}

# Redirector VM
resource "google_compute_instance" "redirector" {
  name         = "${local.name}-vm"
  machine_type = var.machine_type
  zone         = var.zone
  tags         = [local.tag]

  boot_disk {
    initialize_params {
      image = "projects/ubuntu-os-cloud/global/images/family/ubuntu-2204-lts"
      size  = 10
      type  = "pd-balanced"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.public.id
    access_config {} # Ephemeral external IP
  }

  metadata = {
    ssh-keys                 = local.ssh_key_md
    startup-script           = var.enable_docker ? templatefile("${path.module}/../cloud-init/startup_docker.sh.tmpl", { docker_image = var.docker_image }) : file("${path.module}/../cloud-init/startup.sh")
    block-project-ssh-keys   = "true"
  }

  labels = {
    project   = "stiletto"
    component = "redirector"
    safeonly  = "true"
  }

  depends_on = [google_project_service.compute]
}
