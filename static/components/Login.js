export default{
    template: `
    <div class="d-flex justify-content-center" style="margin-top: 25vh">
        <div class="mb-3 p-5 bg-light" style="width: 35rem;">
            <div>    
                <router-link class="nav-link text-end text-success p-1" to="/service-professional-signup">Register as Professional</router-link> 
            </div>    
            <h2 class="text-center p-1">Login</h2>
            <div class="text-danger">{{error}}</div>
            <form @submit.prevent="login">
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
                <div class="text-center">
                    <button type="submit" class="btn btn-primary mt-2">Login</button>
                </div>
            </form>
            <router-link class="nav-link text-center text-warning p-1" to="/customer-signup">Create Account</router-link>
        </div>
    </div>
    `,
    data() {
        return {
            cred: {
                email: null,
                password: null
            },
            error: null
        }
    },
    methods: {
        async login() {
            try {
                const res = await fetch('/user-login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.cred)
                });
                
                const data = await res.json();
                
                if(res.ok){
                    localStorage.setItem('auth-token', data.token);
                    localStorage.setItem('role', data.role);
                    localStorage.setItem('active', data.active);
                    localStorage.setItem('user_id', data.id);
                    
                    // Redirect based on user role
                    if (data.role === 'admin') {
                        this.$router.push({path: '/users'});
                    } else if (data.role === 'provider') {
                        this.$router.push({path: '/home'});
                    } else if (data.role === 'client') {
                        this.$router.push({path: '/service-history'});
                    } else {
                        this.$router.push({path: '/home'});
                    }
                } else {
                    this.error = data.message;
                }
            } catch (err) {
                this.error = "Login failed. Please try again.";
                console.error(err);
            }
        }
    }
}
