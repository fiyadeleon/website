import json
import boto3
import os

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['TABLE_NAME'])

    item_id = event['pathParameters']['id']

    response = table.get_item(Key={'id': item_id})

    return {
        'statusCode': 200,
        'body': json.dumps(response.get('Item', {}))
    }
