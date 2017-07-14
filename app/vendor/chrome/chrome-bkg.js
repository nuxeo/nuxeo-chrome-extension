
var tabUrl;

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

var target = '<all_urls>';
chrome.webRequest.onCompleted.addListener(onChange, {urls: [target]});
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, pageActionOnNuxeo);
});
