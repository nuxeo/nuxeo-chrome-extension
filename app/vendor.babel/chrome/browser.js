(function (window) {
  const app = window.app = window.app || {};

  app.browser = {
    name: 'Chrome',

    getBackgroundPage: cb => chrome.runtime.getBackgroundPage(cb),

    createTabs: (url, tabId) => chrome.tabs.query({ active: true },
      (tabs) => {
        const index = tabs[0].index;
        chrome.tabs.create({
          url,
          openerTabId: tabId,
          selected: false,
          index: index + 1,
        });
      }),
  };
})(window);
