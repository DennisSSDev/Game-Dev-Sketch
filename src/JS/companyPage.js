// In depth view of a specific company
// Provides map location, company pitch and job opportunities
import Mapbox from "mapbox-gl-vue";
import { StylesControl } from "mapbox-gl-controls";
import Map from "../JS/map.js";
import { Search } from "./search.js";

const app = new Vue({
  el: "#app",
  data: {
    jobs: [], //all the jobs for the current page
    pageNumber: 1, // current page for the jobs
    companySelected: {}, //object that will receive data from browse page
    logo: "../No-image.png", //company logo
    loaderDisplaySetting: "block",
    selectCSS: {
      //css for when one of the 3 option is selected
      "background-color": "rgb(38, 175, 38)",
      color: "white",
      "border-radius": "30px",
      padding: "5px 10px"
    },
    deselectCSS: {
      //css to apply for deselected options
      "background-color": "white",
      color: "rgb(11, 22, 71)"
    },
    sel0: {
      //css for option 1
      "background-color": "rgb(38, 175, 38)",
      color: "white",
      "border-radius": "30px",
      padding: "5px 10px"
    },
    sel1: {}, //css for option 2
    sel2: {}, // css for option 3
    activeSelection: {},
    companyDescription: "",
    externalLinks: {},
    mapRef: new Map(), // custom class for managing MapBox functionality
    searchTerm: "",
    searchObj: null // Reference to search class
  },
  components: { Mapbox }, //custom MapBox vue js component
  methods: {
    mapInitialized(map) {
      const styleControls = new StylesControl([
        //imported controls for the mapbox styles
        {
          name: "STR",
          url: "mapbox://styles/mapbox/streets-v9"
        },
        {
          name: "SAT",
          url: "mapbox://styles/mapbox/satellite-streets-v9"
        },
        {
          name: "VIS",
          url: "mapbox://styles/dennisssdev/cjp61rk3q14sl2rp8465m4alq"
        }
      ]);
      this.mapRef.mapInitialized(map, styleControls);
    },
    mapLoaded(map) {
      //callback for what should happen once map loads (map.js)
      this.mapRef.mapLoaded(map);
    },
    displayResults(array) {
      //format the available jobs in order to not have html tags in text
      for (let mem of array) {
        mem.title = mem.title.replace(/<\/?[^>]+(>|$)/g, "");
        this.jobs.push(mem);
      }
    },
    select(e) {
      //callback for once the user click on one of the 3 options
      switch (e.target.innerHTML) {
        case "Company Description":
          if (!this.isSelected(this.sel0)) {
            this.deselectEverything();
            this.sel0 = this.selectCSS;
            //call render function related to sel 0
            this.activeSelection = this.sel0;
          }
          break;
        case "Available Positions":
          if (!this.isSelected(this.sel1)) {
            this.deselectEverything();
            this.sel1 = this.selectCSS;
            //call render function related to sel 1
            this.activeSelection = this.sel1;
          }
          break;
        case "External":
          if (!this.isSelected(this.sel2)) {
            this.deselectEverything();
            this.sel2 = this.selectCSS;
            //call render fnction related to sel 2
            this.activeSelection = this.sel2;
          }
          break;
        default:
          console.warn(
            "You either already selected this item or there is no valid selection"
          );
          break;
      }
    },
    deselectEverything() {
      //once the user clicks on an option, deselect everything so that a new option can be selected
      this.sel0 = this.deselectCSS;
      this.sel1 = this.deselectCSS;
      this.sel2 = this.deselectCSS;
    },
    isSelected(obj) {
      //determine if the current option is already selected
      if (obj === this.selectCSS) return true;
      return false;
    },
    fetchCompanyLogo() {
      //Look on IGDB for the companies logo
      let proxyUrl = "https://cors-anywhere.herokuapp.com/"; // use a public proxy
      let targetUrl = `https://api-endpoint.igdb.com/companies/?search=${
        this.companySelected.cmpName
      }`;
      fetch(proxyUrl + targetUrl, {
        method: "get",
        headers: {
          "user-key": "", // === KEY ===
          Accept: "application/json"
        }
      })
        .then(function(response) {
          return response.json();
        })
        .then(res => {
          let target = `https://api-endpoint.igdb.com/companies/${
            res[0].id
          }?fields=*`;
          fetch(proxyUrl + target, {
            method: "get",
            headers: {
              "user-key": "", // === KEY ===
              Accept: "application/json"
            }
          })
            .then(res => {
              return res.json();
            })
            .then(res => {
              this.loaderDisplaySetting = "none";
              //first ask the IGDB API if it has the company description, if not -> use our available description
              if (res[0].description != undefined)
                this.companyDescription = res[0].description;
              else
                this.companyDescription = this.companySelected.cmpDescription;
              if (res[0].url != undefined)
                this.externalLinks.moreInfo = res[0].url;
              if (res[0].website != undefined)
                this.externalLinks.website = res[0].website;
              if (!res[0].logo) {
                this.logo = this.companySelected.cmpLogo;
                return;
              }
              let logo_link = `https://images.igdb.com/igdb/image/upload/t_logo_med/${
                res[0].logo.cloudinary_id
              }.png`;
              this.logo = logo_link;
            });
        })
        .catch(function(err) {
          console.log(err);
        });
    },
    searchJobs(reset = false) {
      //Use the Adzuna API to search for available jobs in resonse to the company name
      if (reset) this.pageNumber = 1;
      let url = `https://api.adzuna.com/v1/api/jobs/us/search/${
        this.pageNumber
      }?app_id=${this.private.app_id}&app_key=${this.private.app_key}%09&what=${
        this.companySelected.cmpName
      }`;
      fetch(url)
        .then(res => {
          return res.json();
        })
        .then(res => {
          if (res.results.length <= 0) {
            this.pageNumber--;
            return;
          }
          this.jobs = [];
          this.displayResults(res.results); //array
        })
        .catch(err => {
          console.log(err);
        });
    },
    searchPrevious() {
      //function to call once the user clicks o previous button
      if (this.pageNumber > 1) {
        this.pageNumber--;
        this.searchJobs();
      }
    },
    searchNext() {
      //fucntion to call once the user clicks next button
      if (this.pageNumber < 10) {
        this.pageNumber++;
        this.searchJobs();
      }
    }
  }, // End methods
  created: function() {
    this.private = {
      app_id: "",
      app_key: ""
    }; //privated keys for Adzuna
    Object.seal(this.private);
    this.activeSelection = this.sel0;
    this.companySelected = JSON.parse(window.localStorage.getItem("company")); // grab the company json from the browse page
    this.searchJobs(); //immediately search for jobs
    this.fetchCompanyLogo(); //fetch the available company data from IGDB
    // Set the text in the search bar to the last searched item
    this.searchTerm = window.localStorage.getItem("searchTerm");
    this.searchObj = new Search();
  }
});
