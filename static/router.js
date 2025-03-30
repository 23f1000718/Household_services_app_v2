import Home from "./components/Home.js"
import Login from "./components/Login.js"
import Users from "./components/Users.js"
import ServiceForm from "./components/ServiceForm.js"
import UpdateServiceForm from "./components/UpdateServiceForm.js"
import CustomerSignup from "./components/CustomerSignup.js"
import ServiceProfessionalSignup from "./components/ServiceProfessionalSignup.js"
import ServiceHistory from "./components/ServiceHistory.js"
import ServiceRemarks from "./components/ServiceRemarks.js"
import UpdateServiceRemarks from "./components/UpdateServiceRemarks.js"
import AllServiceRequest from "./components/AllServiceRequest.js"
import LandingPage from "./components/LandingPage.js"

const routes = [
    {path: '/', component: LandingPage, name: 'Landing'},
    {path: '/home', component: Home, name: 'Home'},
    {path: '/login', component: Login, name: 'Login'},
    {path: '/users', component: Users, name: 'Users'},
    {path: '/create-service', component: ServiceForm, name: 'CreateService'},
    {path: '/update-service/:id', component: UpdateServiceForm, name: 'UpdateService'},
    {path: '/customer-signup', component: CustomerSignup, name: 'CustomerSignup'},
    {path: '/service-professional-signup', component: ServiceProfessionalSignup, name: 'ServiceProfessionalSignup'},
    {path: '/service-history', component: ServiceHistory, name: 'ServiceHistory'},
    {path: '/service-remarks/:id', component: ServiceRemarks, name: 'ServiceRemarks'},
    {path: '/update-service-remarks/:id', component: UpdateServiceRemarks, name: 'UpdateServiceRemarks'},
    {path: '/all-service-request', component: AllServiceRequest, name: 'AllServiceRequest'}
]

export default new VueRouter({
    routes
})
