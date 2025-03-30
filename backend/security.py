from flask_security import SQLAlchemyUserDatastore
from .models import db, AppUser, AppRole

datastore = SQLAlchemyUserDatastore(db, AppUser, AppRole)
