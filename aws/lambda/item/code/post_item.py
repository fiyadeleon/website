import json
import boto3
import os
import logging
import random
import string
from datetime import datetime
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
    
    data = json.loads(event['body'])
    logger.info(f"Payload data: {data}")

    try:
        item = {
            'id': data['id'],
            'product_name': data['product_name'].strip(),
            'category': data['category'].strip(),
            'stock': data['stock'],
            'unit': data['unit'],
            'price': Decimal(str(data['price']))
        }

        response = table.put_item(Item=item)
        logger.info(f"PutItem response: {response}")

        return generate_response(200, {'message': 'Item added successfully!', 'item': item})
    
    except Exception as e:
        logger.error(f"Error adding item: {str(e)}")
        return generate_response(500, {'message': 'Failed to add item', 'error': str(e)})

def generate_item_id():
    random_string = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    current_date = datetime.now().strftime('%Y%m%d')
    return f"PROD-{random_string}-{current_date}"

def generate_response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj) 
        return super(DecimalEncoder, self).default(obj)
