
let tabUrl;

function disableIcon(tabId) {
  chrome.browserAction.setIcon({
    path: {
      16: '../images/nuxeo-grey-16.png',
      19: '../images/nuxeo-grey-19.png',
      32: '../images/nuxeo-grey-32.png',
      38: '../images/nuxeo-grey-38.png',
    },
    tabId,
  });
}

function enableIcon(tabId) {
  chrome.browserAction.setIcon({
    path: {
      16: '../images/nuxeo-16.png',
      19: '../images/nuxeo-19.png',
      32: '../images/nuxeo-32.png',
      38: '../images/nuxeo-38.png',
    },
    tabId,
  });
}

function pageActionOnNuxeo(tabInfo) {
  const re = /.*\.nuxeo$/;
  const login = '/login.jsp';
  tabUrl = tabInfo.url;
  chrome.cookies.getAll({
    // workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1417828
    // url: tabUrl,
    name: 'JSESSIONID',
  }, (cookies) => {
    disableIcon();
    chrome.browserAction.disable(tabInfo.id);
    cookies.forEach((cookie) => {
      if ((cookie.value).match(re)
        && ((tabUrl).indexOf(login) < 0)
        // workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1417828
        && ((tabUrl).indexOf(cookie.domain) > 1)
        && ((tabUrl).indexOf(cookie.path) > 1)) {
        enableIcon();
        chrome.browserAction.enable(tabInfo.id);
      }
    });
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

function getTabToDisable(tabs) {
  if (tabs.length > 0) {
    chrome.tabs.get(tabs[0].id, disableExt);
  }
}

function onChange() {
  chrome.tabs.query({
    lastFocusedWindow: true,
    active: true,
  }, getInfoForTab);
}

function disableTabExtension() { // eslint-disable-line no-unused-vars
  chrome.tabs.query({
    lastFocusedWindow: true,
    active: true,
  }, getTabToDisable);
}

const target = '<all_urls>';
chrome.webRequest.onCompleted.addListener(onChange, { urls: [target] });
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, pageActionOnNuxeo);
});
