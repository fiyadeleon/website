resource "aws_iam_role" "stanghero_lambda_users_role" {
  name = "${var.prefix_name}-lambda-users-role"

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

resource "aws_iam_role_policy" "stanghero_lambda_users_policy" {
  role = aws_iam_role.stanghero_lambda_users_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:Query"
        ]
        Effect = "Allow"
        Resource = [
          "arn:aws:dynamodb:ap-southeast-1:654654411031:table/stanghero_user"
        ]
      },
      {
        Action = "logs:*"
        Effect = "Allow"
        Resource = [
          "arn:aws:logs:ap-southeast-1:654654411031:log-group:/aws/lambda/get_users:*"
        ]
      }
    ]
  })
}

resource "aws_lambda_function" "get_users" {
  function_name = "get_users"
  handler       = "get_users.lambda_handler"
  runtime       = "python3.9"
  timeout       = 60
  role          = aws_iam_role.stanghero_lambda_users_role.arn
  filename      = "${path.module}/code/get_users.zip"

  environment {
    variables = {
      TABLE_NAME = var.stanghero_user_table_name
    }
  }

  tags = {
    Name = var.prefix_name
  }
}

locals {
  lambda_functions = {
    get_users    = aws_lambda_function.get_users.function_name
  }
}

resource "aws_cloudwatch_log_group" "stanghero_lambda_users_log_groups" {
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