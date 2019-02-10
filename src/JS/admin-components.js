Vue.component('submission-row',{
	props: ['name','address','logo','description','date'],
    template: `<tr>        
            <td><div v-text="name"></div></td>
            <td><div v-text="address"></div></td>
            <td><div v-text="logo"></div></td>
            <td><div v-text="description"></div></td>
            <td><div v-text="date"></div></td>
		   </tr>`
});

Vue.component("submissions-list",{
    props:['data'],
    template: `
        <ul>
            <table class="table table-striped table-sm">
                <thead><tr>
                    <th>Company Name</th>
                    <th>Address</th>
                    <th>Logo</th>
                    <th>Description</th>
                    <th>Submission Date</th>
                </tr></thead>
                <tr is="submission-row" v-for="(obj, index) in data" :key="index" v-bind:name="data[index].cmpName" v-bind:address="data[index].cmpAddress" v-bind:logo="data[index].cmpLogo" v-bind:description="data[index].cmpDescription" v-bind:date="data[index].date"></tr>
            </table>
        </ul>`
});