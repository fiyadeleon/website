import json
import boto3
import os

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['TABLE_NAME'])

    data = json.loads(event['body'])
    table.put_item(Item=data)

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Item created successfully!'})
    }
