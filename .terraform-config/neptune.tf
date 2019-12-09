# Neptune setup
resource "aws_neptune_cluster" "neptune_cluster" {
  cluster_identifier                  = "knowledge-cluster"
  engine                              = "neptune"
  vpc_security_group_ids              = [ "${aws_security_group.knowledge_security_group.id}" ]

}

resource "aws_neptune_cluster_instance" "neptune_instances" {
  count              = 1
  cluster_identifier = "${aws_neptune_cluster.neptune_cluster.id}"
  engine             = "neptune"
  instance_class     = "db.r4.large"

  lifecycle {
    ignore_changes = [ "promotion_tier" ]
  }
}

# Reverse proxy to provide access outside of AWS
resource "aws_instance" "reverse_proxy" {
  ami           = "ami-0eaec5838478eb0ba"
  instance_type = "t2.micro"
  key_name = "${aws_key_pair.knowledge_key_pair.id}"
  subnet_id = "${aws_subnet.knowledge_subnet1.id}"
  vpc_security_group_ids = [ "${aws_security_group.knowledge_security_group.id}" ]

  tags = {
    Name = "neptune-reverse-proxy"
  }


  provisioner "file" {
    content = <<EOF
Listen *:8182

<VirtualHost *:8182>
  ProxyRequests On
  RewriteEngine on

  RewriteRule   ^/reader/(.*)$  http://${aws_neptune_cluster.neptune_cluster.reader_endpoint}:8182/$1 [P]
  RewriteRule   ^/writer/(.*)$  http://${aws_neptune_cluster.neptune_cluster.endpoint}:8182/$1 [P]

  ProxyPass        /    http://${aws_neptune_cluster.neptune_cluster.endpoint}:8182/
  ProxyPassReverse /    http://${aws_neptune_cluster.neptune_cluster.endpoint}:8182/

  <Proxy "http://${aws_neptune_cluster.neptune_cluster.reader_endpoint}:8182/">
    ProxySet connectiontimeout=240 timeout=1024
  </Proxy>

  <Proxy "http://${aws_neptune_cluster.neptune_cluster.endpoint}:8182/">
    ProxySet connectiontimeout=240 timeout=1024
  </Proxy>

  <Location />
    Allow from all
  </Location>
</VirtualHost>
EOF
    destination = "/home/ec2-user/neptune_reverse_proxy.conf"
    connection {
      user = "ec2-user"
      private_key = "${tls_private_key.ssh_private_key.private_key_pem}"
      host = "${aws_instance.reverse_proxy.public_ip}"
    }
  }

  provisioner "remote-exec" {
    connection {
      user = "ec2-user"
      private_key = "${tls_private_key.ssh_private_key.private_key_pem}"
      host = "${aws_instance.reverse_proxy.public_ip}"
    }

    inline = [
      "sudo yum install -y httpd",
      "sudo mv /home/ec2-user/neptune_reverse_proxy.conf /etc/httpd/conf.d/neptune_reverse_proxy.conf",
      "sudo systemctl start httpd"
    ]
  }

}
