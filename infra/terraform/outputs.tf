output "redirector_external_ip" {
  value       = google_compute_instance.redirector.network_interface[0].access_config[0].nat_ip
  description = "External IP of the redirector instance"
}

output "redirector_url" {
  value       = "http://${google_compute_instance.redirector.network_interface[0].access_config[0].nat_ip}"
  description = "HTTP URL of the redirector"
}

output "network_name" {
  value       = google_compute_network.this.name
}

output "subnet_name" {
  value       = google_compute_subnetwork.public.name
}
