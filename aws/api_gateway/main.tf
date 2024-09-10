resource "aws_api_gateway_rest_api" "stanghero_api" {
  name = "${var.prefix_name}-api"
}

##### item resource
resource "aws_api_gateway_resource" "item" {
  rest_api_id = aws_api_gateway_rest_api.stanghero_api.id
  parent_id   = aws_api_gateway_rest_api.stanghero_api.root_resource_id
  path_part   = "item"
}

# Create GET method for /v1/item
resource "aws_api_gateway_method" "get_item_method" {
  rest_api_id      = aws_api_gateway_rest_api.stanghero_api.id
  resource_id      = aws_api_gateway_resource.item.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = true
}

# Create POST method for /v1/item
resource "aws_api_gateway_method" "post_item_method" {
  rest_api_id      = aws_api_gateway_rest_api.stanghero_api.id
  resource_id      = aws_api_gateway_resource.item.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

# Create PUT method for /v1/item
resource "aws_api_gateway_method" "put_item_method" {
  rest_api_id      = aws_api_gateway_rest_api.stanghero_api.id
  resource_id      = aws_api_gateway_resource.item.id
  http_method      = "PUT"
  authorization    = "NONE"
  api_key_required = true
}

# Create DELETE method for /v1/item
resource "aws_api_gateway_method" "delete_item_method" {
  rest_api_id      = aws_api_gateway_rest_api.stanghero_api.id
  resource_id      = aws_api_gateway_resource.item.id
  http_method      = "DELETE"
  authorization    = "NONE"
  api_key_required = true
}

# Integration for GET /v1/item
resource "aws_api_gateway_integration" "get_item_integration" {
  rest_api_id             = aws_api_gateway_rest_api.stanghero_api.id
  resource_id             = aws_api_gateway_resource.item.id
  http_method             = aws_api_gateway_method.get_item_method.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = var.get_item_invoke_arn
}

# Integration for POST /v1/item
resource "aws_api_gateway_integration" "post_item_integration" {
  rest_api_id             = aws_api_gateway_rest_api.stanghero_api.id
  resource_id             = aws_api_gateway_resource.item.id
  http_method             = aws_api_gateway_method.post_item_method.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = var.post_item_invoke_arn
}

# Integration for PUT /v1/item
resource "aws_api_gateway_integration" "put_item_integration" {
  rest_api_id             = aws_api_gateway_rest_api.stanghero_api.id
  resource_id             = aws_api_gateway_resource.item.id
  http_method             = aws_api_gateway_method.put_item_method.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = var.put_item_invoke_arn
}

# Integration for DELETE /v1/item
resource "aws_api_gateway_integration" "delete_item_integration" {
  rest_api_id             = aws_api_gateway_rest_api.stanghero_api.id
  resource_id             = aws_api_gateway_resource.item.id
  http_method             = aws_api_gateway_method.delete_item_method.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = var.delete_item_invoke_arn
}

resource "aws_api_gateway_api_key" "stanghero_api_key" {
  name    = "${var.prefix_name}-api-key"
  enabled = true
}

resource "aws_api_gateway_usage_plan" "stanghero_usage_plan" {
  name = "${var.prefix_name}-usage-plan"
  api_stages {
    api_id = aws_api_gateway_rest_api.stanghero_api.id
    stage  = aws_api_gateway_deployment.stanghero_deployment.stage_name
  }
}

resource "aws_api_gateway_usage_plan_key" "stanghero_usage_plan_key" {
  key_id        = aws_api_gateway_api_key.stanghero_api_key.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.stanghero_usage_plan.id
}

# IAM Role for API Gateway to use CloudWatch Logs
resource "aws_iam_role" "stanghero_api_cloudwatch_role" {
  name = "${var.prefix_name}-api-cloudwatch-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "stanghero_api_cloudwatch_logs_attachment" {
  role       = aws_iam_role.stanghero_api_cloudwatch_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

# CloudWatch Log Group for API Gateway Logs
resource "aws_cloudwatch_log_group" "stanghero_api_log_group" {
  name = "/aws/api-gateway/stanghero-api-logs"
}

# API Gateway Deployment with CloudWatch Logs Enabled
resource "aws_api_gateway_method_settings" "stanghero_method_settings" {
  rest_api_id = aws_api_gateway_rest_api.stanghero_api.id
  stage_name  = "v1"
  method_path = "*/*"

  settings {
    metrics_enabled = true
    logging_level   = "INFO"
  }
}

# CloudWatch permissions for API Gateway Logs
resource "aws_api_gateway_deployment" "stanghero_deployment" {
  depends_on = [
    aws_api_gateway_integration.get_item_integration,
    aws_api_gateway_integration.post_item_integration,
    aws_api_gateway_integration.put_item_integration,
    aws_api_gateway_integration.delete_item_integration
  ]
  rest_api_id = aws_api_gateway_rest_api.stanghero_api.id
  stage_name  = "v1"
}
