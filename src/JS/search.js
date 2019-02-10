// Wrapper for search functionality
class Search {
  // Class providing search functionality across pages
  constructor() {}
  search(searchTerm) {
    // Save search term to local storage
    window.localStorage.setItem("searchTerm", searchTerm);
    // Let the browse page know that a search was done so it can load the results
    window.localStorage.setItem("searchInitiated", "true");
    // Redirect to browsePage
    window.location.href = "../HTML/browsePage.html";
  }
}

export { Search };
