export default {
    template: `
    <div>
        <h2 class="text-center">Service Providers</h2>
        <div class="card text-center" style="width: 77rem;">
            <div class="card-header">
                <div class="container text-center">
                    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-5">
                        <div class="col">ID</div>
                        <div class="col">Name</div>
                        <div class="col">Experience (Years)</div>
                        <div class="col">Specialty</div>
                        <div class="col">Action</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card text-center" style="width: 77rem;">
            <ul class="list-group list-group-flush">
                <li class="list-group-item" v-for="provider in serviceProviders" :key="provider.id">
                    <div class="container text-center">
                        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-5">
                            <div class="col">{{provider.id}}</div>
                            <div class="col">{{provider.name}}</div>
                            <div class="col">{{provider.years_experience}}</div>
                            <div class="col">{{provider.specialty}}</div>
                            <div class="col">
                                <button class="btn btn-warning" v-if="!provider.is_verified" @click="approve(provider.id)">Approve</button>
                                <button class="btn btn-danger" v-if="!provider.is_verified" @click="del_pro(provider.id)">Reject</button>
                                <button class="btn btn-danger" v-if="provider.is_verified" @click="del_pro(provider.id)">Delete</button>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
    <div>
        <h2 class="text-center p-2">Clients</h2>
        <div class="card text-center" style="width: 77rem;">
            <div class="card-header">
                <div class="container text-center">
                    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-5">
                        <div class="col">ID</div>
                        <div class="col">Name</div>
                        <div class="col">Address</div>
                        <div class="col">Postal Code</div>
                        <div class="col">Action</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card text-center" style="width: 77rem;">
            <ul class="list-group list-group-flush">
                <li class="list-group-item" v-for="client in clients" :key="client.id">
                    <div class="container text-center">
                        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-5">
                            <div class="col">{{client.id}}</div>
                            <div class="col">{{client.name}}</div>
                            <div class="col">{{client.home_address}}</div>
                            <div class="col">{{client.postal_code}}</div>
                            <div class="col">
                                <button class="btn btn-danger" @click="del_client(client.id)">Delete</button>
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
            serviceProviders: [],
            clients: [],
            token: localStorage.getItem('auth-token'),
            error: null
        }
    },
    methods: {
        async approve(pro_id) {
            try {
                const res = await fetch(`/activate/provider/${pro_id}`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                const data = await res.json();
                if(res.ok){
                    alert(data.message);
                    location.reload();
                } else {
                    alert(data.message || 'Failed to approve provider');
                }
            } catch (error) {
                console.error('Error approving provider:', error);
                alert('An error occurred while approving the provider');
            }
        },
        async del_pro(pro_id) {
            try {
                const res = await fetch(`/delete/provider/${pro_id}`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                const data = await res.json();
                if(res.ok){
                    alert(data.message);
                    location.reload();
                } else {
                    alert(data.message || 'Failed to delete provider');
                }
            } catch (error) {
                console.error('Error deleting provider:', error);
                alert('An error occurred while deleting the provider');
            }
        },
        async del_client(client_id) {
            try {
                const res = await fetch(`/delete/client/${client_id}`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                const data = await res.json();
                if(res.ok){
                    alert(data.message);
                    location.reload();
                } else {
                    alert(data.message || 'Failed to delete client');
                }
            } catch (error) {
                console.error('Error deleting client:', error);
                alert('An error occurred while deleting the client');
            }
        }
    },
    async mounted() {
        try {
            const res1 = await fetch('/api/providers', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            const data1 = await res1.json();
            if(res1.ok){
                this.serviceProviders = data1;
            } else {
                this.error = res1.status;
            }
            
            const res2 = await fetch('/api/clients', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            const data2 = await res2.json();
            if(res2.ok){
                this.clients = data2;
            } else {
                this.error = res2.status;
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            this.error = 'Failed to load users';
        }
    }
}
