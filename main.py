from flask import Flask
from flask_security import Security
from backend.models import db
from config import DevelopmentConfig
from backend.resources import api
from backend.security import datastore
from backend.worker import celery_init_app
import flask_excel as excel
from celery.schedules import crontab
from backend.tasks import daily_reminder, monthly_reminder
from flask_caching import Cache
from backend.instances import cache
from backend.models import AppUser, AppRole
import uuid


def create_admin_if_not_exists(app):
    with app.app_context():
        admin_role = AppRole.query.filter_by(role_name='admin').first()
        if not admin_role:
            admin_role = AppRole(role_name='admin', role_description='Administrator role')
            db.session.add(admin_role)
        
        admin_user = AppUser.query.filter_by(email='admin@homehaven.com').first()
        if not admin_user:
            admin_user = AppUser(
                email='admin@homehaven.com',
                password=12345,
                is_active=True,
                fs_uniquifier=str(uuid.uuid4()), 
                roles=[admin_role]
            )
            db.session.add(admin_user)
        
        db.session.commit()

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    
    # Initialize extensions
    db.init_app(app)
    api.init_app(app)
    excel.init_excel(app)
    app.security = Security(app, datastore)
    cache.init_app(app)
    
    with app.app_context():
        import backend.views
        db.create_all()
        create_admin_if_not_exists(app)
    
    return app

app = create_app()
celery_app = celery_init_app(app)

@celery_app.on_after_configure.connect
def setup_daily_reminder(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=18, minute=0),  
        daily_reminder.s('Daily Service Booking Reminder')
    )

@celery_app.on_after_configure.connect
def setup_monthly_report(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=9, minute=0, day_of_month=1),  
        monthly_reminder.s('HomeHaven2.0 Monthly Activity Report')
    )

if __name__ == '__main__':
    app.run(debug=True)
