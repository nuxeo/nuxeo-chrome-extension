module.exports = function () {
  this.After(() => {
    const tabIds = browser.getTabIds();
    if (tabIds.length > 2) {
      for (let i = 2; i < tabIds.length; i += 1) {
        browser.switchTab(tabIds[i]);
        browser.close();
      }
    }
  });
};
