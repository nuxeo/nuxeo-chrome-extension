
var tabUrl;

function disableIcon(tabId) {
  chrome.browserAction.setIcon({ path: {
    '16': '../images/nuxeo-grey-16.png',
    '19': '../images/nuxeo-grey-19.png',
    '32': '../images/nuxeo-grey-32.png',
    '38': '../images/nuxeo-grey-38.png'
  }, tabId: tabId });
}

function enableIcon(tabId) {
  chrome.browserAction.setIcon({ path: {
    '16': '../images/nuxeo-16.png',
    '19': '../images/nuxeo-19.png',
    '32': '../images/nuxeo-32.png',
    '38': '../images/nuxeo-38.png'
  }, tabId: tabId });
}

function pageActionOnNuxeo(tabInfo) {
  var re = /.*\.nuxeo$/;
  var login = /.+\/login.jsp$/;
  var isNuxeo;
  tabUrl = tabInfo.url;
  chrome.cookies.getAll({
    url: tabUrl,
    name: 'JSESSIONID'
  }, function(cookies) {
    disableIcon();
    chrome.browserAction.disable(tabInfo.id);
    cookies.forEach(function(cookie) {
      if((cookie.value).match(re) && !(tabUrl).match(login)) {
        enableIcon();
        chrome.browserAction.enable(tabInfo.id);
        return;
      }
    })
  });
}

function disableExt(tabInfo) {
  disableIcon();
  chrome.browserAction.disable(tabInfo.id);
}

function getInfoForTab(tabs) {
  if (tabs.length > 0) {
    chrome.tabs.get(tabs[0].id, pageActionOnNuxeo);
  }
}

getTabToDisable(tabs) {
  if (tabs.length > 0) {
    chrome.tabs.get(tabs[0].id, disableExt);
}

function onChange(tabInfo) {
  chrome.tabs.query({lastFocusedWindow: true, active: true}, getInfoForTab);
};

function disableTabExtension() {
  chrome.tabs.query({lastFocusedWindow: true, active: true}, getTabToDisable);
}

var target = "<all_urls>";
chrome.webRequest.onCompleted.addListener(onChange, {urls: [target]});
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, pageActionOnNuxeo);
});
