"use strict";
import {Search} from  './search.js';

const app = new Vue({
  el: "#app",
  data: {
    title: "GD - Sketch",
    searchTerm: "",
    searchObj: null // Reference to search class
  },
  created() {
    this.searchObj = new Search();
    this.initialize();
  },
  methods: {
    initialize() {
      // default the searchInitiaed flag to false when first visiting the side
      window.localStorage.setItem("searchInitiated", false);

      // Set the text in the search bar to the last searched item
      this.searchTerm = window.localStorage.getItem("searchTerm");
    },
    linkTo(url = "../HTML/index.html") {
      // Redirect to given address
      window.location.href = url;
    }
  } // End methods
});
