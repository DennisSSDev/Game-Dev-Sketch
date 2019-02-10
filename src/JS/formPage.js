// Page to add information about you company
// We accept things like company name, icons, descriptions
"use strict"; // TODO: No longer needed in ECMA6
import { Search } from "./search.js";

const app = new Vue({
  el: "#app",
  data: {
    title: "GD - Sketch",
    cmpName: "Sony Interactive Entertainment", //use these to prefill the forms as an example
    cmpAddress: "2207 Bridgepointe Pkwy. San Mateo, CA 94404",
    cmpLogo: "Enter a link to a logo image here",
    cmpDescription:
      "Recognized as a global leader in interactive and digital entertainment, Sony Interactive Entertainment (SIE) is responsible for the PlayStation brand and family of products. PlayStation has delivered innovative products to market since the launch of the first PlayStation in Japan in 1994. The PlayStation family of products and services includes PlayStation 4, PlayStation VR, PlayStation Store, PlayStation Now and PlayStation Vue.",
    searchTerm: "",
    formWarning: "",
    formError0: false,
    formError1: false,
    formError2: false,
    formError3: false,
    searchObj: null // Reference to search class
  },
  created() {
    this.searchObj = new Search();
    this.initialize();
  },
  methods: {
    initialize() {
      // Initialize Firebase
      let config = {
        apiKey: "",
        authDomain: "gamedevsketch.firebaseapp.com",
        databaseURL: "https://gamedevsketch.firebaseio.com",
        projectId: "gamedevsketch",
        storageBucket: "",
        messagingSenderId: ""
      };
      firebase.initializeApp(config);

      // Set the text in the search bar to the last searched item
      this.searchTerm = window.localStorage.getItem("searchTerm");
    },
    submit() {
      this.formWarning = "";
      let date = new Date();
      let ref = firebase.database().ref("SubmittedCompanies");
      let toPush = true;

      // Check the form for unchanged/empty fields
      // Name
      if (
        this.cmpName == "Sony Interactive Entertainment" ||
        this.cmpName == ""
      ) {
        this.formError0 = true;
        this.formWarning =
          "Please provide information for all fields if you would like to submit information on a company.";
        toPush = false;
      } else {
        this.formError0 = false;
      }
      // Address
      if (
        this.cmpAddress == "2207 Bridgepointe Pkwy. San Mateo, CA 94404" ||
        this.cmpAddress == ""
      ) {
        this.formError1 = true;
        this.formWarning =
          "Please provide information for all fields if you would like to submit information on a company.";
        toPush = false;
      } else {
        this.formError1 = false;
      }
      // Logo
      if (
        this.cmpLogo == "Enter a link to a logo image here" ||
        this.cmpLogo == ""
      ) {
        this.formError2 = true;
        this.formWarning =
          "Please provide information for all fields if you would like to submit information on a company.";
        toPush = false;
      } else {
        this.formError2 = false;
      }
      // Description
      if (
        this.cmpDescription ==
          "Recognized as a global leader in interactive and digital entertainment, Sony Interactive Entertainment (SIE) is responsible for the PlayStation brand and family of products. PlayStation has delivered innovative products to market since the launch of the first PlayStation in Japan in 1994. The PlayStation family of products and services includes PlayStation 4, PlayStation VR, PlayStation Store, PlayStation Now and PlayStation Vue." ||
        this.cmpDescription == ""
      ) {
        this.formError3 = true;
        this.formWarning =
          "Please provide information for all fields if you would like to submit information on a company.";
        toPush = false;
      } else {
        this.formError3 = false;
      }

      // Create a new company object
      let newCmp = {
        cmpName: this.cmpName,
        cmpAddress: this.cmpAddress,
        cmpLogo: this.cmpLogo,
        cmpDescription: this.cmpDescription,
        date: `${date.getMonth() +
          1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
      };

      // Loop through the database and check for duplicate companies
      ref.on(
        "value",
        function(snapshot) {
          let dataRef = snapshot.val();

          // Search through the database snapshot to see if the submitted company already exists in the database
          for (let key of Object.keys(dataRef)) {
            let row = dataRef[key];

            // Check if company already exists by name, if so do not push
            if (row.cmpName == newCmp.cmpName) {
              console.log("Company data already exists - cannot push!");
              //formWarning = "We're sorry, data already exists for this company. Please contact us if you would like to submit a change."
              toPush = false;
            }
          }

          if (toPush == true) {
            // Passed check, push to database
            ref.push(newCmp);
            // Go back to the main page - Doing this minimizes spamming and prevents an erroneous double check aginst the database
            window.location.href = "../HTML/index.html";
          }
        },
        function(errorObject) {
          console.log("Data snapshot retrieval failed: " + errorObject.code);
        }
      );
    }
  } // End methods
});
