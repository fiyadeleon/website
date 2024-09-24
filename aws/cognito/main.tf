resource "aws_cognito_user_pool" "cognito_user_pool" {
  name = "${var.prefix_name}-user-pool"

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  auto_verified_attributes = ["email"]

  schema {
    attribute_data_type      = "String"
    name                     = "email"
    required                 = true
    mutable                  = false

    string_attribute_constraints {
      max_length = "2048"
      min_length = "0"
    }
  }
}

resource "aws_cognito_user_pool_domain" "cognito_domain" {
  domain = "${var.prefix_name}-domain" 
  user_pool_id = aws_cognito_user_pool.cognito_user_pool.id
}

resource "aws_cognito_user_group" "cognito_admin_group" {
  user_pool_id = aws_cognito_user_pool.cognito_user_pool.id
  name         = "${var.prefix_name}-admin-group"
}

resource "aws_cognito_user_group" "cognito_user_group" {
  user_pool_id = aws_cognito_user_pool.cognito_user_pool.id
  name         = "${var.prefix_name}-user-group"
}

resource "aws_cognito_user_group" "cognito_default_group" {
  user_pool_id = aws_cognito_user_pool.cognito_user_pool.id
  name         = "${var.prefix_name}-default-group"
}

resource "aws_cognito_user_pool_client" "cognito_app_client" {
  name         = "${var.prefix_name}-app-client"
  user_pool_id = aws_cognito_user_pool.cognito_user_pool.id

  allowed_oauth_flows        = ["code"] 
  allowed_oauth_scopes       = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true

  generate_secret           = false
  supported_identity_providers = ["COGNITO"]

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH"
  ]

  callback_urls = [
    "https://main.d9a4qs4tsciaz.amplifyapp.com/userHomepage",
    "https://main.d9a4qs4tsciaz.amplifyapp.com/reports" 
  ]
  
  logout_urls   = ["https://main.d9a4qs4tsciaz.amplifyapp.com/login"]

  prevent_user_existence_errors = "ENABLED"

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes" 
    refresh_token = "days"
  }
}
