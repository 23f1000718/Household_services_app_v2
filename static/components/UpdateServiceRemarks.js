export default{
    template: `
    <div>
        <h2 class="text-center text-primary">Update Service Feedback</h2>
        <h3 class="text-center text-info">Booking ID: {{service_details.id}}</h3>
        <div class="container text-center">
            <div class="row p-1">
                <div class="col">
                    <div class="card text-bg-info mb-3" style="max-width: 18rem;">
                        <h5 class="card-header">Service Name</h5>
                        <div class="card-body">
                            <h5 class="card-title">{{service_details.name}}</h5>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card text-bg-info mb-3" style="max-width: 18rem;">
                        <h5 class="card-header">Details</h5>
                        <div class="card-body">
                            <h5 class="card-title">{{service_details.details}}</h5>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card text-bg-info mb-3" style="max-width: 18rem;">
                        <h5 class="card-header">Provider</h5>
                        <div class="card-body">
                            <h5 class="card-title">{{service_details.provider}}</h5>
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-center">
                <h5>Rating (1-5):</h5>
                <input type="range" class="form-range p-2" min="1" max="5" id="customRange2" style="width:10%" v-model="service_booking.satisfaction_score">
            </div>
            <div class="d-flex justify-content-center">
                <h5 class="p-3">Feedback (if any):</h5>
                <input type="text" class="form-control" id="feedback" style="width:20%" v-model="service_booking.client_feedback" placeholder="{{service_booking.client_feedback}}">
            </div>
            <div class="p-5">
                <button class="btn btn-success" @click="submit">Submit</button>
                <button class="btn btn-danger" @click="close">Close</button>
            </div>      
        </div>
    </div>
    `,
    data() {
        return {
            service_details: {
                id: localStorage.getItem('service_booking_id'),
                name: localStorage.getItem('name'),
                details: localStorage.getItem('details'),
                provider: localStorage.getItem('provider'),
            },
            service_booking: {
                satisfaction_score: localStorage.getItem('satisfaction_score'),
                client_feedback: localStorage.getItem('client_feedback')
            },
            token: localStorage.getItem('auth-token'),
        }
    },
    methods: {
        async submit() {
            try {
                const res = await fetch(`/api/update/service-feedback/${this.service_details.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify(this.service_booking)
                });
                
                const data = await res.json();
                
                if(res.ok){
                    alert("Service Feedback Updated");
                    this.$router.push({path: '/service-history'});
                } else {
                    alert(data.message || 'Failed to update feedback');
                }
            } catch (error) {
                console.error('Error updating feedback:', error);
                alert('An error occurred while updating feedback');
            }
        },
        close(){
            this.$router.push({path: '/service-history'});
        }
    },
    async mounted() {
        try {
            const res = await fetch(`/service-details/${this.service_details.id}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            const data = await res.json();
            
            if(res.ok){
                localStorage.setItem('name', data.name);
                localStorage.setItem('details', data.details);
                localStorage.setItem('provider', data.provider);
                localStorage.setItem('satisfaction_score', data.rating);
                localStorage.setItem('client_feedback', data.feedback);
                
                this.service_booking.satisfaction_score = data.rating;
                this.service_booking.client_feedback = data.feedback;
                
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
