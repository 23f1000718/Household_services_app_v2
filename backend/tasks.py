from celery import shared_task
from .models import ServiceBooking, AppUser, AppRole, ServiceType
import flask_excel as excel
from .mail_reminders import send_message, send_report
from jinja2 import Template

@shared_task(ignore_result=False)
def create_service_booking_csv():
    service_bookings = ServiceBooking.query.all()
    csv_output = excel.make_response_from_query_sets(
        service_bookings, 
        ["id", "service_type_id", "client_id", "provider_id", "booking_date", "completion_date", "satisfaction_score", "client_feedback", "booking_status"], 
        "csv"
    )
    filename = "service_bookings.csv"
    with open(filename, 'wb') as f:
        f.write(csv_output.data)
    return filename

@shared_task(ignore_result=True)
def daily_reminder(subject):
    service_bookings = ServiceBooking.query.filter_by(booking_status='requested').all()
    if len(service_bookings) != 0:
        providers = AppUser.query.filter(AppUser.roles.any(AppRole.role_name == 'provider')).all()
        for provider in providers:
            send_message(
                provider.email, 
                subject, 
                'Hello Service Provider,\n\nYou have pending service bookings.\nPlease visit the application to accept/reject the service bookings.\n\nRegards,\nHomeHaven2.0'
            )
    return "OK"

@shared_task(ignore_result=True)
def monthly_reminder(subject):
    service_bookings_requested = ServiceBooking.query.filter_by(booking_status='requested').all()
    service_bookings_closed = ServiceBooking.query.filter_by(booking_status='closed').all()
    all_service_bookings = ServiceBooking.query.all()
    
    service_type_ids = [booking.service_type_id for booking in all_service_bookings]
    most_frequent = max(set(service_type_ids), key=service_type_ids.count)
    
    service_types = ServiceType.query.all()
    
    if len(service_bookings_requested) != 0:
        clients = AppUser.query.filter(AppUser.roles.any(AppRole.role_name == 'client')).all()
        for client in clients:
            with open('monthly_report_template.html', 'r') as f:
                template = Template(f.read())
            send_report(
                client.email, 
                subject, 
                template.render(
                    email=client.email,
                    request=len(all_service_bookings),
                    close=len(service_bookings_closed),
                    service_bookings=all_service_bookings,
                    service_types=service_types, 
                    high=most_frequent
                )
            )
    return "OK"
