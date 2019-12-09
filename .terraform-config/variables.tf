variable "aws_access_key" {
  default = ""
  description = "AWS access key"
}
variable "aws_secret_key" {
  default = ""
  description = "AWS secret key"
}
variable "aws_region" {
  default = "eu-central-1"
  description = "AWS region e.g. us-east-1 (Please specify a region supported by the Fargate launch type)"
}
# variable "aws_resource_prefix" {
#   description = "Prefix to be used in the naming of some of the created AWS resources e.g. demo-webapp"
# }
