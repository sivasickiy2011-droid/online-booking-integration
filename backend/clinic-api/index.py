import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import random

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    DB_AVAILABLE = True
except ImportError:
    DB_AVAILABLE = False

def get_db_connection():
    if not DB_AVAILABLE:
        return None
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return None
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def log_action(conn, appointment_id: str, action: str, old_data: Optional[Dict] = None, new_data: Optional[Dict] = None, user_ip: str = ''):
    if not conn:
        return
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO appointment_logs (appointment_id, action, old_data, new_data, user_ip) VALUES (%s, %s, %s, %s, %s)",
        (appointment_id, action, json.dumps(old_data) if old_data else None, json.dumps(new_data) if new_data else None, user_ip)
    )
    conn.commit()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для системы онлайн-записи в клинику с управлением записями
    Args: event с httpMethod, queryStringParameters, body
    Returns: JSON с данными услуг, врачей, слотов, записей или результатом операций
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Admin-Key',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    path = event.get('queryStringParameters', {}).get('action', '')
    user_ip = event.get('requestContext', {}).get('identity', {}).get('sourceIp', '')
    
    conn = get_db_connection()
    
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
            for hour in range(9, 18):
                for minute in [0, 30]:
                    time_str = f"{hour:02d}:{minute:02d}"
                    
                    is_booked = False
                    if conn and date_str:
                        cursor = conn.cursor()
                        cursor.execute(
                            "SELECT COUNT(*) as cnt FROM appointments WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s AND status = 'active'",
                            (doctor_id, date_str, time_str)
                        )
                        result = cursor.fetchone()
                        is_booked = result['cnt'] > 0 if result else False
                    
                    is_available = not is_booked and random.choice([True, True, True, False])
                    slots.append({
                        'time': time_str,
                        'available': is_available
                    })
            
            if conn:
                conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'slots': slots})
            }
        
        elif path == 'appointment':
            appointment_id = event.get('queryStringParameters', {}).get('id', '')
            
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Database unavailable'})
                }
            
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM appointments WHERE appointment_id = %s",
                (appointment_id,)
            )
            appointment = cursor.fetchone()
            conn.close()
            
            if not appointment:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Запись не найдена'})
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'appointment': dict(appointment)})
            }
        
        elif path == 'stats':
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Database unavailable'})
                }
            
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) as total FROM appointments WHERE status = 'active'")
            active_count = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) as total FROM appointments WHERE status = 'cancelled'")
            cancelled_count = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) as total FROM appointments WHERE status = 'completed'")
            completed_count = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) as total FROM appointments WHERE appointment_date = CURRENT_DATE AND status = 'active'")
            today_count = cursor.fetchone()['total']
            
            cursor.execute("SELECT service_name, COUNT(*) as cnt FROM appointments WHERE status = 'active' GROUP BY service_name ORDER BY cnt DESC LIMIT 5")
            popular_services = [dict(row) for row in cursor.fetchall()]
            
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'stats': {
                        'active': active_count,
                        'cancelled': cancelled_count,
                        'completed': completed_count,
                        'today': today_count,
                        'popular_services': popular_services
                    }
                })
            }
        
        elif path == 'logs':
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Database unavailable'})
                }
            
            limit = int(event.get('queryStringParameters', {}).get('limit', '100'))
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM appointment_logs ORDER BY created_at DESC LIMIT %s",
                (limit,)
            )
            logs_raw = cursor.fetchall()
            logs = []
            for row in logs_raw:
                log = dict(row)
                if 'created_at' in log and log['created_at']:
                    log['created_at'] = log['created_at'].isoformat()
                logs.append(log)
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'logs': logs})
            }
        
        elif path == 'appointments':
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Database unavailable'})
                }
            
            status = event.get('queryStringParameters', {}).get('status', 'active')
            limit = int(event.get('queryStringParameters', {}).get('limit', '50'))
            
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM appointments WHERE status = %s ORDER BY appointment_date DESC, appointment_time DESC LIMIT %s",
                (status, limit)
            )
            appointments_raw = cursor.fetchall()
            appointments = []
            for row in appointments_raw:
                apt = dict(row)
                if 'appointment_date' in apt and apt['appointment_date']:
                    apt['appointment_date'] = apt['appointment_date'].isoformat()
                if 'created_at' in apt and apt['created_at']:
                    apt['created_at'] = apt['created_at'].isoformat()
                appointments.append(apt)
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'appointments': appointments})
            }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        if not conn:
            return {
                'statusCode': 503,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Database unavailable'})
            }
        
        cursor = conn.cursor()
        cursor.execute(
            "SELECT COUNT(*) as cnt FROM appointments WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s AND status = 'active'",
            (body_data.get('doctorId'), body_data.get('date'), body_data.get('time'))
        )
        result = cursor.fetchone()
        
        if result['cnt'] > 0:
            conn.close()
            return {
                'statusCode': 409,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Выбранное время уже занято'})
            }
        
        appointment_id = f"APP{random.randint(10000, 99999)}"
        
        cursor.execute(
            """INSERT INTO appointments 
            (appointment_id, service_id, service_name, service_price, doctor_id, doctor_name, 
             appointment_date, appointment_time, patient_name, patient_phone, patient_email, status) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'active')""",
            (appointment_id, body_data.get('serviceId'), body_data.get('serviceName', ''),
             body_data.get('servicePrice', 0), body_data.get('doctorId'), body_data.get('doctorName', ''),
             body_data.get('date'), body_data.get('time'), body_data.get('patientName'),
             body_data.get('patientPhone'), body_data.get('patientEmail'))
        )
        conn.commit()
        
        log_action(conn, appointment_id, 'created', None, body_data, user_ip)
        conn.close()
        
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
    
    elif method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        appointment_id = body_data.get('appointmentId')
        
        if not conn:
            return {
                'statusCode': 503,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Database unavailable'})
            }
        
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM appointments WHERE appointment_id = %s", (appointment_id,))
        old_appointment = cursor.fetchone()
        
        if not old_appointment:
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Запись не найдена'})
            }
        
        if body_data.get('newDate') and body_data.get('newTime'):
            cursor.execute(
                "SELECT COUNT(*) as cnt FROM appointments WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s AND status = 'active' AND appointment_id != %s",
                (old_appointment['doctor_id'], body_data['newDate'], body_data['newTime'], appointment_id)
            )
            result = cursor.fetchone()
            
            if result['cnt'] > 0:
                conn.close()
                return {
                    'statusCode': 409,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Новое время уже занято'})
                }
            
            cursor.execute(
                "UPDATE appointments SET appointment_date = %s, appointment_time = %s, updated_at = CURRENT_TIMESTAMP WHERE appointment_id = %s",
                (body_data['newDate'], body_data['newTime'], appointment_id)
            )
            conn.commit()
            
            log_action(conn, appointment_id, 'rescheduled', dict(old_appointment), body_data, user_ip)
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'message': 'Запись успешно перенесена'})
            }
        
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Неверные параметры'})
        }
    
    elif method == 'DELETE':
        appointment_id = event.get('queryStringParameters', {}).get('id', '')
        
        if not conn:
            return {
                'statusCode': 503,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Database unavailable'})
            }
        
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM appointments WHERE appointment_id = %s", (appointment_id,))
        old_appointment = cursor.fetchone()
        
        if not old_appointment:
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Запись не найдена'})
            }
        
        cursor.execute(
            "UPDATE appointments SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE appointment_id = %s",
            (appointment_id,)
        )
        conn.commit()
        
        log_action(conn, appointment_id, 'cancelled', dict(old_appointment), None, user_ip)
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'message': 'Запись успешно отменена'})
        }
    
    if conn:
        conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }