from flask import current_app as app, jsonify, request, render_template, send_file
from flask_security import auth_required, roles_required
from werkzeug.security import check_password_hash
from flask_restful import marshal, fields
import flask_excel as excel
from celery.result import AsyncResult
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

from .models import AppRole, AppUser, ServiceProvider, ServiceType, Client, ServiceBooking, db
from .security import datastore
from .tasks import create_service_booking_csv

@app.get('/')
def home():
    return render_template("index.html")

@app.get('/admin')
@auth_required("token")
@roles_required("admin")
def admin():
    return "Welcome Admin"

@app.get('/activate/provider/<int:pro_id>')
@auth_required("token")
@roles_required("admin")
def activate_provider(pro_id):
    provider = ServiceProvider.query.get(pro_id)
    user_provider = AppUser.query.get(provider.user_id)
    if not user_provider or "provider" not in [role.role_name for role in user_provider.roles]:
        return jsonify({"message": "Provider Not Found"}), 404
    
    user_provider.is_active = True
    provider.is_verified = True
    db.session.commit()
    return jsonify({"message": "Provider Activated"})

@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message": "Email Not Provided"}), 400
    
    user = datastore.find_user(email=email)
    if not user:
        return jsonify({"message": "User Not Found"}), 404
    
    if check_password_hash(user.password, data.get("password")):
        return jsonify({
            "id": user.id, 
            "token": user.get_auth_token(), 
            "email": user.email, 
            "role": user.roles[0].role_name, 
            "active": user.is_active
        })
    else:
        return jsonify({"message": "Wrong Password"}), 400

@app.get('/delete/service/<int:id>')
@auth_required('token')
@roles_required('admin')
def del_service(id):
    service = ServiceType.query.get(id)
    db.session.delete(service)
    db.session.commit()
    return jsonify({"message": "Service Deleted"})

@app.get('/delete/provider/<int:id>')
@auth_required('token')
@roles_required('admin')
def del_provider(id):
    provider = ServiceProvider.query.get(id)
    user_id = provider.user_id
    db.session.delete(provider)
    provider_user = AppUser.query.get(user_id)
    db.session.delete(provider_user)
    db.session.commit()
    return jsonify({"message": "Provider Deleted"})

@app.get('/delete/client/<int:id>')
@auth_required('token')
@roles_required('admin')
def del_client(id):
    client = Client.query.get(id)
    user_id = client.user_id
    db.session.delete(client)
    client_user = AppUser.query.get(user_id)
    db.session.delete(client_user)
    db.session.commit()
    return jsonify({"message": "Client Deleted"})

@app.get('/service-details/<int:id>')
def service_details(id):
    service_booking = ServiceBooking.query.get(id)
    service = ServiceType.query.get(service_booking.service_type_id)
    provider = ServiceProvider.query.get(service_booking.provider_id)
    
    if service_booking.booking_status in ['requested', 'assigned']:
        return jsonify({
            "name": service.service_name, 
            "details": service.service_details, 
            "provider": provider.name
        })
    
    if service_booking.booking_status == 'closed':
        return jsonify({
            "name": service.service_name, 
            "details": service.service_details, 
            "provider": provider.name, 
            "rating": service_booking.satisfaction_score, 
            "feedback": service_booking.client_feedback
        })

@app.get('/download-csv')
def download_csv():
    task = create_service_booking_csv.delay()
    return jsonify({"task-id": task.id})

@app.get('/get-csv/<task_id>')
def get_csv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        filename = res.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"message": "Task Pending"}), 404

@app.get('/test')
def test():
    service_bookings = ServiceBooking.query.with_entities(ServiceBooking.service_type_id).all()
    service_ids = []
    for service_booking in service_bookings:
        service_ids.append(service_booking.service_type_id)
    most_frequent = max(set(service_ids), key=service_ids.count)
    return jsonify({"message": "OK"})

@app.post('/api/customers')
def register_customer():
    data = request.get_json()
    
    # Check if user already exists
    if datastore.find_user(email=data.get('email')):
        return jsonify({"message": "User already exists"}), 400
    
    try:
        # Create the user directly with SQLAlchemy instead of using datastore
        user = AppUser(
                email=data.get('email'),
                password=generate_password_hash(data.get('password')),  # Add password hashing here
                is_active=True,
                fs_uniquifier=str(uuid.uuid4())
            )   
        
        # Get client role
        client_role = AppRole.query.filter_by(role_name='client').first()
        if not client_role:
            client_role = AppRole(role_name='client', role_description='Client role')
            db.session.add(client_role)
            db.session.flush()
        
        # Associate role with user
        user.roles = [client_role]
        db.session.add(user)
        db.session.flush()  # This gets the user ID without committing
        
        # Create client profile
        client = Client(
            name=data.get('full_name'),
            home_address=data.get('address'),
            postal_code=data.get('pincode'),
            phone_number=data.get('phone_number', ''),
            user_id=user.id
        )
        
        db.session.add(client)
        db.session.commit()
        
        return jsonify({"message": "Customer registered successfully"})
    except Exception as e:
        db.session.rollback()
        print(f"Error during registration: {str(e)}")
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500

