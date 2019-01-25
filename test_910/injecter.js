// Assume we are alwayd working on localhost:8080
chrome.tabs.query.yields([{
  url: 'http://localhost:8080/nuxeo/view_documents.faces?conversationId=0NXMAIN',
  id: 1
}]);

// Background.js is injected inside base page, so those methods are accessible from window object
chrome.runtime.getBackgroundPage.yields(window);

// Force Basic Auth on all Nuxeo Request
window.app = {
  auth: {
    method: 'basic',
    username: 'Administrator',
    password: 'Administrator',
  }
};

// Add some line to parse and eval a query parameter.
// XXX TODO
