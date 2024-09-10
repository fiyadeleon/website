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
        return generate_response(400, {'error': f"Unknown resource: {resource}"})

    try:
        item_id = event['queryStringParameters'].get('id', None)
    except KeyError:
        item_id = None

    if item_id:
        try:
            response = table.get_item(Key={'id': item_id})
            logger.info(f"GetItem response: {response}")
            
            item = response.get('Item', None)
            if not item:
                return generate_response(404, {'error': f"Item with id {item_id} not found"})
            
            return generate_response(200, item)
        except Exception as e:
            logger.error(f"Error fetching item with id {item_id}: {e}")
            return generate_response(500, {'error': 'Internal Server Error'})
    else:
        try:
            response = table.scan()
            logger.info(f"ScanTable response: {response}")
            items = response.get('Items', [])
            return generate_response(200, items)
        except Exception as e:
            logger.error(f"Error scanning table: {e}")
            return generate_response(500, {'error': 'Internal Server Error'})

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def generate_response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body, default=decimal_default)
    }
