resource "aws_cloudwatch_log_group" "log_group" {
  name = "/ecs/knowledge-dbpedia-spotlight"
  retention_in_days = 30
}

resource "aws_ecs_task_definition" "spotlight_task_definition" {
  family                = "knowledge-dbpedia-spotlight"
  cpu = 2048
  memory = 10240
  network_mode = "awsvpc"
  requires_compatibilities = [ "FARGATE" ]
  execution_role_arn = "${aws_iam_role.spotlight_execution_role.arn}"

  container_definitions = jsonencode(list({
    name: "knowledge-dbpedia-spotlight",
    image: "dbpedia/spotlight-english:latest",
    essential: true,
    entryPoint: ["sh", "-c"],
    command: [
      "spotlight.sh"
    ],
    portMappings: [
      {
        containerPort: 80,
        hostPort: 80
      }
    ],
    logConfiguration: {
      logDriver: "awslogs",
      options: {
        "awslogs-group": "/ecs/knowledge-dbpedia-spotlight",
        "awslogs-region": "eu-central-1",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }))
}

resource "aws_ecs_service" "knowledge_spotlight_service" {
  name            = "knowledge_spotlight_service"
  cluster         = "${aws_ecs_cluster.knowledge_spotlight_cluster.id}"
  task_definition = "${aws_ecs_task_definition.spotlight_task_definition.arn}"

  desired_count = 1
  deployment_minimum_healthy_percent = "100"
  deployment_maximum_percent = "200"

  launch_type         = "FARGATE"

  network_configuration {
      assign_public_ip = true
      # TODO: Fix this
      security_groups = [
        aws_security_group.knowledge_security_group.id
      ]
      # TODO: Fix this
      subnets = [
        "${aws_subnet.knowledge_subnet1.id}"
      ]
  }

  load_balancer {
    target_group_arn = "${aws_lb_target_group.spotlight_lb_target_group.arn}"
    container_name   = "knowledge-dbpedia-spotlight"
    container_port   = 80
  }

  depends_on = [ "aws_lb.spotlight_load_balancer" ]
}

resource "aws_lb" "spotlight_load_balancer" {
  name               = "spotlight-load-balancer"
  internal           = false
  load_balancer_type = "application"
  security_groups    = ["${aws_security_group.knowledge_security_group.id}"]
  subnets            = [
    "${aws_subnet.knowledge_subnet1.id}",
    "${aws_subnet.knowledge_subnet2.id}",
    "${aws_subnet.knowledge_subnet3.id}"
  ]

  enable_deletion_protection = true
}

resource "aws_lb_target_group" "spotlight_lb_target_group" {
  name     = "spotlight-lb-target-group"
  port     = 80
  protocol = "HTTP"
  target_type = "ip"
  slow_start = 270

  health_check {
    healthy_threshold = 2
    unhealthy_threshold = 5
    timeout = 30
    interval = 300
    path = "/rest/annotate?text=ok"
    protocol = "HTTP"
  }

  vpc_id   = "${aws_vpc.knowledge_vpc.id}"
}

resource "aws_lb_listener" "spotlight_load_balancer_listener" {
  load_balancer_arn = "${aws_lb.spotlight_load_balancer.arn}"
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = "${aws_lb_target_group.spotlight_lb_target_group.arn}"
  }
}

resource "aws_ecs_cluster" "knowledge_spotlight_cluster" {
  name = "knowledge_spotlight_cluster"

  setting {
    name = "containerInsights"
    value = "enabled"
  }
}
