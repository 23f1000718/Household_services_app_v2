export default{
    template: `
    <div>
        <h2 class="text-center">Service History</h2>
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
                <li class="list-group-item" v-for="booking in serviceBookings" :key="booking.id">
                    <div class="container text-center">
                        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-5">
                            <div class="col">{{booking.id}}</div>
                            <div class="col">{{getServiceName(booking.service_type_id)}}</div>
                            <div class="col">{{booking.booking_date}}</div>
                            <div class="col">{{booking.booking_status}}</div>
                            <div class="col">
                                <button class="btn btn-danger" v-if="booking.booking_status != 'closed'" @click="close(booking.id)">Close Request</button>
                                <button class="btn btn-warning" v-if="booking.booking_status == 'closed'" @click="edit(booking.id)">Edit Feedback</button>
                            </div>
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
            error: null,
            clientId: localStorage.getItem('user_id')
        }
    },
    methods: {
        async close(id) {
            localStorage.setItem("service_booking_id", id);
            localStorage.setItem("reload", 0);
            this.$router.push({path: `/service-remarks`});
        },
        async edit(id) {
            localStorage.setItem("service_booking_id", id);
            localStorage.setItem("reload", 0);
            this.$router.push({path: `/update-service-remarks`});
        },
        getServiceName(serviceTypeId) {
            const serviceType = this.serviceTypes.find(s => s.id === serviceTypeId);
            return serviceType ? serviceType.service_name : 'Unknown Service';
        }
    },
    async mounted() {
        try {
            const res = await fetch('/api/client/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                },
                body: JSON.stringify({ client_id: this.clientId })
            });
            
            const data = await res.json();
            
            if(res.ok){
                this.serviceBookings = data.bookings;
                this.serviceTypes = data.service_types;
            } else {
                this.error = data.message;
            }
        } catch (error) {
            console.error('Error fetching service history:', error);
            this.error = 'Failed to load service history';
        }
    }
}
