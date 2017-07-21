
var tabUrl;
var docUrl;

function pageActionOnNuxeo(tabInfo) {
  var re = /.*\.nuxeo$/;
  var login = /.+\/login.jsp$/;
  var isNuxeo;
  tabUrl = tabInfo.url;
  chrome.cookies.getAll({
    url: tabUrl,
    name: 'JSESSIONID'
  }, function(cookies) {
    chrome.pageAction.hide(tabInfo.id);
    cookies.forEach(function(cookie) {
      if ((cookie.value).match(re) && !(tabUrl).match(login)) {
        chrome.pageAction.show(tabInfo.id);
        return;
      }
    });
  });
}

function getInfoForTab(tabs) {
  if (tabs.length > 0) {
    chrome.tabs.get(tabs[0].id, pageActionOnNuxeo);
  }
}

function onChange(tabInfo) {
  chrome.tabs.query({lastFocusedWindow: true, active: true}, getInfoForTab);
};

var target = "<all_urls>";
chrome.webRequest.onCompleted.addListener(onChange, {urls: [target]});
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, pageActionOnNuxeo);
});

var uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
var pathPattern = /^\//;
var webuiPattern = /nuxeo\/ui\/#!\//;

function createTabs(url, tabId) {
  chrome.tabs.query({
    active: true
  }, function(tabs) {
    var index = tabs[0].index;
    chrome.tabs.create({
      url: url,
      openerTabId: tabId,
      selected: false,
      index: index + 1
    });
  });
}

function openDocFromId(id, url) {
  var onWebUI = webuiPattern.exec(tabUrl);
  nuxeo.request('/id/' + id)
    .schemas('*')
    .enrichers({ document: ['acls', 'permissions'] })
    .get()
    .then(function(doc) {
      if(onWebUI) {
        docUrl = url.concat('ui/#!/doc/' + doc.uid);
      } else {
        docUrl = url.concat('nxdoc/default/' + doc.uid + '/view_documents');
      }
      createTabs(docUrl, studioExt.server.tabId);
    })
    .catch(function(error) {
      console.log(error);
    });
}

function openDocFromPath(path, url) {
  var onWebUI = webuiPattern.exec(tabUrl);
  nuxeo.request('/path/' + path)
    .schemas('*')
    .enrichers({ document: ['acls', 'permissions'] })
    .get()
    .then(function(doc) {
      if(onWebUI) {
        docUrl = url.concat('ui/#!/doc/' + doc.uid);
      } else {
        docUrl = url.concat('nxdoc/default/' + doc.uid + '/view_documents');
      }
      createTabs(docUrl, studioExt.server.tabId);
    })
    .catch(function(error) {
      console.log(error);
    });
}

function encodeXml(str) {
  var holder = document.createElement('div');
  holder.textContent = str;
  return holder.innerHTML;
}

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    getCurrentTabUrl(function(url) {
      nuxeo = new Nuxeo({
        baseURL: url
      });
      if (((text.toUpperCase()).indexOf('SELECT ') !== -1) && ((text.toUpperCase()).indexOf(' FROM ') !== -1)) {
        var query = text.replace(/'/g, '"');
        var suggestions = [];
        nuxeo.repository()
          .schemas(['dublincore', 'common', 'uid'])
          .query({
            query: query,
            sortBy: 'dc:modified'
          })
          .then(function(res) {
            if ((res.entries).length > 0) {
              (res.entries).forEach(function(doc) {
                suggestions.push({content: doc.uid, description: '<match>' + encodeXml(doc.title) + '</match> <dim>' + encodeXml(doc.path) + '</dim>'});
              });
            }
            if ((res.entries).length > 5) {
              chrome.omnibox.setDefaultSuggestion(
                { description: "<dim>Want more results? Try the</dim> <match>fulltext searchbox</match> <dim>from the Nuxeo Dev Tools extension window.</dim>" }
              );
            }
            suggest(suggestions);
          });
      } else if (uuidPattern.test(text)) {
        openDocFromId(text, url);
      } else if (pathPattern.test(text)) {
        openDocFromPath(text, url);
      } else {
        var jsonQuery = 'SELECT * FROM Document WHERE ecm:fulltext = "' + text + '"';
        var query = jsonQuery.replace(/'/g, '"');
        var suggestions = [];
        nuxeo.repository()
          .schemas(['dublincore', 'common', 'uid'])
          .query({
            query: query,
            sortBy: 'dc:modified'
          })
          .then(function(res) {
            if ((res.entries).length > 0) {
              (res.entries).forEach(function(doc) {
                suggestions.push({content: doc.uid, description: '<match>' + encodeXml(doc.title) + '</match> <dim>' + encodeXml(doc.path) + '</dim>'});
              });
            }
            if ((res.entries).length > 5) {
              chrome.omnibox.setDefaultSuggestion(
                { description: "<dim>Want more results? Try the</dim> <match>fulltext searchbox</match> <dim>from the Nuxeo Dev Tools extension window.</dim>" }
              );
            }
            suggest(suggestions);
          });
      }
    });
  });

chrome.omnibox.onInputEntered.addListener(
  function(text) {
    getCurrentTabUrl(function(url) {
      nuxeo = new Nuxeo({
        baseURL: url
      });
      if (uuidPattern.test(text)) {
        openDocFromId(text, url);
      } else if (pathPattern.test(text)) {
        openDocFromPath(text, url);
      }
    });
  });
