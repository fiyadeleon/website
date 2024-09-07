output "stanghero_user_table_name" {
  value = aws_dynamodb_table.stanghero_user.name
}

output "stanghero_employee_table_name" {
  value = aws_dynamodb_table.stanghero_employee.name
}

output "stanghero_transaction_table_name" {
  value = aws_dynamodb_table.stanghero_transaction.name
}

output "stanghero_customer_table_name" {
  value = aws_dynamodb_table.stanghero_customer.name
}

output "stanghero_inventory_table_name" {
  value = aws_dynamodb_table.stanghero_inventory.name
}