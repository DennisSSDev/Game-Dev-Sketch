// Main page to browse through all of the opprotunities in our Database
import { Search } from "./search.js";

const app = new Vue({
  el: "#app",
  data: {
    companies: [], // all the companies coming from FireBase
    companiesToDisplay: [], // companies that will only display (10 per page)
    pageNumber: 1, // page to render
    sortSelection: "1", // sorting method to use
    selectedCompany: "", //company to pass along to the company page
    searchTerm: "",
    resultMessage: "",
    searchObj: null // Reference to search class
  },
  created() {
    this.searchObj = new Search();
    this.initialize();
  },
  methods: {
    sort() {
      switch (this.sortSelection) {
        case "1":
          firebase //display in order that the companies came in
            .database()
            .ref("SubmittedCompanies")
            .on("value", this.firebaseDataInit, this.firebaseError);
          break;
        case "2":
          this.sortAlphabetical(this.companies); //sort based on the first letter of the company title
          break;
        case "3":
          this.sortByDate(this.companies); //sort based on the date that the company has been updated
          break;
        default:
          console.log("No valid selection");
          break;
      }
    },
    sortAlphabetical(arr = []) {
      // sort alphabetically
      if (arr === []) return;
      arr.sort((a, b) => {
        if (a.cmpName < b.cmpName) return -1;
        if (a.cmpName > b.cmpName) return 1;
        return 0;
      });
      this.updateAfterSort(arr);
    },
    sortByDate(arr = []) {
      // sort based on creation date
      if (arr === []) return;
      let date1;
      let date2;
      arr.sort((a, b) => {
        date1 = this.createDateObjectFormatted(a.date);
        date2 = this.createDateObjectFormatted(b.date);
        if (date1 < date2) return 1;
        if (date1 > date2) return -1;
        return 0;
      });
      this.updateAfterSort(arr);
    },
    updateAfterSort(arr = []) {
      // function used to update the UI after the sorting happened
      this.pageNumber = 1;
      this.companiesToDisplay = [];
      for (let i = 0; i < 10; i++) {
        //Display only the first ten results
        if (arr[i] === undefined) break;
        this.companiesToDisplay.push(arr[i]);
      }
    },
    lastPage() {
      // function to use when the user wants to see previous results
      if (this.pageNumber - 1 >= 1) {
        this.pageNumber--;
        this.updatePage();
      }
    },
    nextPage() {
      // function to use when the user wants to see the next results
      if (this.companies.length > this.pageNumber * 10) {
        this.pageNumber++;
        this.updatePage();
      }
    },
    updatePage() {
      //helper function to correctly display the 10 company results once the user clicks on the next / previous page
      this.companiesToDisplay = [];
      let first_index = this.pageNumber > 1 ? 10 : 0;
      for (
        let i = first_index * (this.pageNumber - 1);
        i < first_index * (this.pageNumber - 1) + 10;
        i++
      ) {
        if (this.companies[i] === undefined) break;
        this.companiesToDisplay.push(this.companies[i]);
      }
    },
    createDateObjectFormatted(date) {
      //formatting that is used in order to compare dates
      date = date.split("/");
      date = date.concat(date[2].split(" "));
      date.splice(2, 1);
      date = date.concat(date[3].split(":"));
      date.splice(3, 1);
      return new Date(date[2], date[0], date[1], date[3], date[4], date[5]);
      //0 -> month | 1 -> day | 2 -> year | 3 -> hour | 4 -> minutes | 5 -> seconds
    },
    saveCompanyData(e) {
      //function used to store the company's data that will be passed along to the company page
      let res; //in case the user clicks on the image / card / title
      if (!e.target.children[0]) {
        if (!e.target.innerHTML) {
          res = e.srcElement.parentElement.children[0].innerHTML;
        } else res = e.target.innerHTML;
      } else res = e.target.children[0].innerHTML;
      this.selectedCompany = res.trim();
      window.localStorage.setItem("selectedCompany", this.selectedCompany); //store company page locally
      for (let companyMem of this.companiesToDisplay) {
        if (this.selectedCompany == companyMem.cmpName) {
          window.localStorage.setItem("company", JSON.stringify(companyMem)); //stringify JSON to pass along to company page
          break;
        }
      }
      window.location.href = "../HTML/companyPage.html";
    },
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

      // Load default data
      if (window.localStorage.getItem("searchInitiated") == "false") {
        firebase
          .database()
          .ref("SubmittedCompanies")
          .on("value", this.firebaseDataInit, this.firebaseError);
      } else if (window.localStorage.getItem("searchInitiated") == "true") {
        // Retrieve specific data if a search was initiated
        // Set the search term locally
        this.searchTerm = window.localStorage.getItem("searchTerm");

        // Get data that includes the search term
        firebase
          .database()
          .ref("SubmittedCompanies")
          .on("value", this.firebaseSearchInit, this.firebaseError);
      }
      // Set the text in the search bar to the last searched item
      this.searchTerm = window.localStorage.getItem("searchTerm");
    },
    firebaseDataInit(data) {
      let obj = data.val();
      let formattedAddress = "";
      this.companies = [];
      this.companiesToDisplay = [];
      // Reformat data
      for (let objMem in obj) {
        formattedAddress = obj[objMem].cmpAddress.replace(/\s/g, "+");
        obj[objMem].cmpAddress = formattedAddress;
        this.companies.push(obj[objMem]);
      }
      this.companiesToDisplay = [];
      for (let i = 0; i < 10; i++) {
        //Display only the first ten results
        if (this.companies[i] === undefined) break;
        this.companiesToDisplay.push(this.companies[i]);
      }
    },
    firebaseSearchInit(data) {
      /*==================================================
      IMPORTANT: DO NOT REMOVE console.log()s IN THIS 
      METHOD!!! THEY ARE CRITICAL TO DEBUGGING!!!
      ==================================================*/
      let obj = data.val();
      let formattedAddress = "";
      this.companies = [];
      this.cmpNames = []; // Use this to record which companies have been retrieved already b/c variable scope and objects are dumb
      // retrieve the search term
      let term = window.localStorage.getItem("searchTerm");

      // Check for companies based on Name
      for (let objMem in obj) {
        // Only display data if it includes the search term in its name
        if (obj[objMem].cmpName.includes(term) == true) {
          // Fix address formatting
          formattedAddress = obj[objMem].cmpAddress.replace(/\s/g, "+");
          obj[objMem].cmpAddress = formattedAddress;

          //console.log("Pushing by name: " + obj[objMem].cmpName);
          this.companies.push(obj[objMem]);
          this.cmpNames.push(obj[objMem].cmpName);
        }
      }

      //console.log("Before address check, cmpName = " + this.cmpNames);

      // Check for companies based on Address
      for (let objMem in obj) {
        // Only display data if it includes the search term in its address
        if (obj[objMem].cmpAddress.includes(term) == true) {
          // Fix address formatting
          formattedAddress = obj[objMem].cmpAddress.replace(/\s/g, "+");
          obj[objMem].cmpAddress = formattedAddress;

          // Check if the company has already been saved, if not, add it
          for (let i = 0; i < this.cmpNames.length + 1; ++i) {
            if (
              this.cmpNames[i] == obj[objMem].cmpName &&
              this.cmpNames.length > 0
            ) {
              break;
            } else {
              //console.log("Pushing by address: " + obj[objMem].cmpName);
              this.companies.push(obj[objMem]);
              this.cmpNames.push(obj[objMem].cmpName);
              break;
            }
          }
        }
      }

      //console.log("Before description check, cmpName = " + this.cmpNames);

      // Check for companies based on Description
      for (let objMem in obj) {
        // Only display data if it includes the search term in its description
        //console.log("In desc loop\n" +obj[objMem].cmpName + ": " + obj[objMem].cmpDescription);
        if (obj[objMem].cmpDescription.includes(term) == true) {
          // Fix address formatting
          formattedAddress = obj[objMem].cmpAddress.replace(/\s/g, "+");
          obj[objMem].cmpAddress = formattedAddress;

          // Check if the company has already been saved, if not, add it
          for (let i = 0; i < this.cmpNames.length + 1; ++i) {
            // console.log(this.cmpNames[i]);
            // console.log(obj[objMem].cmpName);
            // console.log(this.cmpNames.length);
            // console.log("check = " + (this.cmpNames[i] == obj[objMem].cmpName && this.cmpNames.length > 1));
            if (
              this.cmpNames[i] == obj[objMem].cmpName &&
              this.cmpNames.length > 0
            ) {
              break;
            } else {
              //console.log("Pushing by description: " + obj[objMem].cmpName);
              this.companies.push(obj[objMem]);
              this.cmpNames.push(obj[objMem].cmpName);
              break;
            }
          }
        }
      }

      // If no results were found, display a message
      if (this.cmpNames.length == 0) {
        this.resultMessage = `Sorry, but we couldn't find anything. We display results based on the company names, addresses, and descriptions we have on record.
          Try refining your search term by changing capitalization or omitting punctuation or words.`;
      } else {
        this.resultMessage = "";
      }
      for (let i = 0; i < 10; i++) {
        if (this.companies[i] === undefined) break;
        this.companiesToDisplay.push(this.companies[i]);
      }
      // Reset the searchInitiated flag back to false
      window.localStorage.setItem("searchInitiated", "false");
    }
  } // End methods
});
