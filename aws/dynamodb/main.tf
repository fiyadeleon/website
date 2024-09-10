resource "aws_dynamodb_table" "stanghero_user" {
  name         = "${var.prefix_name}_user"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "id"
  
  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "username"
    type = "S"
  }

  global_secondary_index {
    name            = "username-index"
    hash_key        = "username"
    projection_type = "ALL"
  }

  tags = {
    Name = var.prefix_name
  }
}

resource "aws_dynamodb_table" "stanghero_inventory" {
  name         = "${var.prefix_name}_inventory"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "id"
  
  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name = var.prefix_name
  }
}

resource "aws_dynamodb_table" "stanghero_transaction" {
  name         = "${var.prefix_name}_transaction"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "id"
  
  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name = var.prefix_name
  }
}

resource "aws_dynamodb_table" "stanghero_customer" {
  name         = "${var.prefix_name}_customer"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name = var.prefix_name
  }
}

resource "aws_dynamodb_table" "stanghero_employee" {
  name         = "${var.prefix_name}_employee"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name = var.prefix_name
  }
}