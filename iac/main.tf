# VPC and Subnets
resource "aws_vpc" "costal-vpc" {
  assign_generated_ipv6_cidr_block     = "false"
  cidr_block                           = "172.31.0.0/16"
  enable_dns_hostnames                 = "true"
  enable_dns_support                   = "true"
  enable_network_address_usage_metrics = "false"

  tags = {
    Name = "costal-vpc"
  }
}

resource "aws_subnet" "rds_private_subnet_a" {
  assign_ipv6_address_on_creation                = "false"
  cidr_block                                     = "172.31.97.128/25"
  availability_zone                              = "us-east-1a"
  enable_dns64                                   = "false"
  enable_resource_name_dns_a_record_on_launch    = "false"
  enable_resource_name_dns_aaaa_record_on_launch = "false"
  ipv6_native                                    = "false"
  map_public_ip_on_launch                        = "false"
  private_dns_hostname_type_on_launch            = "ip-name"

  tags = {
    Name = "rds-private-subnet-a"
  }

  vpc_id = aws_vpc.costal-vpc.id
}

resource "aws_subnet" "rds_private_subnet_b" {
  assign_ipv6_address_on_creation                = "false"
  cidr_block                                     = "172.31.96.0/25"
  availability_zone                              = "us-east-1b"
  enable_dns64                                   = "false"
  enable_resource_name_dns_a_record_on_launch    = "false"
  enable_resource_name_dns_aaaa_record_on_launch = "false"
  ipv6_native                                    = "false"
  map_public_ip_on_launch                        = "false"
  private_dns_hostname_type_on_launch            = "ip-name"

  tags = {
    Name = "rds-private-subnet-b"
  }

  vpc_id = aws_vpc.costal-vpc.id
}

resource "aws_subnet" "alb_public_subnet_a" {
  assign_ipv6_address_on_creation                = "false"
  cidr_block                                     = "172.31.16.0/20"
  availability_zone                              = "us-east-1a"
  enable_dns64                                   = "false"
  enable_resource_name_dns_a_record_on_launch    = "false"
  enable_resource_name_dns_aaaa_record_on_launch = "false"
  ipv6_native                                    = "false"
  map_public_ip_on_launch                        = "true"
  private_dns_hostname_type_on_launch            = "ip-name"
  vpc_id                                         = aws_vpc.costal-vpc.id

  tags = {
    Name = "alb-public-subnet-a"
  }
}

resource "aws_subnet" "alb_public_subnet_b" {
  assign_ipv6_address_on_creation                = "false"
  cidr_block                                     = "172.31.32.0/20"
  availability_zone                              = "us-east-1b"
  enable_dns64                                   = "false"
  enable_resource_name_dns_a_record_on_launch    = "false"
  enable_resource_name_dns_aaaa_record_on_launch = "false"
  ipv6_native                                    = "false"
  map_public_ip_on_launch                        = "true"
  private_dns_hostname_type_on_launch            = "ip-name"
  vpc_id                                         = aws_vpc.costal-vpc.id

  tags = {
    Name = "alb-public-subnet-b"
  }
}

# IGW Setup
resource "aws_internet_gateway" "costal_igw" {
  vpc_id = aws_vpc.costal-vpc.id

  tags = {
    Name = "costal-igw"
  }
}

resource "aws_route_table" "costal_public" {
  vpc_id = aws_vpc.costal-vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.costal_igw.id
  }

  tags = {
    Name = "costal-public-rt"
  }
}

resource "aws_route_table_association" "alb_public_a" {
  subnet_id      = aws_subnet.alb_public_subnet_a.id
  route_table_id = aws_route_table.costal_public.id
}

resource "aws_route_table_association" "alb_public_b" {
  subnet_id      = aws_subnet.alb_public_subnet_b.id
  route_table_id = aws_route_table.costal_public.id
}

# Security Groups
resource "aws_security_group" "alb-sg" {
  description = "Security group to allow inbound connection to the load balancer"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "80"
    protocol    = "tcp"
    self        = "false"
    to_port     = "80"
  }

  name   = "alb-sg"
  vpc_id = aws_vpc.costal-vpc.id
}

resource "aws_security_group" "rds-sg" {
  description = "Security group attached to costal-db to allow EC2 instances to connect to the database."

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "5432"
    protocol    = "tcp"
    self        = "false"
    to_port     = "5432"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "5432"
    protocol    = "tcp"
    self        = "false"
    to_port     = "5432"
  }

  name   = "rds-sg"
  vpc_id = aws_vpc.costal-vpc.id
}

resource "aws_security_group" "ec2-sg" {
  description = "Security Group for "

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "22"
    protocol    = "tcp"
    self        = "false"
    to_port     = "22"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "80"
    protocol    = "tcp"
    self        = "false"
    to_port     = "80"
  }

  name   = "ec2-sg"
  vpc_id = aws_vpc.costal-vpc.id
}

# S3
resource "aws_s3_bucket" "s3-release-bucket" {
  bucket        = "release-bucket-costal"
  force_destroy = "true"
}

# RDS
variable "db_password" {
  description = "The password for the RDS database"
  type        = string
  sensitive   = true
}

