import json
import os
import base64
import uuid
import boto3
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Бизнес: Загрузка изображений в Beget S3 хранилище
    Args: event - dict с httpMethod, body (base64 encoded image)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с URL загруженного изображения
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    access_key = os.environ.get('BEGET_S3_ACCESS_KEY')
    secret_key = os.environ.get('BEGET_S3_SECRET_KEY')
    bucket_name = os.environ.get('BEGET_S3_BUCKET_NAME')
    
    if not all([access_key, secret_key, bucket_name]):
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'S3 credentials not configured'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    image_base64 = body_data.get('image')
    filename = body_data.get('filename', f'{uuid.uuid4()}.jpg')
    
    if not image_base64:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'No image provided'}),
            'isBase64Encoded': False
        }
    
    if ',' in image_base64:
        image_base64 = image_base64.split(',')[1]
    
    image_data = base64.b64decode(image_base64)
    
    s3_client = boto3.client(
        's3',
        endpoint_url='https://s3.beget.com',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name='ru-1'
    )
    
    file_key = f'glass-components/{filename}'
    
    s3_client.put_object(
        Bucket=bucket_name,
        Key=file_key,
        Body=image_data,
        ContentType='image/jpeg'
    )
    
    image_url = f'https://{bucket_name}.s3.beget.com/{file_key}'
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'url': image_url}),
        'isBase64Encoded': False
    }