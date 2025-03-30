export default {
    template: `
    <div>
        <h1 class="text-center text-danger">Welcome Professional</h1>
        <h2 class="text-center">Available Service Requests</h2>
        <div class="card text-center" style="width: 77rem;">
            <div class="card-header">
                <div class="container text-center">
                    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-5">
                        <div class="col">ID</div>
                        <div class="col">Service Name</div>
                        <div class="col">Booking Date</div>
                        <div class="col">Status</div>
                        <div class="col">Action</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card text-center" style="width: 77rem;">
            <ul class="list-group list-group-flush">
                <li class="list-group-item" v-for="booking in serviceBookings" v-if="booking.booking_status=='requested'">
                    <div class="container text-center">
                        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-5">
                            <div class="col">{{booking.id}}</div>
                            <div class="col">{{getServiceName(booking.service_type_id)}}</div>
                            <div class="col">{{booking.booking_date}}</div>
                            <div class="col">{{booking.booking_status}}</div>
                            <div class="col">
                                <button class="btn btn-success" @click="accept(booking.id)">Accept</button>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
    <div>
        <h2 class="text-center p-2">Accepted Service Requests</h2>
        <div class="card text-center" style="width: 77rem;">
            <div class="card-header">
                <div class="container text-center">
                    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-5">
                        <div class="col">ID</div>
                        <div class="col">Service Name</div>
                        <div class="col">Booking Date</div>
                        <div class="col">Status</div>
                        <div class="col">Action</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card text-center" style="width: 77rem;">
            <ul class="list-group list-group-flush">
                <li class="list-group-item" v-for="booking in serviceBookings" v-if="booking.booking_status=='assigned' && booking.provider_id==providerId">
                    <div class="container text-center">
                        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-5">
                            <div class="col">{{booking.id}}</div>
                            <div class="col">{{getServiceName(booking.service_type_id)}}</div>
                            <div class="col">{{booking.booking_date}}</div>
                            <div class="col">{{booking.booking_status}}</div>
                            <div class="col">
                                <button class="btn btn-danger" @click="reject(booking.id)">Reject</button>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
    <div>
        <h2 class="text-center p-2">Closed Service Requests</h2>
        <div class="card text-center" style="width: 77rem;">
            <div class="card-header">
                <div class="container text-center">
                    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-5">
                        <div class="col">ID</div>
                        <div class="col">Service Name</div>
                        <div class="col">Booking Date</div>
                        <div class="col">Rating</div>
                        <div class="col">Feedback</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card text-center" style="width: 77rem;">
            <ul class="list-group list-group-flush">
                <li class="list-group-item" v-for="booking in serviceBookings" v-if="booking.booking_status=='closed' && booking.provider_id==providerId">
                    <div class="container text-center">
                        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-5">
                            <div class="col">{{booking.id}}</div>
                            <div class="col">{{getServiceName(booking.service_type_id)}}</div>
                            <div class="col">{{booking.booking_date}}</div>
                            <div class="col">{{booking.satisfaction_score}}</div>
                            <div class="col">{{booking.client_feedback}}</div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
    `,
    data() {
        return {
            serviceBookings: [],
            serviceTypes: [],
            providerId: localStorage.getItem('user_id'),
            error: null
        }
    },
    methods: {
        async accept(id) {
            const res = await fetch(`/api/accept/service-request/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                }
            });
            const data = await res.json();
            if(res.ok){
                alert(data.message);
                this.fetchServiceBookings();
            } else {
                this.error = data.message;
            }
        },
        async reject(id) {
            const res = await fetch(`/api/reject/service-request/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                }
            });
            const data = await res.json();
            if(res.ok){
                alert(data.message);
                this.fetchServiceBookings();
            } else {
                this.error = data.message;
            }
        },
        getServiceName(serviceTypeId) {
            const serviceType = this.serviceTypes.find(s => s.id === serviceTypeId);
            return serviceType ? serviceType.service_name : 'Unknown Service';
        },
        async fetchServiceBookings() {
            try {
                const res = await fetch('/api/services', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    this.serviceBookings = data.service_bookings;
                    this.serviceTypes = data.service_types;
                } else {
                    throw new Error(data.message || 'Failed to fetch service bookings');
                }
            } catch (error) {
                console.error('Error fetching service bookings:', error);
                this.error = error.message;
            }
        }
    },
    mounted() {
        this.fetchServiceBookings();
    }
}
