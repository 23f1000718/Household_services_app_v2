from flask_restful import Resource, Api, reqparse, marshal, fields
from flask_security import auth_required, roles_required, current_user
from .models import ServiceType, Client, AppUser, ServiceProvider, ServiceBooking, db
from werkzeug.security import generate_password_hash
from backend.security import datastore
from datetime import datetime
from .instances import cache

api = Api(prefix='/api')

parser1 = reqparse.RequestParser()
parser1.add_argument('service_name', type=str, required=True)
parser1.add_argument('base_cost', type=float, required=True)
parser1.add_argument('estimated_duration', type=str, required=True)
parser1.add_argument('service_details', type=str, required=True)

service_fields = {
    "id": fields.Integer,
    "service_name": fields.String,
    "base_cost": fields.Float,
    "estimated_duration": fields.String,
    "service_details": fields.String
}

class Services(Resource):
    @auth_required("token")
    @cache.cached(timeout=50)
    def get(self):
        all_services = ServiceType.query.all()
        if "provider" not in current_user.roles:
            return marshal(all_services, service_fields)

    @auth_required("token")
    @roles_required("admin")
    def post(self):
        args = parser1.parse_args()
        service = ServiceType(**args)
        db.session.add(service)
        db.session.commit()
        return {"message": "Service Created"}

class UpdateService(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self, id):
        service = ServiceType.query.get(id)
        return marshal(service, service_fields)

    def post(self, id):
        service = ServiceType.query.get(id)
        args = parser1.parse_args()
        service.service_name = args.service_name
        service.base_cost = args.base_cost
        service.estimated_duration = args.estimated_duration
        service.service_details = args.service_details
        db.session.commit()
        return {"message": "Service Updated"}

parser2 = reqparse.RequestParser()
parser2.add_argument('email', type=str, required=True)
parser2.add_argument('password', type=str, required=True)
parser2.add_argument('name', type=str, required=True)
parser2.add_argument('home_address', type=str, required=True)
parser2.add_argument('postal_code', type=str, required=True)
parser2.add_argument('phone_number', type=str, required=True)

client_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "home_address": fields.String,
    "postal_code": fields.String,
    "phone_number": fields.String,
    "user_id": fields.Integer
}

class Clients(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        clients = Client.query.all()
        if len(clients) == 0:
            return {"message": "No User Found"}, 404
        return marshal(clients, client_fields)

    def post(self):
        args = parser2.parse_args()
        datastore.create_user(email=args.email, password=generate_password_hash(args.password), roles=['client'])
        client = Client(name=args.name, home_address=args.home_address, postal_code=args.postal_code, phone_number=args.phone_number, user_id=AppUser.query.filter_by(email=args.email).first().id)
        db.session.add(client)
        db.session.commit()
        return {"message": "Client Added"}

parser3 = reqparse.RequestParser()
parser3.add_argument('email', type=str, required=True)
parser3.add_argument('password', type=str, required=True)
parser3.add_argument('name', type=str, required=True)
parser3.add_argument('specialty', type=str, required=True)
parser3.add_argument('years_experience', type=int, required=True)
parser3.add_argument('home_address', type=str, required=True)
parser3.add_argument('postal_code', type=str, required=True)
parser3.add_argument('phone_number', type=str, required=True)

provider_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "specialty": fields.String,
    "years_experience": fields.Integer,
    "is_verified": fields.Boolean
}

class Providers(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        providers = ServiceProvider.query.all()
        if len(providers) == 0:
            return {"message": "No User Found"}, 404
        return marshal(providers, provider_fields)

    def post(self):
        args = parser3.parse_args()
        datastore.create_user(email=args.email, password=generate_password_hash(args.password), roles=['provider'], is_active=False)
        provider = ServiceProvider(name=args.name, specialty=args.specialty, years_experience=args.years_experience, home_address=args.home_address, postal_code=args.postal_code, phone_number=args.phone_number, user_id=AppUser.query.filter_by(email=args.email).first().id, is_verified=False)
        db.session.add(provider)
        db.session.commit()
        return {"message": "Service Provider Added"}

parser4 = reqparse.RequestParser()
parser4.add_argument('service_type_id', type=int)
parser4.add_argument('client_id', type=int)
parser4.add_argument('provider_id', type=int)
parser4.add_argument('completion_date', type=str)
parser4.add_argument('booking_status', type=str)

booking_fields = {
    "id": fields.Integer,
    "service_type_id": fields.Integer,
    "client_id": fields.Integer,
    "provider_id": fields.Integer,
    "booking_date": fields.String,
    "completion_date": fields.String,
    "satisfaction_score": fields.Integer,
    "client_feedback": fields.String,
    "booking_status": fields.String
}

class ServiceBookings(Resource):
    def get(self):
        bookings = ServiceBooking.query.all()
        if len(bookings) == 0:
            return {"message": "No Bookings Found"}, 404
        all_services = ServiceType.query.all()
        return {
            'bookings': marshal(bookings, booking_fields),
            'services': marshal(all_services, service_fields)
        }

    def post(self):
        args = parser4.parse_args()
        booking = ServiceBooking(service_type_id=args.service_type_id, client_id=args.client_id, booking_date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"), booking_status='requested')
        db.session.add(booking)
        db.session.commit()
        return {"message": "Service Booking Added"}

class AcceptServiceBooking(Resource):
    def get(self, id):
        booking = ServiceBooking.query.get(id)
        booking.provider_id = None
        booking.booking_status = 'requested'
        db.session.commit()
        return {"message": "Service Booking Rejected"}

    def post(self, id):
        booking = ServiceBooking.query.get(id)
        args = parser4.parse_args()
        booking.provider_id = args.provider_id
        booking.booking_status = 'assigned'
        db.session.commit()
        return {"message": "Service Booking Accepted"}

parser5 = reqparse.RequestParser()
parser5.add_argument('user_id', type=int, required=True)

class ServiceBookingByClient(Resource):
    def post(self):
        args = parser5.parse_args()
        client = Client.query.filter_by(user_id=args.user_id).first()
        bookings = ServiceBooking.query.filter_by(client_id=client.id).all()
        all_services = ServiceType.query.all()
        return {
            'bookings': marshal(bookings, booking_fields),
            'services': marshal(all_services, service_fields)
        }

parser6 = reqparse.RequestParser()
parser6.add_argument('satisfaction_score', type=int, required=True)
parser6.add_argument('client_feedback', type=str)

class CloseServiceBooking(Resource):
    def post(self, id):
        args = parser6.parse_args()
        booking = ServiceBooking.query.get(id)
        booking.satisfaction_score = args.satisfaction_score
        booking.client_feedback = args.client_feedback
        booking.completion_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        booking.booking_status = 'closed'
        db.session.commit()
        return {"message": "Service Booking Closed"}

api.add_resource(Services, '/services')
api.add_resource(Clients, '/clients')
api.add_resource(Providers, '/providers')
api.add_resource(UpdateService, '/update/service/<int:id>')
api.add_resource(ServiceBookings, '/bookings')
api.add_resource(AcceptServiceBooking, '/accept/booking/<int:id>')
api.add_resource(ServiceBookingByClient, '/bookings/client')
api.add_resource(CloseServiceBooking, '/close/booking/<int:id>')
