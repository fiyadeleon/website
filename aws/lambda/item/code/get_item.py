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
        email = event['queryStringParameters'].get('email', None)
        password = event['queryStringParameters'].get('password', None)

        if email and password:
            return validate_login(table, email, password)
        
        elif item_id:
            return get_employee_by_id(table, item_id)

        else:
            return get_all(table)

    except Exception as e:
        logger.error(f"Error processing request: {e}")
        return generate_response(500, {'error': 'Internal Server Error'})

def validate_login(table, email, password):
    try:
        response = table.query(
            IndexName='email-index',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('email').eq(email)
        )
        logger.info(f"Query response: {response}")

        items = response.get('Items', [])
        if not items:
            return generate_response(404, {'error': f"Employee with email {email} not found"})

        employee = items[0]
        stored_password = employee.get('password')

        if stored_password is None:
            return generate_response(500, {'error': 'Password not set for this employee'})

        if password == stored_password:
            return generate_response(200, {'message': 'Login successful'})
        else:
            return generate_response(401, {'error': 'Invalid credentials'})

    except Exception as e:
        logger.error(f"Error fetching employee with email {email}: {e}")
        return generate_response(500, {'error': 'Internal Server Error'})

def get_employee_by_id(table, item_id):
    try:
        response = table.get_item(Key={'id': item_id})
        logger.info(f"GetItem response: {response}")
        
        employee = response.get('Item', None)
        if not employee:
            return generate_response(404, {'error': f"Employee with id {item_id} not found"})
        
        return generate_response(200, employee)
    
    except Exception as e:
        logger.error(f"Error fetching employee with id {item_id}: {e}")
        return generate_response(500, {'error': 'Internal Server Error'})

def get_all(table):
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
