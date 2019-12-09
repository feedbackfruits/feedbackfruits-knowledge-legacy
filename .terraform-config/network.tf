resource "aws_vpc" "knowledge_vpc" {
  # name = "knowledge_vpc"
  cidr_block = "172.30.0.0/16"
}

resource "aws_subnet" "knowledge_subnet1" {
  # name = "knowledge_subnet_1"
  vpc_id     = "${aws_vpc.knowledge_vpc.id}"
  cidr_block = "172.30.0.0/24"
  availability_zone = "eu-central-1a"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "knowledge_subnet2" {
  # name = "knowledge_subnet_2"
  vpc_id     = "${aws_vpc.knowledge_vpc.id}"
  cidr_block = "172.30.1.0/24"
  availability_zone = "eu-central-1b"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "knowledge_subnet3" {
  # name = "knowledge_subnet_3"
  vpc_id     = "${aws_vpc.knowledge_vpc.id}"
  cidr_block = "172.30.2.0/24"
  availability_zone = "eu-central-1c"
  map_public_ip_on_launch = true
}

resource "aws_neptune_subnet_group" "knowledge_subnet_group" {
  # name = "knowledge_subnet_group"
  subnet_ids = [
    "${aws_subnet.knowledge_subnet1.id}",
    "${aws_subnet.knowledge_subnet2.id}",
    "${aws_subnet.knowledge_subnet3.id}"
  ]

  lifecycle {
    ignore_changes = [ "description" ]
  }
}

resource "aws_security_group" "knowledge_security_group" {
  name        = "knowledge_security_group"
  description = "Knowledge security group"
  vpc_id      =  "${aws_vpc.knowledge_vpc.id}"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8182
    to_port     = 8182
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks     = ["0.0.0.0/0"]
  }
}
