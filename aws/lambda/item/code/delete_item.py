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

    payload = json.loads(event['body'])

    if not isinstance(payload, list) or not all('id' in item for item in payload):
        return generate_response(400, {"message": "Invalid payload format. Expected a list of objects with 'id'."})

    ids = [item['id'] for item in payload]

    if not ids:
        return generate_response(400, {"message": "No valid IDs provided in the request."})

    delete_responses = []

    with table.batch_writer() as batch:
        for item_id in ids:
            try:
                batch.delete_item(Key={'id': item_id})
                logger.error(f"Successfully deleted item with id: {item_id}")
                delete_responses.append({"id": item_id, "status": "success"})
            except Exception as e:
                logger.error(f"Failed to delete item with id {item_id}: {e}")
                delete_responses.append({"id": item_id, "status": "failed", "error": str(e)})

    return generate_response(200, {"message": "Delete operation completed", "results": delete_responses})

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def generate_response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'DELETE',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body, default=decimal_default)
    }
