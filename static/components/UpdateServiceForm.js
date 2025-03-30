export default {
    template: `
    <div>
        <div class="d-flex justify-content-center">
            <div class="mb-3 p-5 bg-light" style="width: 55rem;">    
                <h2 class="text-center text-primary p-1">Update Service</h2>
                <form @submit.prevent="updateService">
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
                        <button type="submit" class="btn btn-primary mt-2">Update Service</button>
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
                service_name: localStorage.getItem('service_name'),
                base_cost: localStorage.getItem('service_price'),
                estimated_duration: localStorage.getItem('service_time'),
                service_details: localStorage.getItem('service_description')
            },
            token: localStorage.getItem('auth-token'),
        }
    },
    methods: {
        async updateService(){
            try {
                const res = await fetch(`/api/update/service/${localStorage.getItem('update_service_id')}`, {
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
                    alert(data.message || 'Failed to update service');
                }
            } catch (error) {
                console.error('Error updating service:', error);
                alert('An error occurred while updating the service');
            }
        },
        reset() {
            this.$router.push({path: '/'});
        }
    },
    async mounted() {
        try {
            const res = await fetch(`/api/update/service/${localStorage.getItem('update_service_id')}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            const data = await res.json();
            
            if(res.ok){
                this.service.service_name = data.service_name;
                this.service.base_cost = data.base_cost;
                this.service.estimated_duration = data.estimated_duration;
                this.service.service_details = data.service_details;
                
                localStorage.setItem('service_name', data.service_name);
                localStorage.setItem('service_price', data.base_cost);
                localStorage.setItem('service_time', data.estimated_duration);
                localStorage.setItem('service_description', data.service_details);
                
                if(localStorage.getItem('reload') == '0'){
                    localStorage.setItem('reload', '1');
                    location.reload();
                }
            } else {
                alert(data.message || 'Failed to fetch service details');
            }
        } catch (error) {
            console.error('Error fetching service details:', error);
            alert('An error occurred while fetching service details');
        }
    }
}
