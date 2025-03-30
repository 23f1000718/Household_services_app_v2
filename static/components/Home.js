import AdminHome from "./AdminHome.js"
import ProfessionalHome from "./ProfessionalHome.js"
import CustomerHome from "./CustomerHome.js"
import Services from "./Services.js"

export default{
    template: `
    <div v-if="active=='false'">
        <h1 class="text-center text-danger">User Not Approved</h1>
    </div>
    <div v-else>
        <AdminHome v-if="userRole=='admin'"/>
        <ProfessionalHome v-if="userRole=='provider'"/>
        <CustomerHome v-if="userRole=='client'"/>
        <div v-if="userRole=='admin'" class="row">
            <Services v-for="service in services" :service="service" v-bind:key="service.id"/>
        </div>
        <div v-if="userRole=='client'" class="d-flex flex-row flex-wrap">
            <Services v-for="service in services" :service="service" v-bind:key="service.id"/>
        </div>
    </div>
    `,
    data() {
        return {
            userRole: localStorage.getItem('role'),
            active: localStorage.getItem('active'),
            token: localStorage.getItem('auth-token'),
            services: []
        }
    },
    components: {
        AdminHome,
        ProfessionalHome,
        CustomerHome,
        Services
    },
    async mounted() {
        try {
            const res = await fetch('/api/services', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            const data = await res.json();
            
            if(res.ok) {
                this.services = data;
            } else {
                console.error('Error fetching services:', data.message);
            }
        } catch (error) {
            console.error('Failed to fetch services:', error);
        }
    }
}
