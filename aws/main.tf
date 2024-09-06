terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  backend "s3" {
    bucket         = "stanghero-tf-state"
    key            = "terraform.tfstate"
    region         = "ap-southeast-1"
    encrypt        = true
    dynamodb_table = "stanghero-tf-state"
  }
}

provider "aws" {
  region = "ap-southeast-1"
}

module "dynamodb" {
  source      = "git::https://git-codecommit.ap-southeast-1.amazonaws.com/v1/repos/stanghero-website.git//aws/dynamodb?ref=master"
  prefix_name = var.prefix_name
}

module "lambda_inventory" {
  source                         = "git::https://git-codecommit.ap-southeast-1.amazonaws.com/v1/repos/stanghero-website.git//aws/lambda/inventory?ref=master"
  prefix_name                    = var.prefix_name
  stanghero_inventory_table_name = module.dynamodb.stanghero_inventory_table_name
}

module "api_gateway" {
  source                      = "git::https://git-codecommit.ap-southeast-1.amazonaws.com/v1/repos/stanghero-website.git//aws/api_gateway?ref=master"
  prefix_name                 = var.prefix_name
  get_inventory_invoke_arn    = module.lambda_inventory.get_inventory_invoke_arn
  post_inventory_invoke_arn   = module.lambda_inventory.post_inventory_invoke_arn
  put_inventory_invoke_arn    = module.lambda_inventory.put_inventory_invoke_arn
  delete_inventory_invoke_arn = module.lambda_inventory.delete_inventory_invoke_arn
}