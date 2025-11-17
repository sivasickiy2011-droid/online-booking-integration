import json
from typing import Dict, Any, List
from datetime import datetime, timedelta
import random

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для системы онлайн-записи в клинику
    Args: event с httpMethod, queryStringParameters, body
    Returns: JSON с данными услуг, врачей, слотов или результатом записи
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    path = event.get('queryStringParameters', {}).get('action', '')
    
    if method == 'GET':
        if path == 'services':
            services = [
                {'id': '1', 'name': 'Терапевт', 'price': 2500, 'duration': 30},
                {'id': '2', 'name': 'Кардиолог', 'price': 3500, 'duration': 45},
                {'id': '3', 'name': 'УЗИ', 'price': 2000, 'duration': 30},
                {'id': '4', 'name': 'Анализы крови', 'price': 1500, 'duration': 15},
                {'id': '5', 'name': 'Эндокринолог', 'price': 3000, 'duration': 40}
            ]
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'services': services})
            }
        
        elif path == 'doctors':
            service_id = event.get('queryStringParameters', {}).get('serviceId', '')
            doctors = [
                {'id': '1', 'name': 'Иванов Иван Иванович', 'specialization': 'Терапевт', 'experience': 15},
                {'id': '2', 'name': 'Петрова Мария Сергеевна', 'specialization': 'Кардиолог', 'experience': 12},
                {'id': '3', 'name': 'Сидоров Петр Александрович', 'specialization': 'Терапевт', 'experience': 8},
                {'id': '4', 'name': 'Козлова Анна Дмитриевна', 'specialization': 'Эндокринолог', 'experience': 10}
            ]
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'doctors': doctors})
            }
        
        elif path == 'slots':
            doctor_id = event.get('queryStringParameters', {}).get('doctorId', '')
            date_str = event.get('queryStringParameters', {}).get('date', '')
            
            slots = []
            base_date = datetime.now() + timedelta(days=1)
            for hour in range(9, 18):
                for minute in [0, 30]:
                    time_str = f"{hour:02d}:{minute:02d}"
                    is_available = random.choice([True, True, True, False])
                    slots.append({
                        'time': time_str,
                        'available': is_available
                    })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'slots': slots})
            }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        if random.random() < 0.1:
            return {
                'statusCode': 409,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Выбранное время уже занято'})
            }
        
        appointment_id = f"APP{random.randint(1000, 9999)}"
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'appointmentId': appointment_id,
                'message': 'Запись успешно создана'
            })
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }
