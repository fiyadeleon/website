import json
import boto3
import os

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['TABLE_NAME'])

    item_id = event['pathParameters']['id']
    data = json.loads(event['body'])

    response = table.update_item(
        Key={'id': item_id},
        UpdateExpression="set info = :i",
        ExpressionAttributeValues={':i': data['info']},
        ReturnValues="UPDATED_NEW"
    )

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Item updated successfully!'})
    }
