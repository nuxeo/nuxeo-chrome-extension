module.exports = function () {
  this.Then('I see the version number', () => {
    browser.waitForVisible('#version');
    expect(browser.$('#version').getText().length).to.be.at.least(5);
  });

  this.Then('the copyright is up-to-date', () => {
    const date = new Date().getFullYear();
    browser.waitForVisible('#copyright');
    expect(browser.$('#copyright').getText()).to.include(date);
  });
};
