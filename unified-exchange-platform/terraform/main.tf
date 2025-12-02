terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    vault = {
      source = "hashicorp/vault"
      version = "3.20.1"
    }
    confluent = {
      source = "confluentinc/confluent"
      version = "1.51.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# 1. Multi-Region Active-Active EKS Cluster
module "eks_cluster" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "19.15.3"
  cluster_name    = "unified-exchange-platform-prod"
  cluster_version = "1.27"
  subnet_ids      = ["subnet-12345678", "subnet-87654321"] # Placeholder
  vpc_id          = "vpc-12345678" # Placeholder

  eks_managed_node_groups = {
    high_performance = {
      min_size     = 10
      max_size     = 100
      desired_size = 20
      instance_types = ["c6i.4xlarge"] # Compute optimized for Matching Engine
      labels = {
        workload = "matching-engine"
      }
    }
  }
}

# 2. HashiCorp Vault for Zero-Trust Security
resource "helm_release" "vault" {
  name       = "vault"
  repository = "https://helm.releases.hashicorp.com"
  chart      = "vault"
  namespace  = "security"
  create_namespace = true

  set {
    name  = "server.ha.enabled"
    value = "true"
  }
  set {
    name  = "server.ha.raft.enabled"
    value = "true"
  }
}

# 3. Confluent Kafka (Event Sourcing Backbone)
resource "confluent_kafka_cluster" "exchange_backbone" {
  display_name = "exchange-events-prod"
  availability = "MULTI_ZONE"
  cloud        = "AWS"
  region       = "us-east-1"
  standard {}
}

# 4. TimescaleDB (Time-Series Data)
resource "aws_db_instance" "timescaledb" {
  identifier           = "exchange-timescaledb"
  engine               = "postgres"
  engine_version       = "15.3"
  instance_class       = "db.r6g.2xlarge"
  allocated_storage    = 1000
  storage_type         = "io1"
  iops                 = 30000
  db_name              = "market_data"
  username             = "admin_user"
  password             = "super_secure_password_placeholder" # Managed by Vault in production
  multi_az             = true
  publicly_accessible  = false
  skip_final_snapshot  = true
}

# 5. Supabase/Postgres (Management Core)
resource "aws_db_instance" "management_db" {
  identifier           = "exchange-management-db"
  engine               = "postgres"
  engine_version       = "15.3"
  instance_class       = "db.m6g.xlarge"
  allocated_storage    = 500
  db_name              = "exchange_management"
  username             = "admin_user"
  password             = "super_secure_password_placeholder"
  multi_az             = true
}

output "eks_cluster_endpoint" {
  value = module.eks_cluster.cluster_endpoint
}

output "vault_address" {
  value = "http://vault.security.svc.cluster.local:8200"
}
