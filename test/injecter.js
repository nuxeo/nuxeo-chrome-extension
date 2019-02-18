/*
Copyright 2016-2019 Nuxeo

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
