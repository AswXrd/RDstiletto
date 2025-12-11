variable "project_id" {
  type        = string
  description = "GCP Project ID"
}

variable "region" {
  type        = string
  default     = "asia-northeast3"
  description = "GCP region (e.g., asia-northeast3)"
}

variable "zone" {
  type        = string
  default     = "asia-northeast3-a"
  description = "GCP zone (e.g., asia-northeast3-a)"
}

variable "project_name" {
  type        = string
  default     = "stiletto-redirector"
  description = "Resource name prefix"
}

variable "home_ip" {
  type        = string
  description = "User's home public IPv4, no CIDR (e.g., 203.0.113.45)"
  validation {
    condition     = can(regex("^([0-9]{1,3}\\.){3}[0-9]{1,3}$", var.home_ip))
    error_message = "home_ip must be an IPv4 address like 203.0.113.45"
  }
}

variable "public_key" {
  type        = string
  description = "SSH public key material (ssh-ed25519 ... or ssh-rsa ...)"
}

variable "ssh_username" {
  type        = string
  default     = "stiletto"
  description = "Linux username to associate with the SSH public key"
}

variable "machine_type" {
  type        = string
  default     = "e2-micro"
  description = "GCE machine type"
}

variable "tags" {
  type        = map(string)
  default     = {
    Project   = "Stiletto"
    Component = "Redirector"
    NoMisuse  = "true"
  }
}


variable "enable_docker" {
  type        = bool
  default     = false
  description = "If true, install Docker on the VM and run a container on port 80"
}

variable "docker_image" {
  type        = string
  default     = "nginx:stable"
  description = "Container image to run when enable_docker=true"
}
