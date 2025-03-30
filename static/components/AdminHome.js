export default{
    template: `
    <div>
        <h1 class="text-danger text-center">Welcome Admin</h1>
        <h2 class="text-center">Services</h2>
        <div class="d-flex justify-content-center p-1">
            <button type="button" class="btn btn-outline-success"><router-link class="nav-link p-1" to="/create-service">+ New Service</router-link></button>
        </div>
        <div class="card text-center" style="width: 77rem;">
            <div class="card-header">
                <div class="container text-center">
                    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4">
                        <div class="col">ID</div>
                        <div class="col">Service Name</div>
                        <div class="col">Base Price (Rs.)</div>
                        <div class="col">Action</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            isWaiting: false
        }
    },
    methods: {
        async download_csv() {
            this.isWaiting = true
            const res = await fetch('/download-csv')
            const data = await res.json()
            if (res.ok) {
                const taskId = data['task-id']
                const intv = setInterval(async () => {
                    const csv_res = await fetch(`/get-csv/${taskId}`)
                    if(csv_res.ok){
                        this.isWaiting = false
                        clearInterval(intv)
                        window.location.href = `/get-csv/${taskId}`
                    }
                }, 1000)
            }
        }

    }
}