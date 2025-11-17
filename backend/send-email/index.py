import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any

def send_email(to_email: str, subject: str, html_body: str) -> bool:
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    print(f"SMTP Config - Host: {smtp_host}, Port: {smtp_port}, User: {smtp_user}, To: {to_email}")
    
    if not all([smtp_host, smtp_user, smtp_password]):
        print(f"SMTP not configured: host={bool(smtp_host)}, user={bool(smtp_user)}, password={bool(smtp_password)}")
        return False
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = smtp_user
    msg['To'] = to_email
    
    html_part = MIMEText(html_body, 'html')
    msg.attach(html_part)
    
    if smtp_port == 465:
        server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=15)
    else:
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
        server.starttls()
    
    server.login(smtp_user, smtp_password)
    server.send_message(msg)
    server.quit()
    
    return True

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Отправка email-уведомлений пациентам о записях
    Args: event с httpMethod, body содержащим type, appointmentData
    Returns: JSON с результатом отправки
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
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    email_type = body_data.get('type')
    data = body_data.get('appointmentData', {})
    
    to_email = data.get('patientEmail') or data.get('patient_email')
    
    if not to_email:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Email not provided'})
        }
    
    if email_type == 'created':
        subject = 'Запись в клинику подтверждена'
        html_body = f'''
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0EA5E9;">Ваша запись подтверждена!</h2>
                    <p>Здравствуйте, {data.get('patientName') or data.get('patient_name')}!</p>
                    <p>Ваша запись успешно создана. Детали записи:</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Номер записи:</strong> {data.get('appointmentId') or data.get('appointment_id')}</p>
                        <p><strong>Услуга:</strong> {data.get('serviceName') or data.get('service_name')}</p>
                        <p><strong>Врач:</strong> {data.get('doctorName') or data.get('doctor_name')}</p>
                        <p><strong>Дата:</strong> {data.get('date') or data.get('appointment_date')}</p>
                        <p><strong>Время:</strong> {data.get('time') or data.get('appointment_time')}</p>
                        <p><strong>Стоимость:</strong> {data.get('servicePrice') or data.get('service_price')} ₽</p>
                    </div>
                    
                    <p>Пожалуйста, приходите за 10 минут до назначенного времени.</p>
                    <p>Для отмены или переноса записи используйте номер записи на нашем сайте.</p>
                    
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">
                        С уважением,<br>
                        Команда клиники
                    </p>
                </div>
            </body>
        </html>
        '''
    
    elif email_type == 'rescheduled':
        subject = 'Запись перенесена'
        html_body = f'''
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0EA5E9;">Ваша запись перенесена</h2>
                    <p>Здравствуйте, {data.get('patientName') or data.get('patient_name')}!</p>
                    <p>Ваша запись успешно перенесена на новое время:</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Номер записи:</strong> {data.get('appointmentId') or data.get('appointment_id')}</p>
                        <p><strong>Новая дата:</strong> {data.get('newDate') or data.get('appointment_date')}</p>
                        <p><strong>Новое время:</strong> {data.get('newTime') or data.get('appointment_time')}</p>
                        <p><strong>Услуга:</strong> {data.get('serviceName') or data.get('service_name')}</p>
                        <p><strong>Врач:</strong> {data.get('doctorName') or data.get('doctor_name')}</p>
                    </div>
                    
                    <p>Ждем вас в указанное время!</p>
                    
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">
                        С уважением,<br>
                        Команда клиники
                    </p>
                </div>
            </body>
        </html>
        '''
    
    elif email_type == 'cancelled':
        subject = 'Запись отменена'
        html_body = f'''
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0EA5E9;">Запись отменена</h2>
                    <p>Здравствуйте, {data.get('patientName') or data.get('patient_name')}!</p>
                    <p>Ваша запись была отменена:</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Номер записи:</strong> {data.get('appointmentId') or data.get('appointment_id')}</p>
                        <p><strong>Услуга:</strong> {data.get('serviceName') or data.get('service_name')}</p>
                        <p><strong>Врач:</strong> {data.get('doctorName') or data.get('doctor_name')}</p>
                    </div>
                    
                    <p>Если вы хотите записаться снова, посетите наш сайт.</p>
                    
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">
                        С уважением,<br>
                        Команда клиники
                    </p>
                </div>
            </body>
        </html>
        '''
    
    else:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Unknown email type'})
        }
    
    smtp_configured = os.environ.get('SMTP_HOST') and os.environ.get('SMTP_USER')
    
    if not smtp_configured:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'message': 'Email skipped (SMTP not configured)'})
        }
    
    try:
        print(f"Attempting to send email to {to_email}, type: {email_type}")
        success = send_email(to_email, subject, html_body)
        
        if success:
            print(f"Email sent successfully to {to_email}")
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'message': 'Email sent'})
            }
        else:
            print(f"Failed to send email to {to_email}")
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Failed to send email'})
            }
    except Exception as e:
        print(f"Email error: {str(e)}")
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'message': f'Email skipped (error: {str(e)})'})
        }