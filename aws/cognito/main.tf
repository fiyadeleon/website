resource "aws_cognito_user_pool" "user_pool" {
  name = "${var.prefix_name}-user-pool"

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  auto_verified_attributes = ["email"]

  schema {
    attribute_data_type      = "String"
    name                     = "email"
    required                 = true
    mutable                  = false
  }

  tags = {
    Environment = "dev"
  }
}

resource "aws_cognito_user_pool_client" "app_client" {
  name         = "${var.prefix_name}-app-client"
  user_pool_id = aws_cognito_user_pool.user_pool.id

  allowed_oauth_flows        = ["code"]
  allowed_oauth_scopes       = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true

  generate_secret           = false
  supported_identity_providers = ["COGNITO"]

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  prevent_user_existence_errors = "ENABLED"
}