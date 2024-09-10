import json
import boto3
import os
import logging
from decimal import Decimal

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')

resource_attributes = {
    'customer': ['id', 'name', 'contact', 'email', 'address', 'plateNo', 'carModel'],
    'employee': ['id', 'name', 'contact', 'email', 'jobTitle', 'salary', 'role', 'password'],
    'inventory': ['id', 'product_name', 'category', 'stock', 'unit', 'price'],
    'transaction': ['id', 'customerName', 'plateNo', 'type', 'amount', 'dateTime']
}

def lambda_handler(event, context):
    logger.info(event)

    try:
        resource = event['queryStringParameters']['resource']
    except KeyError:
        logger.error('Resource is required')
        return generate_response(400, {'error': 'Resource is required'})
        
    if resource not in resource_attributes:
        logger.error(f'Unknown resource: {resource}')
        return generate_response(400, {'error': f'Unknown resource: {resource}'})

    try:
        table = dynamodb.Table(os.environ[f'{resource.upper()}_TABLE_NAME'])
        logger.info(f"Selected table: {resource.upper()}_TABLE_NAME")
        
        data = json.loads(event['body'])
        logger.info(f"Payload data: {data}")

        item = {}
        for attribute in resource_attributes[resource]:
            if attribute in data:
                item[attribute] = data[attribute].strip() if isinstance(data[attribute], str) else data[attribute]
            else:
                logger.error(f"Missing required attribute: {attribute}")
                return generate_response(400, {'error': f"Missing required attribute: {attribute}"})

        if 'price' in item:
            item['price'] = Decimal(str(item['price']))
        if 'amount' in item:
            item['amount'] = Decimal(str(item['amount']))

        response = table.put_item(Item=item)
        logger.info(f"PutItem response: {response}")

        return generate_response(200, {'message': 'Item added successfully!', 'item': item})
    
    except Exception as e:
        logger.error(f"Error adding item: {str(e)}")
        return generate_response(500, {'message': 'Failed to add item', 'error': str(e)})

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
