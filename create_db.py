from flask import Flask
from backend.models import db
from config import DevelopmentConfig

app = Flask(__name__)
app.config.from_object(DevelopmentConfig)
db.init_app(app)

with app.app_context():
    db.create_all()
    print("Database tables created successfully!")
