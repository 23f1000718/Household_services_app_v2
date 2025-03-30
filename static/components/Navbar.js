export default{
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
            <a class="navbar-brand text-white text-center" href="#">
                <img src="/static/images/home-service.png" alt="Logo" width="30" height="25" class="d-inline-block align-text-top">
                HomeHaven2.0
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <router-link class="nav-link active" v-if="is_login" aria-current="page" to="/">Home</router-link>
                    </li>
                    <li class="nav-item" v-if="role=='admin'">
                        <router-link class="nav-link" to="/users">Users</router-link>
                    </li>
                    <li class="nav-item" v-if="role=='admin'">
                        <router-link class="nav-link" to="/all-service-request">Service Requests</router-link>
                    </li>
                    <li class="nav-item" v-if="role=='client'">
                        <router-link class="nav-link" to="/service-history">Service History</router-link>
                    </li>
                    <li class="nav-item text-end" v-if="active=='false'">
                        <button class="nav-link btn btn-outline-light btn-sm" @click="logout">Back To Login</button>
                    </li>
                    <li class="nav-item text-end" v-if="is_login && active=='true'">
                        <button class="nav-link btn btn-outline-light btn-sm" @click="logout">Logout</button>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    `,
    data() {
        return {
            role: localStorage.getItem('role'),
            is_login: localStorage.getItem('auth-token'),
            active: localStorage.getItem('active')
        }
    },
    methods: {
        logout() {
            localStorage.clear()
            this.$router.push('/login')
        }
    }
}
