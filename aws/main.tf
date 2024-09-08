terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  backend "s3" {
    bucket         = "stanghero-tfstate"
    key            = "terraform.tfstate"
    region         = "ap-southeast-1"
    encrypt        = true
    dynamodb_table = "stanghero-tfstate"
  }
}

provider "aws" {
  region = "ap-southeast-1"
}

module "dynamodb" {
  source      = "git::https://github.com/fiyadeleon/website.git//aws/dynamodb?ref=main"
  prefix_name = var.prefix_name
}

module "lambda_users" {
  source                    = "git::https://github.com/fiyadeleon/website.git//aws/lambda/users?ref=main"
  prefix_name               = var.prefix_name
  stanghero_user_table_name = module.dynamodb.stanghero_user_table_name
}

module "lambda_item" {
  source      = "git::https://github.com/fiyadeleon/website.git//aws/lambda/item?ref=main"
  prefix_name = var.prefix_name
}

module "api_gateway" {
  source                 = "git::https://github.com/fiyadeleon/website.git//aws/api_gateway?ref=main"
  prefix_name            = var.prefix_name
  get_users_invoke_arn   = module.lambda_users.get_users_invoke_arn
  get_item_invoke_arn    = module.lambda_item.get_item_invoke_arn
  post_item_invoke_arn   = module.lambda_item.post_item_invoke_arn
  put_item_invoke_arn    = module.lambda_item.put_item_invoke_arn
  delete_item_invoke_arn = module.lambda_item.delete_item_invoke_arn
}