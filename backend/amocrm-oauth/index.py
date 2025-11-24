"""
Business: OAuth авторизация и управление токенами amoCRM
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с request_id, function_name
Returns: HTTP response dict или редирект
"""

import json
import os
from typing import Dict, Any, Optional
import requests
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL', '')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    params = event.get('queryStringParameters', {})
    action = params.get('action', '')
    
    if method == 'GET':
        if action == 'authorize':
            widget_type = params.get('widget_type', 'glass')
            domain = params.get('domain', '')
            client_id = params.get('client_id', '')
            
            if not domain or not client_id:
                return error_response('Missing domain or client_id')
            
            redirect_uri = f"{get_base_url(event)}/amocrm-oauth?action=callback&widget_type={widget_type}"
            auth_url = f"https://{domain}/oauth?client_id={client_id}&state={widget_type}&redirect_uri={redirect_uri}&response_type=code"
            
            return {
                'statusCode': 302,
                'headers': {
                    'Location': auth_url,
                    'Access-Control-Allow-Origin': '*'
                },
                'body': ''
            }
        
        elif action == 'callback':
            code = params.get('code', '')
            widget_type = params.get('widget_type', 'glass')
            state = params.get('state', '')
            
            if not code:
                return error_response('Authorization failed')
            
            result = exchange_code_for_tokens(code, widget_type)
            
            if result.get('success'):
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'text/html',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': '''
                        <html>
                        <body>
                            <h2>✅ Авторизация успешна!</h2>
                            <p>Токены получены и сохранены. Можно закрыть это окно.</p>
                            <script>window.close();</script>
                        </body>
                        </html>
                    '''
                }
            else:
                return error_response('Failed to get tokens')
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'save_integration':
            integration = body_data.get('integration', {})
            result = save_integration(integration)
            return json_response(result)
        
        elif action == 'disconnect':
            widget_type = body_data.get('widget_type', '')
            domain = body_data.get('domain', '')
            result = disconnect_integration(widget_type, domain)
            return json_response(result)
        
        elif action == 'refresh_token':
            widget_type = body_data.get('widget_type', '')
            result = refresh_access_token(widget_type)
            return json_response(result)
    
    return error_response('Invalid request')


def get_base_url(event: Dict[str, Any]) -> str:
    """Получить базовый URL приложения"""
    headers = event.get('headers', {})
    host = headers.get('host') or headers.get('Host') or 'localhost:3000'
    return f"https://{host}"


def exchange_code_for_tokens(code: str, widget_type: str) -> Dict[str, Any]:
    """Обменять код авторизации на токены"""
    conn = get_db_connection()
    if not conn:
        return {'success': False, 'error': 'Database connection failed'}
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "SELECT domain, client_id, client_secret FROM amocrm_integrations WHERE widget_type = %s AND is_active = true LIMIT 1",
            (widget_type,)
        )
        integration = cursor.fetchone()
        
        if not integration:
            return {'success': False, 'error': 'Integration not found'}
        
        domain = integration['domain']
        client_id = integration['client_id']
        client_secret = integration['client_secret']
        
        redirect_uri = f"https://functions.poehali.dev/amocrm-oauth?action=callback&widget_type={widget_type}"
        
        token_url = f"https://{domain}/oauth2/access_token"
        response = requests.post(token_url, json={
            'client_id': client_id,
            'client_secret': client_secret,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri
        })
        
        if response.status_code != 200:
            return {'success': False, 'error': 'Token exchange failed'}
        
        tokens = response.json()
        access_token = tokens.get('access_token')
        refresh_token = tokens.get('refresh_token')
        expires_in = tokens.get('expires_in', 86400)
        
        expires_at = datetime.now() + timedelta(seconds=expires_in)
        
        cursor.execute(
            """UPDATE amocrm_integrations 
               SET access_token = %s, refresh_token = %s, token_expires_at = %s, updated_at = CURRENT_TIMESTAMP
               WHERE widget_type = %s AND domain = %s""",
            (access_token, refresh_token, expires_at, widget_type, domain)
        )
        conn.commit()
        
        return {'success': True}
    
    finally:
        conn.close()


def save_integration(integration: Dict[str, Any]) -> Dict[str, Any]:
    """Сохранить данные интеграции"""
    widget_type = integration.get('widget_type', 'glass')
    domain = integration.get('domain', '')
    client_id = integration.get('client_id', '')
    client_secret = integration.get('client_secret', '')
    
    if not domain or not client_id or not client_secret:
        return {'success': False, 'error': 'Missing required fields'}
    
    conn = get_db_connection()
    if not conn:
        return {'success': False, 'error': 'Database connection failed'}
    
    try:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO amocrm_integrations (widget_type, domain, client_id, client_secret)
               VALUES (%s, %s, %s, %s)
               ON CONFLICT (widget_type, domain) 
               DO UPDATE SET client_id = EXCLUDED.client_id, 
                            client_secret = EXCLUDED.client_secret,
                            is_active = true,
                            updated_at = CURRENT_TIMESTAMP""",
            (widget_type, domain, client_id, client_secret)
        )
        conn.commit()
        
        return {
            'success': True,
            'message': 'Integration saved',
            'auth_url': f"https://functions.poehali.dev/amocrm-oauth?action=authorize&widget_type={widget_type}&domain={domain}&client_id={client_id}"
        }
    
    finally:
        conn.close()


def disconnect_integration(widget_type: str, domain: str) -> Dict[str, Any]:
    """Отключить интеграцию"""
    conn = get_db_connection()
    if not conn:
        return {'success': False, 'error': 'Database connection failed'}
    
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE amocrm_integrations SET is_active = false WHERE widget_type = %s AND domain = %s",
            (widget_type, domain)
        )
        conn.commit()
        
        return {'success': True, 'message': 'Integration disconnected'}
    
    finally:
        conn.close()


def refresh_access_token(widget_type: str) -> Dict[str, Any]:
    """Обновить access token"""
    conn = get_db_connection()
    if not conn:
        return {'success': False, 'error': 'Database connection failed'}
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "SELECT * FROM amocrm_integrations WHERE widget_type = %s AND is_active = true LIMIT 1",
            (widget_type,)
        )
        integration = cursor.fetchone()
        
        if not integration or not integration['refresh_token']:
            return {'success': False, 'error': 'No refresh token found'}
        
        domain = integration['domain']
        client_id = integration['client_id']
        client_secret = integration['client_secret']
        refresh_token = integration['refresh_token']
        
        redirect_uri = f"https://functions.poehali.dev/amocrm-oauth?action=callback&widget_type={widget_type}"
        
        token_url = f"https://{domain}/oauth2/access_token"
        response = requests.post(token_url, json={
            'client_id': client_id,
            'client_secret': client_secret,
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token,
            'redirect_uri': redirect_uri
        })
        
        if response.status_code != 200:
            return {'success': False, 'error': 'Token refresh failed'}
        
        tokens = response.json()
        new_access_token = tokens.get('access_token')
        new_refresh_token = tokens.get('refresh_token')
        expires_in = tokens.get('expires_in', 86400)
        
        expires_at = datetime.now() + timedelta(seconds=expires_in)
        
        cursor.execute(
            """UPDATE amocrm_integrations 
               SET access_token = %s, refresh_token = %s, token_expires_at = %s, updated_at = CURRENT_TIMESTAMP
               WHERE id = %s""",
            (new_access_token, new_refresh_token, expires_at, integration['id'])
        )
        conn.commit()
        
        return {'success': True, 'access_token': new_access_token}
    
    finally:
        conn.close()


def get_db_connection():
    """Получить подключение к БД"""
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception as e:
        return None


def json_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """JSON ответ"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data)
    }


def error_response(message: str) -> Dict[str, Any]:
    """Ответ с ошибкой"""
    return {
        'statusCode': 400,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message})
    }
