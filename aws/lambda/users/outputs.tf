output "get_inventory_invoke_arn" {
  value = aws_lambda_function.get_inventory.invoke_arn
}

output "post_inventory_invoke_arn" {
  value = aws_lambda_function.post_inventory.invoke_arn
}

output "put_inventory_invoke_arn" {
  value = aws_lambda_function.put_inventory.invoke_arn
}

output "delete_inventory_invoke_arn" {
  value = aws_lambda_function.delete_inventory.invoke_arn
}