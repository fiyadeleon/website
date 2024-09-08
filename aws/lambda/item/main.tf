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
          "dynamodb:Scan",
          "dynamodb:BatchWriteItem"
        ]
        Effect = "Allow"
        Resource = [
          "arn:aws:dynamodb:ap-southeast-1:654654411031:table/stanghero_customer",
          "arn:aws:dynamodb:ap-southeast-1:654654411031:table/stanghero_employee",
          "arn:aws:dynamodb:ap-southeast-1:654654411031:table/stanghero_inventory",
          "arn:aws:dynamodb:ap-southeast-1:654654411031:table/stanghero_transaction"
        ]
      },
      {
        Action = "logs:*"
        Effect = "Allow"
        Resource = [
          "arn:aws:logs:ap-southeast-1:654654411031:log-group:/aws/lambda/get_item:*",
          "arn:aws:logs:ap-southeast-1:654654411031:log-group:/aws/lambda/post_item:*",
          "arn:aws:logs:ap-southeast-1:654654411031:log-group:/aws/lambda/put_item:*",
          "arn:aws:logs:ap-southeast-1:654654411031:log-group:/aws/lambda/delete_item:*"
        ]
      }
    ]
  })
}

# Lambda for GET
resource "aws_lambda_function" "get_item" {
  function_name = "get_item"
  handler       = "get_item.lambda_handler"
  runtime       = "python3.9"
  timeout       = 60
  role          = aws_iam_role.stanghero_lambda_role.arn
  filename      = "${path.module}/code/get_item.zip"

  environment {
    variables = {
      CUSTOMER_TABLE_NAME = "stanghero_customer"
      EMPLOYEE_TABLE_NAME = "stanghero_employee"
      INVENTORY_TABLE_NAME = "stanghero_inventory"
      TRANSACTION_TABLE_NAME = "stanghero_transaction"
    }
  }

  tags = {
    Name = var.prefix_name
  }
}

# Lambda for POST
resource "aws_lambda_function" "post_item" {
  function_name = "post_item"
  handler       = "post_item.lambda_handler"
  runtime       = "python3.9"
  timeout       = 60
  role          = aws_iam_role.stanghero_lambda_role.arn
  filename      = "${path.module}/code/post_item.zip"

  environment {
    variables = {
      CUSTOMER_TABLE_NAME = "stanghero_customer"
      EMPLOYEE_TABLE_NAME = "stanghero_employee"
      INVENTORY_TABLE_NAME = "stanghero_inventory"
      TRANSACTION_TABLE_NAME = "stanghero_transaction"
    }
  }

  tags = {
    Name = var.prefix_name
  }
}

# Lambda for PUT
resource "aws_lambda_function" "put_item" {
  function_name = "put_item"
  handler       = "put_item.lambda_handler"
  runtime       = "python3.9"
  timeout       = 60
  role          = aws_iam_role.stanghero_lambda_role.arn
  filename      = "${path.module}/code/put_item.zip"

  environment {
    variables = {
      CUSTOMER_TABLE_NAME = "stanghero_customer"
      EMPLOYEE_TABLE_NAME = "stanghero_employee"
      INVENTORY_TABLE_NAME = "stanghero_inventory"
      TRANSACTION_TABLE_NAME = "stanghero_transaction"
    }
  }

  tags = {
    Name = var.prefix_name
  }
}

# Lambda for DELETE
resource "aws_lambda_function" "delete_item" {
  function_name = "delete_item"
  handler       = "delete_item.lambda_handler"
  runtime       = "python3.9"
  timeout       = 60
  role          = aws_iam_role.stanghero_lambda_role.arn
  filename      = "${path.module}/code/delete_item.zip"

  environment {
    variables = {
      CUSTOMER_TABLE_NAME = "stanghero_customer"
      EMPLOYEE_TABLE_NAME = "stanghero_employee"
      INVENTORY_TABLE_NAME = "stanghero_inventory"
      TRANSACTION_TABLE_NAME = "stanghero_transaction"
    }
  }

  tags = {
    Name = var.prefix_name
  }
}

locals {
  lambda_functions = {
    get_item    = aws_lambda_function.get_item.function_name
    post_item   = aws_lambda_function.post_item.function_name
    put_item    = aws_lambda_function.put_item.function_name
    delete_item = aws_lambda_function.delete_item.function_name
  }
}

resource "aws_cloudwatch_log_group" "stanghero_lambda_item_log_groups" {
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