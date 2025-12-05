import json
import os
from typing import Dict, Any, Optional
from decimal import Decimal
from datetime import datetime, date

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
    elif isinstance(obj, (datetime, date)):
        return obj.isoformat()
    return obj

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления комплектами стеклянных конструкций
    Args: event с httpMethod, queryStringParameters, body
    Returns: JSON с данными комплектов, компонентов или результатом операций
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
            'body': '',
            'isBase64Encoded': False
        }
    
    action = event.get('queryStringParameters', {}).get('action', '')
    conn = get_db_connection()
    
    if not conn:
        return {
            'statusCode': 503,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Database unavailable'})
        }
    
    try:
        cursor = conn.cursor()
        
        if method == 'GET':
            if action == 'glass_packages':
                params = event.get('queryStringParameters', {})
                active_only = params.get('active_only') == 'true'
                with_components = params.get('with_components') == 'true'
                
                if active_only:
                    cursor.execute("SELECT * FROM t_p56372141_online_booking_integ.glass_packages WHERE is_active = true ORDER BY package_id DESC")
                else:
                    cursor.execute("SELECT * FROM t_p56372141_online_booking_integ.glass_packages ORDER BY package_id DESC")
                
                packages = cursor.fetchall()
                
                if with_components:
                    for pkg in packages:
                        cursor.execute("""
                            SELECT pc.*, gc.* 
                            FROM t_p56372141_online_booking_integ.package_components pc
                            JOIN t_p56372141_online_booking_integ.glass_components gc ON pc.component_id = gc.component_id
                            WHERE pc.package_id = %s
                            ORDER BY pc.id
                        """, (pkg['package_id'],))
                        components = cursor.fetchall()
                        
                        for comp in components:
                            cursor.execute("""
                                SELECT gc.*
                                FROM t_p56372141_online_booking_integ.component_alternatives ca
                                JOIN t_p56372141_online_booking_integ.glass_components gc ON ca.alternative_component_id = gc.component_id
                                WHERE ca.component_id = %s
                            """, (comp['component_id'],))
                            alternatives = cursor.fetchall()
                            comp['alternatives'] = alternatives if alternatives else []
                        
                        pkg['components'] = components
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'packages': convert_decimals(packages)})
                }
            
            elif action == 'glass_components':
                cursor.execute("SELECT * FROM t_p56372141_online_booking_integ.glass_components ORDER BY component_name")
                components = cursor.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'components': convert_decimals(components)})
                }
            
            elif action == 'package_components':
                package_id = event.get('queryStringParameters', {}).get('package_id')
                cursor.execute("""
                    SELECT pc.*, gc.* 
                    FROM t_p56372141_online_booking_integ.package_components pc
                    JOIN t_p56372141_online_booking_integ.glass_components gc ON pc.component_id = gc.component_id
                    WHERE pc.package_id = %s
                    ORDER BY pc.id
                """, (package_id,))
                components = cursor.fetchall()
                
                for comp in components:
                    cursor.execute("""
                        SELECT gc.*
                        FROM t_p56372141_online_booking_integ.component_alternatives ca
                        JOIN t_p56372141_online_booking_integ.glass_components gc ON ca.alternative_component_id = gc.component_id
                        WHERE ca.component_id = %s
                    """, (comp['component_id'],))
                    alternatives = cursor.fetchall()
                    comp['alternatives'] = alternatives if alternatives else []
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'components': convert_decimals(components)})
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', '')
            
            if action == 'glass_package':
                pkg = body.get('package', {})
                cursor.execute("""
                    INSERT INTO t_p56372141_online_booking_integ.glass_packages 
                    (package_name, package_article, product_type, glass_type, glass_thickness, 
                     glass_price_per_sqm, hardware_set, hardware_price, markup_percent, 
                     installation_price, description, sketch_image_url, is_active,
                     has_door, default_partition_height, default_partition_width,
                     default_door_height, default_door_width, sketch_svg,
                     default_door_position, default_door_offset, default_door_panels)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING package_id
                """, (
                    pkg.get('package_name'), pkg.get('package_article'), pkg.get('product_type'),
                    pkg.get('glass_type'), pkg.get('glass_thickness'), pkg.get('glass_price_per_sqm'),
                    pkg.get('hardware_set', ''), pkg.get('hardware_price', 0), pkg.get('markup_percent', 20),
                    pkg.get('installation_price', 3000), pkg.get('description', ''),
                    pkg.get('sketch_image_url', ''), pkg.get('is_active', True),
                    pkg.get('has_door', False), pkg.get('default_partition_height', 1900),
                    pkg.get('default_partition_width', 1000), pkg.get('default_door_height', 1900),
                    pkg.get('default_door_width', 800), pkg.get('sketch_svg', ''),
                    pkg.get('default_door_position', 'center'), pkg.get('default_door_offset', '0'),
                    pkg.get('default_door_panels', 1)
                ))
                result = cursor.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'package_id': result['package_id']})
                }
            
            elif action == 'glass_component':
                comp = body.get('component', {})
                cursor.execute("""
                    INSERT INTO t_p56372141_online_booking_integ.glass_components 
                    (component_name, component_type, article, characteristics, unit, price_per_unit, is_active)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING component_id
                """, (
                    comp.get('component_name'), comp.get('component_type'), comp.get('article'),
                    comp.get('characteristics', ''), comp.get('unit', 'шт'),
                    comp.get('price_per_unit', 0), comp.get('is_active', True)
                ))
                result = cursor.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'component_id': result['component_id']})
                }
            
            elif action == 'package_component':
                package_id = body.get('package_id')
                component_id = body.get('component_id')
                quantity = body.get('quantity', 1)
                is_required = body.get('is_required', True)
                
                cursor.execute("""
                    SELECT id FROM t_p56372141_online_booking_integ.package_components 
                    WHERE package_id = %s AND component_id = %s
                """, (package_id, component_id))
                existing = cursor.fetchone()
                
                if existing:
                    cursor.execute("""
                        UPDATE t_p56372141_online_booking_integ.package_components 
                        SET quantity = %s, is_required = %s
                        WHERE package_id = %s AND component_id = %s
                    """, (quantity, is_required, package_id, component_id))
                else:
                    cursor.execute("""
                        INSERT INTO t_p56372141_online_booking_integ.package_components 
                        (package_id, component_id, quantity, is_required)
                        VALUES (%s, %s, %s, %s)
                    """, (package_id, component_id, quantity, is_required))
                
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'component_alternative':
                component_id = body.get('component_id')
                alternative_id = body.get('alternative_component_id')
                
                cursor.execute("""
                    SELECT id FROM t_p56372141_online_booking_integ.component_alternatives 
                    WHERE component_id = %s AND alternative_component_id = %s
                """, (component_id, alternative_id))
                existing = cursor.fetchone()
                
                if not existing:
                    cursor.execute("""
                        INSERT INTO t_p56372141_online_booking_integ.component_alternatives 
                        (component_id, alternative_component_id)
                        VALUES (%s, %s)
                    """, (component_id, alternative_id))
                
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'swap_main_alternative':
                package_id = body.get('package_id')
                current_main_id = body.get('current_main_id')
                new_main_id = body.get('new_main_id')
                
                cursor.execute("""
                    SELECT quantity, is_required FROM t_p56372141_online_booking_integ.package_components 
                    WHERE package_id = %s AND component_id = %s
                """, (package_id, current_main_id))
                main_data = cursor.fetchone()
                
                if main_data:
                    cursor.execute("""
                        DELETE FROM t_p56372141_online_booking_integ.component_alternatives 
                        WHERE component_id = %s AND alternative_component_id = %s
                    """, (current_main_id, new_main_id))
                    
                    cursor.execute("""
                        UPDATE t_p56372141_online_booking_integ.package_components 
                        SET component_id = %s
                        WHERE package_id = %s AND component_id = %s
                    """, (new_main_id, package_id, current_main_id))
                    
                    cursor.execute("""
                        INSERT INTO t_p56372141_online_booking_integ.component_alternatives 
                        (component_id, alternative_component_id)
                        VALUES (%s, %s)
                    """, (new_main_id, current_main_id))
                    
                    cursor.execute("""
                        UPDATE t_p56372141_online_booking_integ.component_alternatives 
                        SET component_id = %s
                        WHERE component_id = %s
                    """, (new_main_id, current_main_id))
                
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', '')
            
            if action == 'glass_package':
                pkg = body.get('package', {})
                cursor.execute("""
                    UPDATE t_p56372141_online_booking_integ.glass_packages 
                    SET package_name=%s, package_article=%s, product_type=%s, glass_type=%s,
                        glass_thickness=%s, glass_price_per_sqm=%s, hardware_set=%s, hardware_price=%s,
                        markup_percent=%s, installation_price=%s, description=%s, sketch_image_url=%s, is_active=%s,
                        has_door=%s, default_partition_height=%s, default_partition_width=%s,
                        default_door_height=%s, default_door_width=%s, sketch_svg=%s,
                        default_door_position=%s, default_door_offset=%s, default_door_panels=%s
                    WHERE package_id=%s
                """, (
                    pkg.get('package_name'), pkg.get('package_article'), pkg.get('product_type'),
                    pkg.get('glass_type'), pkg.get('glass_thickness'), pkg.get('glass_price_per_sqm'),
                    pkg.get('hardware_set', ''), pkg.get('hardware_price', 0), pkg.get('markup_percent', 20),
                    pkg.get('installation_price', 3000), pkg.get('description', ''),
                    pkg.get('sketch_image_url', ''), pkg.get('is_active', True),
                    pkg.get('has_door', False), pkg.get('default_partition_height', 1900),
                    pkg.get('default_partition_width', 1000), pkg.get('default_door_height', 1900),
                    pkg.get('default_door_width', 800), pkg.get('sketch_svg', ''),
                    pkg.get('default_door_position', 'center'), pkg.get('default_door_offset', '0'),
                    pkg.get('default_door_panels', 1), pkg.get('package_id')
                ))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'glass_component':
                comp = body.get('component', {})
                cursor.execute("""
                    UPDATE t_p56372141_online_booking_integ.glass_components 
                    SET component_name=%s, component_type=%s, article=%s, characteristics=%s,
                        unit=%s, price_per_unit=%s, is_active=%s
                    WHERE component_id=%s
                """, (
                    comp.get('component_name'), comp.get('component_type'), comp.get('article'),
                    comp.get('characteristics', ''), comp.get('unit', 'шт'),
                    comp.get('price_per_unit', 0), comp.get('is_active', True), comp.get('component_id')
                ))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
        
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', '')
            
            if action == 'glass_package':
                package_id = body.get('package_id')
                cursor.execute("DELETE FROM t_p56372141_online_booking_integ.package_components WHERE package_id = %s", (package_id,))
                cursor.execute("DELETE FROM t_p56372141_online_booking_integ.glass_packages WHERE package_id = %s", (package_id,))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'glass_component':
                component_id = body.get('component_id')
                cursor.execute("DELETE FROM t_p56372141_online_booking_integ.glass_components WHERE component_id = %s", (component_id,))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'component_alternative':
                component_id = body.get('component_id')
                alternative_id = body.get('alternative_component_id')
                cursor.execute("""
                    DELETE FROM t_p56372141_online_booking_integ.component_alternatives 
                    WHERE component_id = %s AND alternative_component_id = %s
                """, (component_id, alternative_id))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Invalid action'})
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        if conn:
            conn.close()