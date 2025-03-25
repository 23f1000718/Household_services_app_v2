from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from celery import Celery
import redis
import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_login import UserMixin

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///household_services_v2.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600
app.config['REDIS_URL'] = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
app.config['CELERY_BROKER_URL'] = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/1')
app.config['CELERY_RESULT_BACKEND'] = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/2')
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

db = SQLAlchemy(app)
jwt = JWTManager(app)

redis_client = redis.Redis.from_url(app.config['REDIS_URL'])

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'], backend=app.config['CELERY_RESULT_BACKEND'])
celery.conf.update(app.config)

#Models
db = SQLAlchemy()

class Users(db.Model, UserMixin):
    __tablename__ = "users"
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    is_customer = db.Column(db.Boolean, nullable=False, default=False)
    is_professional = db.Column(db.Boolean, nullable=False, default=False)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False)  
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)  
    def get_id(self):
        return str(self.user_id)
    
    def __repr__(self):
        return f"User('{self.user_id}', '{self.name}', '{self.username}')"

class ServiceProfessionals(db.Model):
    __tablename__ = "serviceprofessionals"
    professional_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    service_type = db.Column(db.String(50), nullable=False)
    experience = db.Column(db.Integer, nullable=False)
    profile_verified = db.Column(db.Boolean, default=False)  
    is_blocked = db.Column(db.Boolean, default=False)  
    verification_docs = db.Column(db.String(200))  
    avg_rating = db.Column(db.Float, default=0.0)
    total_reviews = db.Column(db.Integer, default=0)
    description = db.Column(db.Text)  

    user = db.relationship('Users', backref='professional_profile', lazy=True)

    def __repr__(self):
        return f"ServiceProfessional('{self.user.username}', '{self.service_type}', '{self.avg_rating}')"

class Customers(db.Model):
    __tablename__ = "customers"
    customer_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    pin_code = db.Column(db.String(10), nullable=False)
    is_blocked = db.Column(db.Boolean, default=False) 

    user = db.relationship('Users', backref='customer_profile', lazy=True)

    def __repr__(self):
        return f"Customer('{self.user.username}', '{self.address}', '{self.pin_code}')"

class Services(db.Model):
    __tablename__ = "services"
    service_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    base_price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=False)
    time_required = db.Column(db.Float, nullable=False)  
    is_active = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f"Service('{self.name}', '{self.base_price}')"

class ServiceRequests(db.Model):
    __tablename__ = "servicerequests"
    service_request_id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.customer_id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.service_id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('serviceprofessionals.professional_id'), nullable=True)  
    date_of_request = db.Column(db.DateTime, default=datetime.utcnow)
    date_of_completion = db.Column(db.DateTime)
    status = db.Column(db.String(50), default='requested')  
    remarks = db.Column(db.Text)
    preferred_date = db.Column(db.DateTime, nullable=False)
    preferred_time = db.Column(db.String(20), nullable=False)
    service_address = db.Column(db.String(200), nullable=False)
    service_pin_code = db.Column(db.String(10), nullable=False)
    special_instructions = db.Column(db.Text)
    price = db.Column(db.Float)  

    customer = db.relationship('Customers', backref='service_requests', lazy=True)
    service = db.relationship('Services', backref='service_requests', lazy=True)
    professional = db.relationship('ServiceProfessionals', backref='service_requests', lazy=True)

    def __repr__(self):
        return f"ServiceRequest('{self.service_request_id}', '{self.service.name}', '{self.status}')"

class Reviews(db.Model):
    __tablename__ = "reviews"
    review_id = db.Column(db.Integer, primary_key=True)
    service_request_id = db.Column(db.Integer, db.ForeignKey('servicerequests.service_request_id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('serviceprofessionals.professional_id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.customer_id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    review_text = db.Column(db.Text)
    date_posted = db.Column(db.DateTime, default=datetime.utcnow)

    service_request = db.relationship('ServiceRequests', backref='reviews', lazy=True)
    professional = db.relationship('ServiceProfessionals', backref='reviews', lazy=True)
    customer = db.relationship('Customers', backref='reviews', lazy=True)

    def __repr__(self):
        return f"Review('{self.review_id}', '{self.professional.user.username}', '{self.rating}')"

class Notifications(db.Model):
    __tablename__ = "notifications"
    notification_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    notification_type = db.Column(db.String(50)) 

    user = db.relationship('Users', backref='notifications', lazy=True)

    def __repr__(self):
        return f"Notification('{self.notification_id}', '{self.user_id}', '{self.notification_type}')"

class BatchJobs(db.Model):
    __tablename__ = "batchjobs"
    job_id = db.Column(db.Integer, primary_key=True)
    job_type = db.Column(db.String(50), nullable=False) 
    status = db.Column(db.String(50), nullable=False) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    details = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    
    user = db.relationship('Users', backref='batch_jobs', lazy=True)

    def __repr__(self):
        return f"BatchJob('{self.job_id}', '{self.job_type}', '{self.status}')"

class MonthlyReports(db.Model):
    __tablename__ = "monthlyreports"
    report_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    report_data = db.Column(db.Text) 
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    sent_at = db.Column(db.DateTime)
    
    user = db.relationship('Users', backref='monthly_reports', lazy=True)

    def __repr__(self):
        return f"MonthlyReport('{self.report_id}', '{self.user_id}', '{self.month}-{self.year}')"

class ExportedReports(db.Model):
    __tablename__ = "exportedreports"
    export_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    file_path = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('Users', backref='exported_reports', lazy=True)

    def __repr__(self):
        return f"ExportedReport('{self.export_id}', '{self.user_id}', '{self.file_path}')"

@app.before_first_request
def create_tables():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)