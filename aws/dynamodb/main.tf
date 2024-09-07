resource "aws_dynamodb_table" "stanghero_users" {
  name         = "${var.prefix_name}_users"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "id"
  
  attribute {
    name = "username"
    type = "S"
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