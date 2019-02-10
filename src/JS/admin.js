const app = new Vue({
	el: '#app',
	data: {
		title:"GD - Sketch Admin Portal",
		submissions: [],
        searchTerm: ""
	},
	created(){
		this.initialize();
	},
	methods:{
		initialize(){
			// Initialize Firebase
			var config = {
				apiKey: "",
				authDomain: "gamedevsketch.firebaseapp.com",
				databaseURL: "https://gamedevsketch.firebaseio.com",
				projectId: "gamedevsketch",
				storageBucket: "",
				messagingSenderId: ""
			};
			firebase.initializeApp(config);

			// Set listener for data
			firebase.database().ref("SubmittedCompanies").on("value", this.dataChanged, this.firebaseError);
		},
		dataChanged(data){ // Reloads company data if it is updated in the database
			let obj = data.val();

			this.submissions = [];
			
			for (let key of Object.keys(obj)){
				let row = obj[key];
				
				this.submissions.push(row); // save to submissions[]
			}			
		},
		firebaseError(error){
			console.log(error);
		}
	} // end methods
});