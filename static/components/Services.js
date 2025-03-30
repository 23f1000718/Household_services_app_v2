export default {
    template: `
    <div>
        <div class="p-2" v-if="role == 'client'">
            <div class="card text-center bg-light" style="width: 15rem;">
                <div class="card-body">
                    <h5 class="card-title text-primary">{{service.service_name}}</h5>
                    <h6 class="card-text">{{service.service_details}}</h6>
                    <h6 class="card-text">{{service.estimated_duration}}</h6>
                    <h6 class="card-text">Rs. {{service.base_cost}}</h6>
                    <button class="btn btn-primary" @click="request(service.id)">Request</button>
                </div>
            </div>
        </div>
        <div class="p-2" v-if="role == 'admin'">
            <div class="card text-center" style="width: 76rem;">
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                        <div class="container text-center">
                            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4">
                                <div class="col">{{service.id}}</div>
                                <div class="col">{{service.service_name}}</div>
                                <div class="col">{{service.base_cost}}</div>
                                <div class="col">
                                    <button class="btn btn-warning" @click="update(service.id)">Edit</button>
                                    <button class="btn btn-danger" @click="del(service.id)">Delete</button>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    `,
    props: ['service'],
    data() {
        return {
            token: localStorage.getItem('auth-token'),
            role: localStorage.getItem('role'),
            service_booking: {
                "service_type_id": null,
                "client_id": null,
            }
        }
    },
    methods: {
        async request(id) {
            this.service_booking.service_type_id = id;
            this.service_booking.client_id = localStorage.getItem('user_id');
            try {
                const res = await fetch('/api/request/service', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify(this.service_booking)
                });
                const data = await res.json();
                if(res.ok){
                    alert('Service Requested');
                } else {
                    alert(data.message || 'Failed to request service');
                }
            } catch (error) {
                console.error('Error requesting service:', error);
                alert('An error occurred while requesting the service');
            }
        },
        async del(id) {
            try {
                const res = await fetch(`/delete/service/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                const data = await res.json();
                if(res.ok){
                    alert(data.message);
                    location.reload();
                } else {
                    alert(data.message || 'Failed to delete service');
                }
            } catch (error) {
                console.error('Error deleting service:', error);
                alert('An error occurred while deleting the service');
            }
        },
        async update(id) {
            localStorage.setItem('update_service_id', id);
            this.$router.push({path: `/update-service`});
        }
    },
    async mounted() {
        if (localStorage.getItem('update_service_id')) {
            try {
                const res = await fetch(`/api/update/service/${localStorage.getItem('update_service_id')}`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                const data = await res.json();
                if(res.ok){
                    localStorage.setItem('service_name', data.service_name);
                    localStorage.setItem('service_price', data.base_cost);
                    localStorage.setItem('service_time', data.estimated_duration);
                    localStorage.setItem('service_description', data.service_details);
                    localStorage.setItem('reload', '0');
                } else {
                    alert(data.message || 'Failed to fetch service details');
                }
            } catch (error) {
                console.error('Error fetching service details:', error);
                alert('An error occurred while fetching service details');
            }
        }
    }
}
