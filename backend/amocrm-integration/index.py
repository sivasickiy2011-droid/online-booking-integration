"""
Business: Интеграция с amoCRM для работы с виджетом
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с request_id, function_name
Returns: HTTP response dict
"""

import json
import os
from typing import Dict, Any, Optional
import requests
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Lead-Id, X-Account-Domain',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    lead_id = headers.get('x-lead-id') or headers.get('X-Lead-Id')
    account_domain = headers.get('x-account-domain') or headers.get('X-Account-Domain')
    
    if method == 'GET':
        action = event.get('queryStringParameters', {}).get('action', 'get_lead')
        
        if action == 'get_lead' and lead_id and account_domain:
            lead_data = get_lead_data(account_domain, lead_id)
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(lead_data)
            }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'save_calculation' and lead_id and account_domain:
            calculation = body_data.get('calculation', {})
            result = save_calculation_to_lead(account_domain, lead_id, calculation)
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result)
            }
        
        if action == 'save_connection':
            connection_data = body_data.get('connection', {})
            result = save_amocrm_connection(connection_data)
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result)
            }
    
    return {
        'statusCode': 400,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Invalid request'})
    }


def get_lead_data(domain: str, lead_id: str) -> Dict[str, Any]:
    """Получить данные о сделке из amoCRM"""
    access_token = get_access_token(domain)
    
    if not access_token:
        return {'error': 'Not authenticated'}
    
    url = f'https://{domain}/api/v4/leads/{lead_id}'
    headers = {'Authorization': f'Bearer {access_token}'}
    params = {'with': 'contacts'}
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        return {'error': 'Failed to fetch lead'}
    
    lead = response.json()
    
    contact_data = {}
    if lead.get('_embedded', {}).get('contacts'):
        contact = lead['_embedded']['contacts'][0]
        contact_id = contact['id']
        
        contact_url = f'https://{domain}/api/v4/contacts/{contact_id}'
        contact_response = requests.get(contact_url, headers=headers)
        
        if contact_response.status_code == 200:
            contact_full = contact_response.json()
            contact_data = {
                'name': contact_full.get('name', ''),
                'phone': get_contact_field(contact_full, 'phone'),
                'email': get_contact_field(contact_full, 'email')
            }
    
    return {
        'id': lead.get('id'),
        'name': lead.get('name', ''),
        'contact': contact_data
    }


def get_contact_field(contact: Dict[str, Any], field_type: str) -> Optional[str]:
    """Извлечь телефон или email из контакта"""
    custom_fields = contact.get('custom_fields_values', [])
    for field in custom_fields:
        if field.get('field_code') == field_type.upper():
            values = field.get('values', [])
            if values:
                return values[0].get('value', '')
    return None


def save_calculation_to_lead(domain: str, lead_id: str, calculation: Dict[str, Any]) -> Dict[str, Any]:
    """Сохранить результат калькуляции в сделку"""
    access_token = get_access_token(domain)
    
    if not access_token:
        return {'error': 'Not authenticated'}
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    note_text = format_calculation_note(calculation)
    note_url = f'https://{domain}/api/v4/leads/{lead_id}/notes'
    note_data = {
        'note_type': 'common',
        'params': {
            'text': note_text
        }
    }
    
    note_response = requests.post(note_url, headers=headers, json=[note_data])
    
    products = calculation.get('products', [])
    if products:
        add_products_to_lead(domain, lead_id, products, access_token)
    
    return {
        'success': True,
        'note_added': note_response.status_code == 200
    }


def format_calculation_note(calculation: Dict[str, Any]) -> str:
    """Форматировать текст заметки с расчетом"""
    package_name = calculation.get('package_name', 'Не указано')
    width = calculation.get('width', 0)
    height = calculation.get('height', 0)
    square_meters = calculation.get('square_meters', 0)
    total_price = calculation.get('total_price', 0)
    components = calculation.get('components_total', 0)
    services = calculation.get('services_total', 0)
    
    note = f"""
📊 Результат калькуляции стеклянных изделий

🔹 Комплект: {package_name}
🔹 Размеры: {width} × {height} мм
🔹 Площадь: {square_meters:.2f} м²

💰 Стоимость:
• Материалы и фурнитура: {components:,.2f} ₽
• Услуги: {services:,.2f} ₽
• ИТОГО: {total_price:,.2f} ₽

Дата расчета: {datetime.now().strftime('%d.%m.%Y %H:%M')}
"""
    return note.strip()


def add_products_to_lead(domain: str, lead_id: str, products: list, access_token: str) -> bool:
    """Добавить товары в сделку"""
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    url = f'https://{domain}/api/v4/leads/{lead_id}/links'
    
    catalog_elements = []
    for product in products:
        catalog_elements.append({
            'to_entity_id': product.get('catalog_id'),
            'to_entity_type': 'catalog_elements',
            'metadata': {
                'quantity': product.get('quantity', 1),
                'price': product.get('price', 0)
            }
        })
    
    if catalog_elements:
        response = requests.post(url, headers=headers, json=catalog_elements)
        return response.status_code == 200
    
    return False


def get_access_token(domain: str) -> Optional[str]:
    """Получить access token для домена (заглушка - нужно хранить в БД)"""
    return None


def save_amocrm_connection(connection: Dict[str, Any]) -> Dict[str, Any]:
    """Сохранить данные подключения к amoCRM"""
    domain = connection.get('domain')
    client_id = connection.get('client_id')
    client_secret = connection.get('client_secret')
    
    return {
        'success': True,
        'message': 'Connection saved'
    }
