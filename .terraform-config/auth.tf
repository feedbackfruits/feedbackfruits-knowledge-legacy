# Knowledge key pair
resource "tls_private_key" "ssh_private_key" {
  algorithm = "RSA"
  rsa_bits  = "2048"
}

resource "aws_key_pair" "knowledge_key_pair" {
  key_name   = "neptune-key-pair"
  public_key = "${tls_private_key.ssh_private_key.public_key_openssh}"
}

data "aws_iam_policy_document" "spotlight_execution_role_policies_document" {
  statement {
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]

    resources = [
      "*",
    ]
  }
}

resource "aws_iam_policy" "spotlight_execution_role_policies" {
  name   = "example_policy"
  path   = "/"
  policy = "${data.aws_iam_policy_document.spotlight_execution_role_policies_document.json}"
}

data "aws_iam_policy_document" "spotlight_assume_role_policy_document" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "spotlight_execution_role" {
  assume_role_policy = "${data.aws_iam_policy_document.spotlight_assume_role_policy_document.json}"
  path = "/"
}

resource "aws_iam_role_policy_attachment" "spotlight_execution_role_policies_attachment" {
  role       = "${aws_iam_role.spotlight_execution_role.name}"
  policy_arn = "${aws_iam_policy.spotlight_execution_role_policies.arn}"
}
