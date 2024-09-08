import json
import boto3
import os
import logging
from decimal import Decimal

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    logger.info(event)

    try:
        resource = event['queryStringParameters']['resource']
    except KeyError:
        logger.error('Resource is required')
        return generate_response(400, {'error': 'Resource is required'})
        
    if resource == 'customer':
        table = dynamodb.Table(os.environ['CUSTOMER_TABLE_NAME'])
    elif resource == 'employee':
        table = dynamodb.Table(os.environ['EMPLOYEE_TABLE_NAME'])
    elif resource == 'inventory':
        table = dynamodb.Table(os.environ['INVENTORY_TABLE_NAME'])
    elif resource == 'transaction':
        table = dynamodb.Table(os.environ['TRANSACTION_TABLE_NAME'])
    else:
        logger.error(f'Unknown resource: {resource}')
        raise ValueError(f"Unknown resource: {resource}")

    body = json.loads(event.get('body', '{}'), parse_float=Decimal)
    
    item_id = body.get('id')
    if not item_id:
        logger.error("No ID provided in request body")
        return generate_response(400, {'message': 'ID is required to update an item.'})
    
    body.pop('id', None)
    
    update_expression = "SET "
    expression_attribute_values = {}
    expression_attribute_names = {}
    
    for key, value in body.items():
        if key.lower() in ["unit"]: 
            expression_attribute_names[f"#{key}"] = key
            update_expression += f"#{key} = :{key}, "
        else:
            update_expression += f"{key} = :{key}, "

        expression_attribute_values[f":{key}"] = value

    update_expression = update_expression.rstrip(", ")

    try:
        response = table.update_item(
            Key={'id': item_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames=expression_attribute_names,
            ConditionExpression="attribute_exists(id)",
            ReturnValues="UPDATED_NEW"
        )
        logger.info(f"UpdateItem response: {response}")

        return generate_response(200, {'message': f'Item with ID {item_id} updated successfully!', 'updatedAttributes': response['Attributes']})

    except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
        logger.error(f"Item with ID {item_id} does not exist.")
        return generate_response(404, {'message': f'Item with ID {item_id} not found.'})
    
    except Exception as e:
        logger.error(f"Error updating item: {e}")
        return generate_response(500, {'message': f'An error occurred while updating the item: {item_id}'})

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def generate_response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'PUT',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body, default=decimal_default)
    }
