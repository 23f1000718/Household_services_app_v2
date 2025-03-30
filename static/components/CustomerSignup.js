export default {
    template: `
    <div class="d-flex justify-content-center" style="margin-top: 25vh">
        <div class="mb-3 p-5 bg-light" style="width: 35rem;">    
            <h2 class="text-center p-1">Customer Signup</h2>
            <div class="text-danger">{{error}}</div>
            <form @submit.prevent="register">
                <div class="row mb-3">
                    <label for="user-email" class="col-sm-2 col-form-label">Email:</label>
                    <div class="col-sm-10">
                        <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="cred.email" required>
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="user-password" class="col-sm-2 col-form-label">Password:</label>
                    <div class="col-sm-10">
                        <input type="password" class="form-control" id="user-password" v-model="cred.password" required>
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="user-fullname" class="col-sm-2 col-form-label">Fullname:</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="user-fullname" v-model="cred.full_name" required>
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="user-address" class="col-sm-2 col-form-label">Address:</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="user-address" v-model="cred.address" required>
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="user-pincode" class="col-sm-2 col-form-label">Pincode:</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="user-pincode" v-model="cred.pincode" required>
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="user-phone" class="col-sm-2 col-form-label">Phone:</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="user-phone" v-model="cred.phone_number">
                    </div>
                </div>
                <div class="text-center">
                    <button type="submit" class="btn btn-primary mt-2">Register</button>
                </div>
            </form>
            <router-link class="nav-link text-center text-warning p-1" to="/login">Login Here</router-link>
        </div>
    </div>
    `,
    data() {
        return {
            cred: {
                email: null,
                password: null,
                full_name: null,
                address: null,
                pincode: null,
                phone_number: null
            },
            error: null
        }
    },
    methods: {
        async register() {
            try {
                const res = await fetch('/api/customers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.cred)
                });
                
                const data = await res.json();
                
                if(res.ok){
                    alert(data.message);
                    this.$router.push({path: '/login'});
                } else {
                    this.error = data.message;
                }
            } catch (err) {
                this.error = "Registration failed. Please try again.";
                console.error(err);
            }
        }
    }
}