resource "aws_db_subnet_group" "rds-private-subnet-group" {
  description = "Private RDS subnet group"
  name        = "rds-private-subnet-group-1"
  subnet_ids  = [aws_subnet.rds_private_subnet_a.id, aws_subnet.rds_private_subnet_b.id]
}

resource "aws_db_instance" "costal-db" {
  db_name                = "costal"
  identifier             = "costal-db"
  instance_class         = "db.t4g.micro"
  engine                 = "postgres"
  allocated_storage      = 10
  skip_final_snapshot    = true
  db_subnet_group_name   = aws_db_subnet_group.rds-private-subnet-group.name
  port                   = "5432"
  publicly_accessible    = "false"
  vpc_security_group_ids = [aws_security_group.rds-sg.id]
  username               = "costal"
  password               = var.db_password
}

# IAM
resource "aws_iam_role" "ec2-role" {
  name                 = "ec2-role"
  path                 = "/"
  description          = "Gives EC2 full access to S3 release bucket."
  max_session_duration = 3600

  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
        Action    = "sts:AssumeRole"
      },
    ]
  })
}

locals {
  ec2_managed_policies = [
    "arn:aws:iam::aws:policy/AmazonBedrockFullAccess",
    "arn:aws:iam::aws:policy/AmazonElasticContainerRegistryPublicFullAccess",
    "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess",
    "arn:aws:iam::aws:policy/AmazonS3FullAccess",
    "arn:aws:iam::aws:policy/EC2InstanceProfileForImageBuilderECRContainerBuilds",
  ]
}

resource "aws_iam_role_policy_attachment" "ec2_managed" {
  for_each   = toset(local.ec2_managed_policies)
  role       = aws_iam_role.ec2-role.name
  policy_arn = each.key
}

resource "aws_iam_instance_profile" "ec2-profile" {
  name = "ec2-instance-profile"
  role = aws_iam_role.ec2-role.name
}

# ECR
resource "aws_ecr_repository" "ecr-image-store" {
  name         = "costal/backend"
  force_delete = true
}

# ALB
variable "certificate_arn" {
  description = "ARN of an existing ACM cert to use on the ALB HTTPS listener. Set to \"\" or \"none\" to disable HTTPS."
  type        = string
  default     = ""
}

locals {
  enable_https = var.certificate_arn != "" && lower(var.certificate_arn) != "none"
}

resource "aws_lb" "costal-alb" {
  enable_cross_zone_load_balancing            = "true"
  ip_address_type                             = "ipv4"
  load_balancer_type                          = "application"
  name                                        = "costal-alb"
  security_groups                             = [aws_security_group.alb-sg.id]

  subnets                    = [aws_subnet.alb_public_subnet_a.id, aws_subnet.alb_public_subnet_b.id]
}

resource "aws_lb_target_group" "webserver-tg" {
  health_check {
    enabled             = "true"
    healthy_threshold   = "5"
    interval            = "30"
    matcher             = "200"
    path                = "/costal/webserver-status"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = "5"
    unhealthy_threshold = "2"
  }

  name                              = "costal-webserver-tg"
  port                              = "80"
  protocol                          = "HTTP"
  protocol_version                  = "HTTP1"
  slow_start                        = "0"

  target_type = "instance"
  vpc_id      = aws_vpc.costal-vpc.id
}

resource "aws_lb_listener" "https" {
  count             = local.enable_https ? 1 : 0
  load_balancer_arn = aws_lb.costal-alb.arn
  port              = 443
  protocol          = "HTTPS"

  ssl_policy      = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.webserver-tg.arn

    forward {
      target_group {
        arn    = aws_lb_target_group.webserver-tg.arn
        weight = 1
      }
      stickiness {
        enabled  = false
        duration = 3600
      }
    }
  }
}

resource "aws_lb_listener" "alb-http-listener" {
  default_action {
    forward {
      stickiness {
        duration = "3600"
        enabled  = "false"
      }

      target_group {
        arn    = aws_lb_target_group.webserver-tg.arn
        weight = "1"
      }
    }

    type             = "forward"
    target_group_arn = aws_lb_target_group.webserver-tg.arn
  }

  load_balancer_arn = aws_lb.costal-alb.arn

  port                                 = "80"
  protocol                             = "HTTP"
  routing_http_response_server_enabled = "true"
}

# AutoScaling
resource "aws_launch_template" "ec2-launch-template" {
  iam_instance_profile {
    arn = aws_iam_instance_profile.ec2-profile.arn
  }

  image_id      = "ami-0c614dee691cbbf37"
  instance_type = "t2.medium"
  name          = "costal-launch-template"

  tag_specifications {
    resource_type = "instance"

    tags = {
      Release = ""
    }
  }

  vpc_security_group_ids = [aws_security_group.alb-sg.id]
}

resource "aws_autoscaling_group" "costal-asg" {
  name                      = "costal-asg"
  default_cooldown          = "300"
  desired_capacity          = "1"
  max_size                  = "1"
  min_size                  = "1"
  force_delete              = "true"
  health_check_type         = "EC2"

  launch_template {
    id      = aws_launch_template.ec2-launch-template.id
    version = "$Default"
  }

  target_group_arns   = [aws_lb_target_group.webserver-tg.arn]
  vpc_zone_identifier = [aws_subnet.alb_public_subnet_a.id]
}
