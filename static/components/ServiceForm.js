export default {
    template: `
    <div>
        <div class="d-flex justify-content-center">
            <div class="mb-3 p-5 bg-light" style="width: 55rem;">    
                <h2 class="text-center text-primary p-1">New Service</h2>
                <form @submit.prevent="createService">
                    <div class="row mb-3">
                        <label for="service-name" class="col-sm-2 col-form-label">Name:</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="service-name" v-model="service.service_name" required>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <label for="service-price" class="col-sm-2 col-form-label">Price (in Rs.):</label>
                        <div class="col-sm-10">
                            <input type="number" class="form-control" id="service-price" v-model="service.base_cost" required>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <label for="service-time" class="col-sm-2 col-form-label">Time Required:</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="service-time" v-model="service.estimated_duration" required>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <label for="service-description" class="col-sm-2 col-form-label">Description:</label>
                        <div class="col-sm-10">
                            <textarea class="form-control" id="service-description" v-model="service.service_details" rows="3" required></textarea>
                        </div>
                    </div>
                    <div class="text-center">
                        <button type="submit" class="btn btn-primary mt-2">Add Service</button>
                        <button type="button" class="btn btn-danger mt-2" @click="reset">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            service: {
                service_name: null,
                base_cost: null,
                estimated_duration: null,
                service_details: null
            },
            token: localStorage.getItem('auth-token')
        }
    },
    methods: {
        async createService(){
            try {
                const res = await fetch('/api/services', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.service)
                });
                
                const data = await res.json();
                
                if(res.ok){
                    alert(data.message);
                    this.$router.push({path: '/'});
                } else {
                    alert(data.message || 'Failed to create service');
                }
            } catch (error) {
                console.error('Error creating service:', error);
                alert('An error occurred while creating the service');
            }
        },
        reset() {
            this.$router.push({path: '/'});
        }
    }
}
