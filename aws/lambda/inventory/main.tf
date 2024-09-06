resource "aws_iam_role" "stanghero_lambda_role" {
  name = "${var.prefix_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  ]
}

resource "aws_iam_role_policy" "stanghero_lambda_policy" {
  role = aws_iam_role.stanghero_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan"
        ]
        Effect = "Allow"
        Resource = [
          "arn:aws:dynamodb:ap-southeast-1:746669220038:table/stanghero_customer",
          "arn:aws:dynamodb:ap-southeast-1:746669220038:table/stanghero_employee",
          "arn:aws:dynamodb:ap-southeast-1:746669220038:table/stanghero_inventory",
          "arn:aws:dynamodb:ap-southeast-1:746669220038:table/stanghero_transaction"
        ]
      },
      {
        Action = "logs:*"
        Effect = "Allow"
        Resource = [
          "arn:aws:logs:ap-southeast-1:746669220038:log-group:/aws/lambda/stanghero_customer:*",
          "arn:aws:logs:ap-southeast-1:746669220038:log-group:/aws/lambda/stanghero_employee:*",
          "arn:aws:logs:ap-southeast-1:746669220038:log-group:/aws/lambda/stanghero_inventory:*",
          "arn:aws:logs:ap-southeast-1:746669220038:log-group:/aws/lambda/stanghero_transaction:*"
        ]
      }
    ]
  })
}

# Lambda for GET
resource "aws_lambda_function" "get_inventory" {
  function_name = "get_inventory"
  handler       = "get_inventory.lambda_handler"
  runtime       = "python3.9"
  timeout       = 60
  role          = aws_iam_role.stanghero_lambda_role.arn
  filename      = "${path.module}/code/get_inventory.zip"

  environment {
    variables = {
      TABLE_NAME = var.stanghero_inventory_table_name
    }
  }

  tags = {
    Name = var.prefix_name
  }
}

# Lambda for POST
resource "aws_lambda_function" "post_inventory" {
  function_name = "post_inventory"
  handler       = "post_inventory.lambda_handler"
  runtime       = "python3.9"
  timeout       = 60
  role          = aws_iam_role.stanghero_lambda_role.arn
  filename      = "${path.module}/code/post_inventory.zip"

  environment {
    variables = {
      TABLE_NAME = var.stanghero_inventory_table_name
    }
  }

  tags = {
    Name = var.prefix_name
  }
}

# Lambda for PUT
resource "aws_lambda_function" "put_inventory" {
  function_name = "put_inventory"
  handler       = "put_inventory.lambda_handler"
  runtime       = "python3.9"
  timeout       = 60
  role          = aws_iam_role.stanghero_lambda_role.arn
  filename      = "${path.module}/code/put_inventory.zip"

  environment {
    variables = {
      TABLE_NAME = var.stanghero_inventory_table_name
    }
  }

  tags = {
    Name = var.prefix_name
  }
}

# Lambda for DELETE
resource "aws_lambda_function" "delete_inventory" {
  function_name = "delete_inventory"
  handler       = "delete_inventory.lambda_handler"
  runtime       = "python3.9"
  timeout       = 60
  role          = aws_iam_role.stanghero_lambda_role.arn
  filename      = "${path.module}/code/delete_inventory.zip"

  environment {
    variables = {
      TABLE_NAME = var.stanghero_inventory_table_name
    }
  }

  tags = {
    Name = var.prefix_name
  }
}

locals {
  lambda_functions = {
    get_inventory    = aws_lambda_function.get_inventory.function_name
    post_inventory   = aws_lambda_function.post_inventory.function_name
    put_inventory    = aws_lambda_function.put_inventory.function_name
    delete_inventory = aws_lambda_function.delete_inventory.function_name
  }
}

resource "aws_cloudwatch_log_group" "stanghero_lambda_inventory_log_groups" {
  for_each = local.lambda_functions
  name     = "/aws/lambda/${each.value}"
}

resource "aws_lambda_permission" "stanghero_invoke_permissions" {
  for_each      = local.lambda_functions
  statement_id  = "AllowExecutionFromAPIGateway-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = each.value
  principal     = "apigateway.amazonaws.com"
}