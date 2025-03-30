from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()

# Association table for users and roles
class UserRoleAssociation(db.Model):
    __tablename__ = 'user_role_association'
    
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('app_user.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('app_role.id'))

# Base user model
class AppUser(db.Model, UserMixin):
    __tablename__ = 'app_user'
    
    id = db.Column(db.Integer(), primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean(), default=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    
    roles = db.relationship('AppRole', secondary='user_role_association', 
                          backref=db.backref('app_users', lazy='dynamic'))
    
    client = db.relationship('Client', backref='user', uselist=False)
    provider = db.relationship('ServiceProvider', backref='user', uselist=False)

# Client model (equivalent to Customer)
class Client(db.Model):
    __tablename__ = 'client'
    
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    home_address = db.Column(db.String(255))
    postal_code = db.Column(db.String(20))
    phone_number = db.Column(db.String(20))
    user_id = db.Column(db.Integer(), db.ForeignKey('app_user.id'))
    
    service_bookings = db.relationship('ServiceBooking', backref='client')

# Service provider model (equivalent to Professional)
class ServiceProvider(db.Model):
    __tablename__ = 'service_provider'
    
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    specialty = db.Column(db.String(255))
    years_experience = db.Column(db.Integer())
    home_address = db.Column(db.String(255))
    postal_code = db.Column(db.String(20))
    phone_number = db.Column(db.String(20))
    is_verified = db.Column(db.Boolean(), default=False)
    user_id = db.Column(db.Integer(), db.ForeignKey('app_user.id'))
    
    service_bookings = db.relationship('ServiceBooking', backref='provider')

# Role model
class AppRole(db.Model, RoleMixin):
    __tablename__ = 'app_role'
    
    id = db.Column(db.Integer(), primary_key=True)
    role_name = db.Column(db.String(80), unique=True)
    role_description = db.Column(db.String(255))

# Service type model
class ServiceType(db.Model):
    __tablename__ = 'service_type'
    
    id = db.Column(db.Integer, primary_key=True)
    service_name = db.Column(db.String(100), unique=True, nullable=False)
    base_cost = db.Column(db.Float(), nullable=False)
    estimated_duration = db.Column(db.String(50), nullable=False)
    service_details = db.Column(db.Text(), nullable=False)
    
    bookings = db.relationship('ServiceBooking', backref='service_type')

# Service booking model (equivalent to ServiceRequest)
class ServiceBooking(db.Model):
    __tablename__ = 'service_booking'
    
    id = db.Column(db.Integer, primary_key=True)
    service_type_id = db.Column(db.Integer, db.ForeignKey('service_type.id'))
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'))
    provider_id = db.Column(db.Integer, db.ForeignKey('service_provider.id'))
    
    booking_date = db.Column(db.String(50))
    completion_date = db.Column(db.String(50))
    satisfaction_score = db.Column(db.Integer())
    client_feedback = db.Column(db.Text())
    booking_status = db.Column(db.String(50))  # requested/assigned/completed/cancelled
