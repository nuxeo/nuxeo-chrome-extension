(function (window) {
  const app = window.app = window.app || {};

  app.browser = {
    name: 'Firefox',

    getBackgroundPage: bkg => bkg(chrome.extension.getBackgroundPage()),

    createTabs: (url, tabId) => chrome.tabs.query({ active: true }, // eslint-disable-line no-unused-vars
      (tabs) => {
        const index = tabs[0].index;
        return chrome.tabs.create({
          url,
          active: false,
          index: index + 1,
        });
      }),
  };
})(window);
