"""
Business: Handles amoCRM OAuth external integration webhook with client credentials
Args: event dict with body containing client_id, client_secret, and state (widget_type)
Returns: HTTP response with status 200 to confirm receipt
"""
import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    # Handle CORS OPTIONS
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
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        # Parse webhook body
        body_data = json.loads(event.get('body', '{}'))
        
        client_id = body_data.get('client_id')
        client_secret = body_data.get('client_secret')
        state = body_data.get('state', 'calculator')  # widget_type from OAuth button
        
        if not client_id or not client_secret:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing client_id or client_secret'}),
                'isBase64Encoded': False
            }
        
        # Log received credentials (in production, save to database)
        print(f'Received amoCRM credentials for widget_type={state}:')
        print(f'  client_id: {client_id}')
        print(f'  client_secret: {client_secret[:10]}...')
        
        # TODO: Save credentials to database or key-value store
        # For now, we just acknowledge receipt
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'status': 'ok',
                'message': 'Credentials received',
                'widget_type': state
            }),
            'isBase64Encoded': False
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid JSON'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f'Error processing webhook: {e}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Internal server error'}),
            'isBase64Encoded': False
        }
