import router from "./router.js"
import Navbar from "./components/Navbar.js"
import LandingPage from "./components/LandingPage.js"

router.beforeEach((to, from, next) => {
    if (to.name !== 'Login' && to.name !== 'Landing' && 
        to.name !== 'CustomerSignup' && to.name !== 'ServiceProfessionalSignup' && 
        !localStorage.getItem('auth-token')) {
        next({name: 'Login'})
    } else {
        next()
    }
})

new Vue({
    el: '#app',
    template: `
    <div>
        <Navbar v-if="showNavbar" :key='has_changed'/>
        <router-view class="m-3"/>
    </div>
    `,
    router,
    components: {
        Navbar,
        LandingPage
    },
    data: {
        has_changed: true
    },
    computed: {
        showNavbar() {
            return this.$route.name !== 'Landing';
        }
    },
    watch: {
        $route(to, from) {
            this.has_changed = !this.has_changed
        }
    }
})
