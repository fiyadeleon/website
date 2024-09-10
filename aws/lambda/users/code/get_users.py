import json
import boto3
import hashlib
import os
import logging
import uuid
import base64
from boto3.dynamodb.conditions import Key

logger = logging.getLogger()
logger.setLevel("INFO")

dynamodb = boto3.resource('dynamodb')

table_name = os.environ['TABLE_NAME']
table = dynamodb.Table(table_name)

username_index = 'username-index'

def lambda_handler(event, context):
    logger.info(event)
    try:
        username = event['queryStringParameters']['username']
        password = event['queryStringParameters']['password']
    except KeyError:
        logger.error('Username and password are required')
        return generate_response(400, {'error': 'Username and password are required'})

    # hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()

    try:
        response = table.query(
            IndexName=username_index,
            KeyConditionExpression=Key('username').eq(username)
        )
    except Exception as e:
        logger.error(f'Error querying DynamoDB: {str(e)}')
        return generate_response(500, {'error': 'Error querying DynamoDB', 'message': str(e)})

    if 'Items' in response and len(response['Items']) > 0:
        user = response['Items'][0]
        if user['password'] == password:
            token = generate_session_token()

            return generate_response(200, {
                'message': 'Authentication successful',
                'role': user['role'],
                'token': token,
                'id': user['id']
            })
        else:
            logger.error('Invalid password')
            return generate_response(403, {'error': 'Invalid password'})
    else:
        logger.error('User not found')
        return generate_response(404, {'error': 'User not found'})
    
def generate_session_token():
    unique_id = uuid.uuid4()

    token = base64.urlsafe_b64encode(unique_id.bytes).rstrip(b'=').decode('utf-8')
    
    return token

def generate_response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body)
    }
