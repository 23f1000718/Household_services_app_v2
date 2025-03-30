export default {
    template: `
    <div>
        <div class="container">
            <div class="row">
                <div class="col">
                </div>
                <div class="col">
                    <h2 class="text-center">Service Requests</h2>
                </div>
                <div class="col p-2 text-end">
                    <h6 class="text-primary">Download Details</h6>
                    <button class="btn btn-primary" @click='download_csv'>Export as CSV</button>
                    <span v-if='isWaiting'> Waiting... </span>
                </div>
            </div>
        </div>
        <div class="card text-center" style="width: 77rem;">
            <div class="card-header">
                <div class="container text-center">
                    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4">
                        <div class="col">ID</div>
                        <div class="col">Service Name</div>
                        <div class="col">Booking Date</div>
                        <div class="col">Status</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card text-center" style="width: 77rem;">
            <ul class="list-group list-group-flush">
                <li class="list-group-item" v-for="booking in serviceBookings" :key="booking.id">
                    <div class="container text-center">
                        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4">
                            <div class="col">{{booking.id}}</div>
                            <div class="col">{{getServiceName(booking.service_type_id)}}</div>
                            <div class="col">{{booking.booking_date}}</div>
                            <div class="col">{{booking.booking_status}}</div>
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
            isWaiting: false
        }
    },
    methods: {
        async download_csv() {
            this.isWaiting = true;
            try {
                const res = await fetch('/download-csv', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    const taskId = data['task-id'];
                    const intv = setInterval(async () => {
                        const csv_res = await fetch(`/get-csv/${taskId}`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                            }
                        });
                        if (csv_res.ok) {
                            clearInterval(intv);
                            this.isWaiting = false;
                            window.location.href = `/get-csv/${taskId}`;
                        }
                    }, 1000);
                } else {
                    throw new Error(data.message || 'Failed to initiate CSV download');
                }
            } catch (error) {
                console.error('Error downloading CSV:', error);
                this.error = error.message;
                this.isWaiting = false;
            }
        },
        getServiceName(serviceTypeId) {
            const serviceType = this.serviceTypes.find(s => s.id === serviceTypeId);
            return serviceType ? serviceType.service_name : 'Unknown Service';
        }
    },
    async mounted() {
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
                throw new Error(data.message || 'Failed to fetch service requests');
            }
        } catch (error) {
            console.error('Error fetching service requests:', error);
            this.error = error.message;
        }
    }
}
