output "get_item_invoke_arn" {
  value = aws_lambda_function.get_item.invoke_arn
}

output "post_item_invoke_arn" {
  value = aws_lambda_function.post_item.invoke_arn
}

output "put_item_invoke_arn" {
  value = aws_lambda_function.put_item.invoke_arn
}

output "delete_item_invoke_arn" {
  value = aws_lambda_function.delete_item.invoke_arn
}