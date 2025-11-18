import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import random
from decimal import Decimal

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

def convert_decimals(obj):
    if isinstance(obj, list):
        return [convert_decimals(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_decimals(value) for key, value in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)
    return obj

def log_action(conn, appointment_id: str, action: str, old_data: Optional[Dict] = None, new_data: Optional[Dict] = None, user_ip: str = ''):
    if not conn:
        return
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO t_p56372141_online_booking_integ.appointment_logs (appointment_id, action, old_data, new_data, user_ip) VALUES (%s, %s, %s, %s, %s)",
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
                            "SELECT COUNT(*) as cnt FROM t_p56372141_online_booking_integ.appointments WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s AND status = 'active'",
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
                "SELECT * FROM t_p56372141_online_booking_integ.appointments WHERE appointment_id = %s",
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
            
            cursor.execute("SELECT COUNT(*) as total FROM t_p56372141_online_booking_integ.appointments WHERE status = 'active'")
            active_count = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) as total FROM t_p56372141_online_booking_integ.appointments WHERE status = 'cancelled'")
            cancelled_count = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) as total FROM t_p56372141_online_booking_integ.appointments WHERE status = 'completed'")
            completed_count = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) as total FROM t_p56372141_online_booking_integ.appointments WHERE appointment_date = CURRENT_DATE AND status = 'active'")
            today_count = cursor.fetchone()['total']
            
            cursor.execute("SELECT service_name, COUNT(*) as cnt FROM t_p56372141_online_booking_integ.appointments WHERE status = 'active' GROUP BY service_name ORDER BY cnt DESC LIMIT 5")
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
                "SELECT * FROM t_p56372141_online_booking_integ.appointment_logs ORDER BY created_at DESC LIMIT %s",
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
                "SELECT * FROM t_p56372141_online_booking_integ.appointments WHERE status = %s ORDER BY appointment_date DESC, appointment_time DESC LIMIT %s",
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
                if 'updated_at' in apt and apt['updated_at']:
                    apt['updated_at'] = apt['updated_at'].isoformat()
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
            "SELECT COUNT(*) as cnt FROM t_p56372141_online_booking_integ.appointments WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s AND status = 'active'",
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
            """INSERT INTO t_p56372141_online_booking_integ.appointments 
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
        cursor.execute("SELECT * FROM t_p56372141_online_booking_integ.appointments WHERE appointment_id = %s", (appointment_id,))
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
                "SELECT COUNT(*) as cnt FROM t_p56372141_online_booking_integ.appointments WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s AND status = 'active' AND appointment_id != %s",
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
                "UPDATE t_p56372141_online_booking_integ.appointments SET appointment_date = %s, appointment_time = %s, updated_at = CURRENT_TIMESTAMP WHERE appointment_id = %s",
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
        cursor.execute("SELECT * FROM t_p56372141_online_booking_integ.appointments WHERE appointment_id = %s", (appointment_id,))
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
            "UPDATE t_p56372141_online_booking_integ.appointments SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE appointment_id = %s",
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
    
    if path == 'glass_packages':
        if method == 'GET':
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Database unavailable'})
                }
            
            active_only = event.get('queryStringParameters', {}).get('active_only', '') == 'true'
            with_components = event.get('queryStringParameters', {}).get('with_components', '') == 'true'
            cursor = conn.cursor()
            
            if active_only:
                cursor.execute("SELECT * FROM t_p56372141_online_booking_integ.glass_packages WHERE is_active = true ORDER BY package_name")
            else:
                cursor.execute("SELECT * FROM t_p56372141_online_booking_integ.glass_packages ORDER BY package_name")
            
            packages = [dict(row) for row in cursor.fetchall()]
            
            if with_components:
                for pkg in packages:
                    cursor.execute("""
                        SELECT c.*, pc.quantity, pc.is_required 
                        FROM t_p56372141_online_booking_integ.glass_components c
                        JOIN t_p56372141_online_booking_integ.package_components pc ON c.component_id = pc.component_id
                        WHERE pc.package_id = %s AND c.is_active = true
                        ORDER BY c.component_type, c.component_name
                    """, (pkg['package_id'],))
                    pkg['components'] = [dict(row) for row in cursor.fetchall()]
            
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps(convert_decimals({'packages': packages}))
            }
    
    if path == 'glass_package':
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            package = body_data.get('package', {})
            
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Database unavailable'})
                }
            
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO t_p56372141_online_booking_integ.glass_packages 
                (package_name, package_article, product_type, glass_type, glass_thickness, glass_price_per_sqm, 
                hardware_set, hardware_price, markup_percent, installation_price, description, sketch_image_url, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING package_id""",
                (package.get('package_name'), package.get('package_article', ''),
                 package.get('product_type'), package.get('glass_type'),
                 package.get('glass_thickness'), package.get('glass_price_per_sqm'),
                 package.get('hardware_set'), package.get('hardware_price'),
                 package.get('markup_percent'), package.get('installation_price'),
                 package.get('description'), package.get('sketch_image_url', ''),
                 package.get('is_active', True))
            )
            package_id = cursor.fetchone()['package_id']
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'package_id': package_id})
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            package = body_data.get('package', {})
            
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Database unavailable'})
                }
            
            cursor = conn.cursor()
            cursor.execute(
                """UPDATE t_p56372141_online_booking_integ.glass_packages 
                SET package_name = %s, package_article = %s, product_type = %s, glass_type = %s, glass_thickness = %s,
                glass_price_per_sqm = %s, hardware_set = %s, hardware_price = %s,
                markup_percent = %s, installation_price = %s, description = %s, sketch_image_url = %s,
                is_active = %s, updated_at = CURRENT_TIMESTAMP
                WHERE package_id = %s""",
                (package.get('package_name'), package.get('package_article', ''),
                 package.get('product_type'), package.get('glass_type'),
                 package.get('glass_thickness'), package.get('glass_price_per_sqm'),
                 package.get('hardware_set'), package.get('hardware_price'),
                 package.get('markup_percent'), package.get('installation_price'),
                 package.get('description'), package.get('sketch_image_url', ''),
                 package.get('is_active', True),
                 package.get('package_id'))
            )
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        elif method == 'DELETE':
            package_id = event.get('queryStringParameters', {}).get('id', '')
            
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Database unavailable'})
                }
            
            cursor = conn.cursor()
            cursor.execute(
                "DELETE FROM t_p56372141_online_booking_integ.glass_packages WHERE package_id = %s",
                (package_id,)
            )
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
    
    if path == 'package_components':
        if method == 'GET':
            package_id = event.get('queryStringParameters', {}).get('package_id', '')
            
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Database unavailable'})
                }
            
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    pc.id, 
                    pc.package_id,
                    pc.component_id,
                    pc.quantity,
                    pc.is_required,
                    c.component_name,
                    c.component_type,
                    c.article,
                    c.characteristics,
                    c.unit,
                    c.price_per_unit
                FROM t_p56372141_online_booking_integ.package_components pc
                JOIN t_p56372141_online_booking_integ.glass_components c ON pc.component_id = c.component_id
                WHERE pc.package_id = %s AND c.is_active = true
                ORDER BY c.component_type, c.component_name
            """, (package_id,))
            
            components_data = []
            for row in cursor.fetchall():
                comp_dict = dict(row)
                comp_id = comp_dict['component_id']
                
                cursor.execute("""
                    SELECT 
                        c.component_id,
                        c.component_name,
                        c.component_type,
                        c.article,
                        c.characteristics,
                        c.unit,
                        c.price_per_unit
                    FROM t_p56372141_online_booking_integ.component_alternatives ca
                    JOIN t_p56372141_online_booking_integ.glass_components c ON ca.alternative_component_id = c.component_id
                    WHERE ca.component_id = %s AND c.is_active = true
                    ORDER BY ca.priority
                """, (comp_id,))
                
                alternatives = [dict(alt_row) for alt_row in cursor.fetchall()]
                comp_dict['alternatives'] = alternatives
                components_data.append(comp_dict)
            
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps(convert_decimals({'components': components_data}))
            }
    
    if path == 'glass_components':
        if method == 'GET':
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Database unavailable'})
                }
            
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM t_p56372141_online_booking_integ.glass_components WHERE is_active = true ORDER BY component_type, component_name")
            components = [dict(row) for row in cursor.fetchall()]
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps(convert_decimals({'components': components}))
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action_type = body_data.get('action_type', '')
            
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Database unavailable'})
                }
            
            cursor = conn.cursor()
            
            if action_type == 'import':
                components_data = body_data.get('components', [])
                imported = 0
                
                for comp in components_data:
                    cursor.execute(
                        """INSERT INTO t_p56372141_online_booking_integ.glass_components 
                        (component_name, component_type, article, characteristics, unit, price_per_unit, is_active)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                        (comp.get('component_name'), comp.get('component_type'), 
                         comp.get('article', ''), comp.get('characteristics', ''),
                         comp.get('unit', 'шт'), comp.get('price_per_unit', 0), True)
                    )
                    imported += 1
                
                conn.commit()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'imported': imported})
                }
            
            elif action_type == 'create':
                component = body_data.get('component', {})
                cursor.execute(
                    """INSERT INTO t_p56372141_online_booking_integ.glass_components 
                    (component_name, component_type, article, characteristics, unit, price_per_unit, is_active)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING component_id""",
                    (component.get('component_name'), component.get('component_type'),
                     component.get('article', ''), component.get('characteristics', ''),
                     component.get('unit', 'шт'), component.get('price_per_unit', 0),
                     component.get('is_active', True))
                )
                component_id = cursor.fetchone()['component_id']
                conn.commit()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'component_id': component_id})
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            component = body_data.get('component', {})
            
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Database unavailable'})
                }
            
            cursor = conn.cursor()
            cursor.execute(
                """UPDATE t_p56372141_online_booking_integ.glass_components 
                SET component_name = %s, component_type = %s, article = %s, 
                characteristics = %s, unit = %s, price_per_unit = %s, is_active = %s
                WHERE component_id = %s""",
                (component.get('component_name'), component.get('component_type'),
                 component.get('article'), component.get('characteristics'),
                 component.get('unit'), component.get('price_per_unit'),
                 component.get('is_active'), component.get('component_id'))
            )
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        elif method == 'DELETE':
            component_id = event.get('queryStringParameters', {}).get('id', '')
            
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Database unavailable'})
                }
            
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE t_p56372141_online_booking_integ.glass_components SET is_active = false WHERE component_id = %s",
                (component_id,)
            )
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
    
    if path == 'package_component':
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action_type = body_data.get('action_type', '')
            
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Database unavailable'})
                }
            
            cursor = conn.cursor()
            
            if action_type == 'add':
                cursor.execute(
                    """INSERT INTO t_p56372141_online_booking_integ.package_components 
                    (package_id, component_id, quantity, is_required)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id""",
                    (body_data.get('package_id'), body_data.get('component_id'),
                     body_data.get('quantity', 1), body_data.get('is_required', True))
                )
                pc_id = cursor.fetchone()['id']
                conn.commit()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'id': pc_id})
                }
        
        elif method == 'DELETE':
            pc_id = event.get('queryStringParameters', {}).get('id', '')
            
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Database unavailable'})
                }
            
            cursor = conn.cursor()
            cursor.execute(
                "DELETE FROM t_p56372141_online_booking_integ.package_components WHERE id = %s",
                (pc_id,)
            )
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
    
    if path == 'component_alternative' and method == 'POST':
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
            """INSERT INTO t_p56372141_online_booking_integ.component_alternatives 
            (component_id, alternative_component_id, priority)
            VALUES (%s, %s, %s)
            RETURNING id""",
            (body_data.get('component_id'), body_data.get('alternative_component_id'),
             body_data.get('priority', 1))
        )
        alt_id = cursor.fetchone()['id']
        conn.commit()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'id': alt_id})
        }
    
    if path == 'glass_order' and method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        order = body_data.get('order', {})
        
        if not conn:
            return {
                'statusCode': 503,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Database unavailable'})
            }
        
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO t_p56372141_online_booking_integ.glass_orders
            (package_id, customer_name, customer_phone, customer_email, width, height,
            square_meters, glass_cost, hardware_cost, installation_cost, markup_amount,
            total_price, notes, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING order_id""",
            (order.get('package_id'), order.get('customer_name'), order.get('customer_phone'),
             order.get('customer_email'), order.get('width'), order.get('height'),
             order.get('square_meters'), order.get('glass_cost'), order.get('hardware_cost'),
             order.get('installation_cost'), order.get('markup_amount'), order.get('total_price'),
             order.get('notes'), 'new')
        )
        order_id = cursor.fetchone()['order_id']
        conn.commit()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'order_id': order_id})
        }
    
    if conn:
        conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }